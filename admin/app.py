from flask import Flask, request, jsonify 
import mysql.connector
from db_config import db_config
from flask_cors import CORS
import bcrypt
from mysql.connector import Error
import base64
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None

@app.route('/products', methods=['GET'])
def get_products():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT product_id, name, description, price, category, quantity, image_data FROM Products")
        products = cursor.fetchall()
        
        # Convert BLOB to base64 string
        for product in products:
            if product['image_data']:
                product['image_data'] = base64.b64encode(product['image_data']).decode('utf-8')
        
        return jsonify(products)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT product_id, name, description, price, category, quantity, image_data FROM Products WHERE product_id = %s", (product_id,))
        product = cursor.fetchone()
        
        if product and product['image_data']:
            product['image_data'] = base64.b64encode(product['image_data']).decode('utf-8')
        
        return jsonify(product) if product else (jsonify({"error": "Product not found"}), 404)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/products', methods=['POST'])
def add_product():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400
    
    if file.content_length and file.content_length > MAX_FILE_SIZE:
        return jsonify({"error": "File size too large"}), 400

    try:
        image_data = file.read()
        cursor = connection.cursor()
        
        query = """
        INSERT INTO Products (name, description, price, image_data, category, quantity)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        values = (
            request.form.get('name'),
            request.form.get('description'),
            float(request.form.get('price')),
            image_data,
            request.form.get('category'),
            float(request.form.get('quantity', 0))
        )
        
        cursor.execute(query, values)
        connection.commit()
        
        return jsonify({
            "message": "Product added successfully",
            "product_id": cursor.lastrowid
        }), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor()
        
        # Start building the query and values
        update_fields = []
        values = []
        
        # Handle regular form fields
        fields = ['name', 'description', 'price', 'category', 'quantity']
        for field in fields:
            if field in request.form:
                update_fields.append(f"{field} = %s")
                value = request.form[field]
                if field in ['price', 'quantity']:  # Handle both price and quantity as float
                    value = float(value)
                values.append(value)
        
        # Handle image file if provided
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '' and allowed_file(file.filename):
                image_data = file.read()
                update_fields.append("image_data = %s")
                values.append(image_data)
        
        if not update_fields:
            return jsonify({"error": "No fields to update"}), 400
        
        # Complete the query
        query = f"UPDATE Products SET {', '.join(update_fields)} WHERE product_id = %s"
        values.append(product_id)
        
        cursor.execute(query, values)
        connection.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Product not found"}), 404
        
        return jsonify({"message": "Product updated successfully"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    except ValueError as err:
        return jsonify({"error": f"Invalid value: {str(err)}"}), 400
    finally:
        cursor.close()
        connection.close()

# Route to login as an admin
@app.route('/login-admin', methods=['POST'])
def login_admin():
    data = request.get_json()
    print("Received data:", data)  # Debug: Print received data

    # Validate required fields
    required_fields = ['email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    email = data.get('email')
    password = data.get('password')

    # Fetch the admin from the database
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM admins WHERE email = %s", (email,))
    admin = cursor.fetchone()

    if not admin:
        cursor.close()
        connection.close()
        return jsonify({"error": "Admin not found"}), 404

    # Verify the password
    stored_hashed_password = admin['password_hash'].encode('utf-8')
    if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password):
        cursor.close()
        connection.close()
        return jsonify({"message": "Admin login successful"}), 200
    else:
        cursor.close()
        connection.close()
        return jsonify({"error": "Invalid password"}), 401

@app.route('/orders', methods=['GET'])
def get_orders():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        
        # Base query without any filters
        query = """
            SELECT 
                Orders.order_id,
                Users.name AS customer_name,
                Users.email,
                Users.phone,
                Orders.order_status,
                Orders.total_price,
                Orders.payment_status,
                Orders.advance_payment,
                Orders.delivery_type,
                Orders.delivery_address,
                Orders.map_link,
                Products.name AS product_name,
                Order_Items.quantity,
                Order_Items.price AS item_price
            FROM 
                Orders
            LEFT JOIN 
                Users ON Orders.user_id = Users.user_id
            LEFT JOIN 
                Order_Items ON Orders.order_id = Order_Items.order_id
            LEFT JOIN 
                Products ON Order_Items.product_id = Products.product_id
        """

        params = []
        
        # Print received parameters for debugging
        print("Received filter parameters:", request.args)

        # Only add WHERE clause if filters are present
        if request.args:
            query += " WHERE 1=1"

            if 'delivery_type' in request.args:
                delivery_type = request.args['delivery_type'].lower()
                query += " AND LOWER(COALESCE(Orders.delivery_type, '')) = %s"
                params.append(delivery_type)
                print(f"Adding delivery_type filter: {delivery_type}")

            if 'order_status' in request.args:
                order_status = request.args['order_status'].lower()
                query += " AND LOWER(COALESCE(Orders.order_status, 'pending')) = %s"
                params.append(order_status)
                print(f"Adding order_status filter: {order_status}")

            if 'payment_status' in request.args:
                payment_status = request.args['payment_status'].lower()
                query += " AND LOWER(COALESCE(Orders.payment_status, 'not paid')) = %s"
                params.append(payment_status)
                print(f"Adding payment_status filter: {payment_status}")

        # Print final query and parameters for debugging
        print("Executing query:", query)
        print("With parameters:", params)

        cursor.execute(query, params)
        orders = cursor.fetchall()
        
        # Convert None values to defaults and format numeric values
        for order in orders:
            order['order_status'] = order['order_status'] or 'pending'
            order['payment_status'] = order['payment_status'] or 'not paid'
            order['delivery_type'] = order['delivery_type'] or ''
            
            # Format numeric values
            order['total_price'] = float(order['total_price']) if order['total_price'] else 0.00
            order['advance_payment'] = float(order['advance_payment']) if order['advance_payment'] else 0.00
            order['item_price'] = float(order['item_price']) if order['item_price'] else 0.00
        
        # Print number of orders found
        print(f"Found {len(orders)} orders matching filters")
        
        return jsonify(orders)
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/update_status', methods=['PUT'])
def update_order_status():
    """Update order status to 'shipped' or 'delivered' in MySQL"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    data = request.json
    order_id = data.get("order_id")
    new_status = data.get("new_status")

    # Allowed statuses
    allowed_statuses = ["shipped", "delivered"]
    if new_status not in allowed_statuses:
        return jsonify({"error": "Invalid status. Allowed: 'shipped', 'delivered'"}), 400

    try:
        cursor = connection.cursor()
        query = "UPDATE Orders SET order_status = %s WHERE order_id = %s"
        cursor.execute(query, (new_status, order_id))
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Order not found"}), 404
        
        return jsonify({"message": f"Order {order_id} updated to {new_status}"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM Products WHERE product_id = %s", (product_id,))
        connection.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Product not found"}), 404
            
        return jsonify({"message": "Product deleted successfully"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status_endpoint(order_id):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    data = request.json
    new_status = data.get('status')
    
    # Validate the new status
    allowed_statuses = ["pending", "order confirmation", "baked", "shipped", "delivered"]
    if not new_status or new_status not in allowed_statuses:
        return jsonify({"error": f"Invalid status. Allowed values are: {', '.join(allowed_statuses)}"}), 400

    try:
        cursor = connection.cursor()
        query = "UPDATE Orders SET order_status = %s WHERE order_id = %s"
        cursor.execute(query, (new_status, order_id))
        connection.commit()
        
        if cursor.rowcount > 0:
            return jsonify({"success": True, "message": "Order status updated successfully"})
        else:
            return jsonify({"error": "Order not found"}), 404
            
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/orders/<int:order_id>/payment-status', methods=['PUT'])
def update_payment_status(order_id):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    data = request.json
    new_status = data.get('payment_status')
    
    # Validate the new status
    allowed_statuses = ["not paid", "advance paid", "full paid"]
    if not new_status or new_status not in allowed_statuses:
        return jsonify({"error": f"Invalid status. Allowed values are: {', '.join(allowed_statuses)}"}), 400

    try:
        cursor = connection.cursor()
        query = "UPDATE Orders SET payment_status = %s WHERE order_id = %s"
        cursor.execute(query, (new_status, order_id))
        connection.commit()
        
        if cursor.rowcount > 0:
            return jsonify({"success": True, "message": "Payment status updated successfully"})
        else:
            return jsonify({"error": "Order not found"}), 404
            
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5001)