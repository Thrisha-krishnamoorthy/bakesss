from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
import bcrypt
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',  # Replace with your MySQL username
    'password': 'Thrisha',  # Replace with your MySQL password
    'database': 'bakes_db'  # Ensure this database exists
}

# Function to establish a database connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            print("Connected to MySQL database")
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Route to register a new user
@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    # Validate required fields
    required_fields = ['name', 'email', 'phone', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    address = data.get('address', '')  # Optional field
    role = data.get('role', 'user')  # Default role is 'user'
    password = data.get('password')

    # Hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

    # Check if the email already exists
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT email FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        connection.close()
        return jsonify({"error": f"User with email {email} already exists"}), 400

    # Insert the new user
    query = "INSERT INTO users (name, email, phone, address, role, password_hash) VALUES (%s, %s, %s, %s, %s, %s)"
    values = (name, email, phone, address, role, hashed_password.decode('utf-8'))  # Store the hashed password

    try:
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"message": "User registered successfully"}), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500

# Additional routes for login, order placement, etc. can be added here

@app.route('/products', methods=['GET'])
def get_products():
    print("Received GET request for products")  # Debug log
    connection = get_db_connection()
    if not connection:
        print("Database connection failed")  # Debug log
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM products"
        cursor.execute(query)
        products = cursor.fetchall()
        print(f"Found {len(products)} products")  # Debug log
        cursor.close()
        connection.close()
        return jsonify(products)
    except Error as e:
        print(f"Database error: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500


@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    print("Received data:", data)  # Debug: Print received data

    # Validate required fields
    required_fields = ['email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    email = data.get('email')
    password = data.get('password')

    # Fetch the user from the database
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        connection.close()
        return jsonify({"error": "User not found"}), 404

    # Verify the password
    stored_hashed_password = user['password_hash'].encode('utf-8')
    if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password):
        cursor.close()
        connection.close()
        return jsonify({"message": "User login successful"}), 200
    else:
        cursor.close()
        connection.close()
        return jsonify({"error": "Invalid password"}), 401


@app.route('/update-product-quantity', methods=['POST'])
def update_product_quantity():
    data = request.get_json()
    print("Received data:", data)  # Debugging

    required_fields = ['product_id', 'quantity']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    product_id = data['product_id']
    quantity = data['quantity']

    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor()
    
    try:
        query = """UPDATE products 
                   SET quantity = %s, 
                       status = CASE WHEN %s = 0 THEN 'out_of_stock' ELSE 'in_stock' END 
                   WHERE product_id = %s"""
        values = (quantity, quantity, product_id)
        cursor.execute(query, values)
        connection.commit()
        
        return jsonify({"message": "Product quantity updated successfully"}), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/orders', methods=['POST'])
def place_order():
    data = request.get_json()
    
    # Validate input data
    if not data or 'email' not in data or 'items' not in data:
        return jsonify({"error": "Missing required fields (email, items)"}), 400

    email = data['email']
    items = data['items']

    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Get user_id from email
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_id = user['user_id']

        # Validate product stock before processing
        for item in items:
            product_id, quantity = item['product_id'], item['quantity']

            cursor.execute("SELECT quantity FROM products WHERE product_id = %s", (product_id,))
            product = cursor.fetchone()

            if not product:
                return jsonify({"error": f"Product with ID {product_id} does not exist"}), 400

            if product['quantity'] < quantity:
                return jsonify({"error": f"Insufficient stock for product ID {product_id}"}), 400

        # Calculate total price
        total_price = sum(item['price'] * item['quantity'] for item in items)
        delivery_type = data.get('delivery_type', 'delivery')
        delivery_address = data.get('delivery_address', '')

        # Insert order into database
        cursor.execute(
            "INSERT INTO orders (user_id, total_price, delivery_type, delivery_address) VALUES (%s, %s, %s, %s)",
            (user_id, total_price, delivery_type, delivery_address)
        )
        order_id = cursor.lastrowid

        # Insert order items and update stock manually
        for item in items:
            product_id, quantity, price = item['product_id'], item['quantity'], item['price']

            cursor.execute(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)",
                (order_id, product_id, quantity, price)
            )

            # Reduce product quantity **without triggers**
            cursor.execute(
                "UPDATE products SET quantity = quantity - %s WHERE product_id = %s",
                (quantity, product_id)
            )

            # Check if product is out of stock after update
            cursor.execute("SELECT quantity FROM products WHERE product_id = %s", (product_id,))
            updated_product = cursor.fetchone()
            if updated_product['quantity'] == 0:
                cursor.execute("UPDATE products SET status = 'out_of_stock' WHERE product_id = %s", (product_id,))

        connection.commit()
        return jsonify({"message": "Order placed successfully", "order_id": order_id}), 201

    except mysql.connector.Error as e:
        connection.rollback()  # Rollback if any error occurs
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()

@app.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    required_fields = ['name', 'description', 'price', 'category', 'quantity']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    name = data.get('name')
    description = data.get('description')
    price = float(data.get('price'))  # Ensure price is float
    image_url = data.get('image_url', '')
    category = data.get('category')
    quantity = int(data.get('quantity'))  # Ensure quantity is integer

    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO products 
            (name, description, price, image_url, category, quantity, status) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            name, 
            description, 
            price, 
            image_url, 
            category, 
            quantity, 
            'in_stock' if quantity > 0 else 'out_of_stock'
        )
        
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"message": "Product added successfully"}), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server on port 5000...")
    app.run(debug=True, host='0.0.0.0', port=5000) 
















