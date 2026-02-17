from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database file path - will persist between restarts
DB_PATH = 'trustbank.db'

# ========================================
# DATABASE SETUP
# ========================================
def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with tables"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'USER',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Loan applications table
    c.execute('''
        CREATE TABLE IF NOT EXISTS loan_applications (
            application_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            age INTEGER NOT NULL,
            loan_amount REAL NOT NULL,
            loan_duration INTEGER NOT NULL,
            installment_rate REAL NOT NULL,
            employment_duration REAL NOT NULL,
            job INTEGER NOT NULL,
            ml_risk TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database initialized at: {os.path.abspath(DB_PATH)}")

def create_default_officer():
    """Create default officer account on startup"""
    officer_username = "sameer syed"
    officer_password = hashlib.sha256("sameer".encode()).hexdigest()
    
    conn = get_db_connection()
    c = conn.cursor()
    
    # Check if officer already exists
    c.execute('SELECT id, role FROM users WHERE username=?', (officer_username,))
    existing = c.fetchone()
    
    if existing:
        # Update to OFFICER role if user exists
        if existing['role'] != 'OFFICER':
            c.execute('UPDATE users SET role=?, password=? WHERE username=?', 
                     ('OFFICER', officer_password, officer_username))
            conn.commit()
            print(f"✓ Updated '{officer_username}' to OFFICER role")
        else:
            print(f"✓ Officer account already exists: '{officer_username}'")
    else:
        # Create new officer account
        try:
            c.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                     (officer_username, officer_password, 'OFFICER'))
            conn.commit()
            print(f"✓ Created default OFFICER account: '{officer_username}'")
            print(f"   Username: {officer_username}")
            print(f"   Password: sameer")
        except Exception as e:
            print(f"✗ Error creating officer: {e}")
    
    conn.close()

# ========================================
# AUTH ENDPOINTS
# ========================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = hashlib.sha256(data.get('password').encode()).hexdigest()
    role = data.get('role', 'USER')
    
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                  (username, password, role))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Username already exists'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = hashlib.sha256(data.get('password').encode()).hexdigest()
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, role, username FROM users WHERE username=? AND password=?',
              (username, password))
    user = c.fetchone()
    conn.close()
    
    if user:
        return jsonify({
            'message': 'Login successful',
            'user_id': user['id'],
            'role': user['role'],
            'username': user['username']
        }), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/auth/officer-login', methods=['POST'])
def officer_login():
    data = request.json
    username = data.get('username')
    password = hashlib.sha256(data.get('password').encode()).hexdigest()
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, role, username FROM users WHERE username=? AND password=? AND role=?',
              (username, password, 'OFFICER'))
    user = c.fetchone()
    conn.close()
    
    if user:
        return jsonify({
            'message': 'Officer login successful',
            'user_id': user['id'],
            'role': user['role'],
            'username': user['username']
        }), 200
    else:
        return jsonify({'message': 'You are not an officer'}), 403

@app.route('/api/auth/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, username, role FROM users WHERE id=?', (user_id,))
    user = c.fetchone()
    conn.close()
    
    if user:
        return jsonify(dict(user)), 200
    else:
        return jsonify({'message': 'User not found'}), 404

# ========================================
# LOAN ENDPOINTS
# ========================================

@app.route('/api/loan/apply', methods=['POST'])
def apply_loan():
    data = request.json
    
    # Validate required fields
    required_fields = ['user_id', 'age', 'credit_amount', 'loan_duration', 
                       'installment_rate', 'employment_duration', 'job']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Validate age
    if data['age'] < 18:
        return jsonify({'message': 'Age must be 18 or above'}), 400
    
    # Simple ML risk calculation
    age = int(data['age'])
    credit_amount = float(data['credit_amount'])
    employment_duration = float(data['employment_duration'])
    
    # Basic risk assessment logic
    risk_score = 0
    if age < 25:
        risk_score += 2
    if credit_amount > 100000:
        risk_score += 2
    if employment_duration < 2:
        risk_score += 2
    
    ml_risk = 'Low' if risk_score <= 2 else 'High'
    
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''
            INSERT INTO loan_applications 
            (user_id, age, loan_amount, loan_duration, installment_rate, 
             employment_duration, job, ml_risk, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        ''', (
            int(data['user_id']),
            int(data['age']),
            float(data['credit_amount']),
            int(data['loan_duration']),
            float(data['installment_rate']),
            float(data['employment_duration']),
            int(data['job']),
            ml_risk
        ))
        conn.commit()
        app_id = c.lastrowid
        conn.close()
        
        print(f"New loan application created: ID={app_id}, User={data['user_id']}, Amount={data['credit_amount']}")
        
        return jsonify({
            'message': 'Application submitted successfully',
            'application_id': app_id,
            'ml_risk': ml_risk
        }), 201
    except Exception as e:
        print(f"Error creating loan application: {str(e)}")
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@app.route('/api/loan/my-applications/<int:user_id>', methods=['GET'])
def get_my_applications(user_id):
    print(f"Fetching applications for user_id: {user_id}")
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT * FROM loan_applications 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ''', (user_id,))
    apps = [dict(row) for row in c.fetchall()]
    conn.close()
    
    print(f"Found {len(apps)} applications for user {user_id}")
    
    return jsonify(apps), 200

@app.route('/api/loan/all', methods=['GET'])
def get_all_loans():
    conn = get_db_connection()
    c = conn.cursor()
    
    # JOIN with users table to get username
    c.execute('''
        SELECT 
            l.application_id,
            l.user_id,
            l.age,
            l.loan_amount,
            l.loan_duration,
            l.installment_rate,
            l.employment_duration,
            l.job,
            l.ml_risk,
            l.status,
            l.created_at,
            u.username
        FROM loan_applications l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
    ''')
    
    loans = [dict(row) for row in c.fetchall()]
    conn.close()
    
    print(f"Returning {len(loans)} total loan applications")
    
    return jsonify(loans), 200

@app.route('/api/loan/update-status', methods=['PUT'])
def update_status():
    data = request.json
    app_id = data.get('application_id')
    status = data.get('status')
    
    if status not in ['Pending', 'Approved', 'Rejected']:
        return jsonify({'message': 'Invalid status'}), 400
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE loan_applications SET status=? WHERE application_id=?',
              (status, app_id))
    conn.commit()
    conn.close()
    
    print(f"Updated application {app_id} status to {status}")
    
    return jsonify({'message': 'Status updated successfully'}), 200

# ========================================
# MAIN
# ========================================
if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Create default officer account
    create_default_officer()
    
    # Run the app
    print("\n" + "="*50)
    print("🏦 TrustBank Server Started")
    print("="*50)
    print(f"📁 Database: {os.path.abspath(DB_PATH)}")
    print(f"🔐 Officer Login Credentials:")
    print(f"   Username: sameer syed")
    print(f"   Password: sameer")
    print("="*50 + "\n")
    
    app.run(debug=True, port=5000, host='127.0.0.1')
