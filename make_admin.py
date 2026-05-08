#!/usr/bin/env python
import sqlite3
import hashlib
import os
import sys
from datetime import datetime

db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if user exists
cursor.execute("SELECT id FROM auth_user WHERE username = 'admin'")
if cursor.fetchone():
    print("Admin already exists")
else:
    # Create password hash (pbkdf2_sha256$...)
    # For "admin123" - simplified approach
    password = 'admin123'
    from base64 import urlsafe_b64encode
    import binascii
    
    # Using Django's make_password equivalent
    import hashlib
    salt = hashlib.gensalt().decode('utf-8')
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 480000).hex().encode()
    encoded = urlsafe_b64encode(password_hash).decode()
    full_hash = f"pbkdf2_sha256${salt}${encoded}"
    
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    cursor.execute(f"""
        INSERT INTO auth_user (password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined)
        VALUES ('{full_hash}', '{now}', 1, 'admin', '', '', 'admin@example.com', 1, 1, '{now}')
    """)
    conn.commit()
    print("Superuser created: admin / admin123")
    
conn.close()