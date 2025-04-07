from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
import bcrypt
from flask_cors import CORS
import os

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

    # Validate role
    if role not in ['user', 'admin']:
        return jsonify({"error": "Invalid role"}), 400

    # Hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

    # Check if the email or phone already exists
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT email, phone FROM users WHERE email = %s OR phone = %s", (email, phone))
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        connection.close()
        if existing_user.get('email') == email:
            return jsonify({"error": f"User with email {email} already exists"}), 400
        elif existing_user.get('phone') == phone:
            return jsonify({"error": f"User with phone {phone} already exists"}), 400

    # Insert the new user
    query = """
    INSERT INTO users (name, email, phone, address, role, password_hash)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    values = (name, email, phone, address, role, hashed_password.decode('utf-8'))  # Store the hashed password

    try:
        cursor.execute(query, values)
        connection.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

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
    delivery_type = data.get('delivery_type', 'delivery')
    delivery_address = data.get('delivery_address', '')
    map_link = data.get('map_link', '')  # Get map_link from request
    payment_method = data.get('payment_method', 'cod')
    advance_payment = data.get('advance_payment', 0)

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

        # Insert order into database
        cursor.execute(
            """INSERT INTO orders (
                user_id, total_price, delivery_type, delivery_address, map_link,
                payment_method, advance_payment, order_status, payment_status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                user_id, total_price, delivery_type, delivery_address, map_link,
                payment_method, advance_payment, 
                'pending', 'not paid'  # Always set as 'not paid' initially
            )
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
    
@app.route('/orders/user/email/<string:email>', methods=['GET'])
def fetch_orders_by_email(email):
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        
        # First get the user_id from email
        user_query = "SELECT user_id FROM users WHERE email = %s"
        cursor.execute(user_query, (email,))
        user_result = cursor.fetchone()
        
        if not user_result:
            return jsonify({"error": "User not found"}), 404
            
        user_id = user_result['user_id']
        
        # Then get the orders using the user_id with more product details
        query = """
        SELECT o.order_id, o.order_status, o.total_price, o.payment_status, 
               o.delivery_type, o.delivery_address, o.map_link,
               oi.product_id, p.name AS product_name, p.status AS product_status,
               p.image_url, oi.quantity, oi.price as item_price,
               o.created_at as date
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.user_id = %s
        ORDER BY o.created_at DESC
        """
        cursor.execute(query, (user_id,))
        order_details = cursor.fetchall()
        
        if not order_details:
            return jsonify([]), 200
            
        # Process the results to group by order_id
        orders = {}
        for item in order_details:
            order_id = item['order_id']
            if order_id not in orders:
                orders[order_id] = {
                    'order_id': order_id,
                    'order_status': item['order_status'],
                    'total_price': float(item['total_price']),
                    'payment_status': item['payment_status'],
                    'delivery_type': item['delivery_type'],
                    'delivery_address': item['delivery_address'],
                    'map_link': item['map_link'],
                    'date': item['date'].strftime('%Y-%m-%d %H:%M:%S'),
                    'products': []
                }
            
            orders[order_id]['products'].append({
                'product_id': item['product_id'],
                'product_name': item['product_name'],
                'product_status': item['product_status'],
                'image_url': item['image_url'],
                'quantity': item['quantity'],
                'price': float(item['item_price'])
            })
        
        return jsonify(list(orders.values())), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# Route to get order details by ID
@app.route('/orders/details/<int:order_id>', methods=['GET'])
def fetch_order_details(order_id):
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        
        # First check if the order exists
        check_query = "SELECT * FROM orders WHERE order_id = %s"
        cursor.execute(check_query, (order_id,))
        order = cursor.fetchone()
        
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        # Get order details with product information
        query = """
        SELECT o.order_id, o.order_status, o.total_price, o.payment_status, o.created_at as date,
               o.delivery_type, o.delivery_address, o.map_link,
               oi.product_id, p.name AS product_name, p.status AS product_status, p.image_url,
               oi.quantity, oi.price as item_price
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE o.order_id = %s
        """
        cursor.execute(query, (order_id,))
        order_details = cursor.fetchall()

        if not order_details:
            # If no products found, return basic order info
            return jsonify({
                "order_id": order["order_id"],
                "order_status": order["order_status"],
                "total_price": float(order["total_price"]),
                "payment_status": order["payment_status"],
                "date": order["created_at"].strftime('%Y-%m-%d %H:%M:%S'),
                "delivery_type": order["delivery_type"],
                "delivery_address": order["delivery_address"],
                "map_link": order["map_link"],
                "products": []
            }), 200

        # Format the order with all product details
        order_info = {
            "order_id": order_details[0]["order_id"],
            "order_status": order_details[0]["order_status"],
            "total_price": float(order_details[0]["total_price"]),
            "payment_status": order_details[0]["payment_status"],
            "date": order_details[0]["date"].strftime('%Y-%m-%d %H:%M:%S'),
            "delivery_type": order_details[0]["delivery_type"],
            "delivery_address": order_details[0]["delivery_address"],
            "map_link": order_details[0]["map_link"],
            "products": []
        }

        for row in order_details:
            if row['product_id'] is not None:  # Check if product exists
                order_info["products"].append({
                    "product_id": row['product_id'],
                    "product_name": row['product_name'],
                    "product_status": row['product_status'],
                    "image_url": row['image_url'],
                    "quantity": row['quantity'],
                    "price": float(row['item_price'])
                })

        return jsonify(order_info), 200

    except Exception as e:
        print(f"Error fetching order details: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()



if __name__ == '__main__':
    print("Starting Flask server on port 5000...")
    # For development, we'll use HTTP to avoid certificate issues
    app.run(debug=True, host='0.0.0.0', port=5000)
    
    # Uncomment this to use HTTPS once you have proper certificates
    # cert_path = 'flask_certs/cert.pem'
    # key_path = 'flask_certs/key.pem'
    # 
    # if os.path.exists(cert_path) and os.path.exists(key_path):
    #     print("Using SSL certificates for HTTPS")
    #     app.run(
    #         debug=True, 
    #         host='0.0.0.0', 
    #         port=5000,
    #         ssl_context=(cert_path, key_path)
    #     )
    # else:
    #     print("SSL certificates not found. Running in HTTP mode.")
    #     print("To enable HTTPS, run 'python generate_flask_cert.py' to create certificates.")
    #     app.run(debug=True, host='0.0.0.0', port=5000)
