
# import sqlite3
# import hashlib

# class UserDatabase:
#     def __init__(self, db_path='users.db'):
#         self.conn = sqlite3.connect(db_path, check_same_thread=False)
#         self.create_tables()
#         self.initialize_users()

#     def create_tables(self):
#         cursor = self.conn.cursor()
#         cursor.execute('''
#             CREATE TABLE IF NOT EXISTS users (
#                 id INTEGER PRIMARY KEY,
#                 username TEXT UNIQUE NOT NULL,
#                 password TEXT NOT NULL,
#                 role TEXT NOT NULL
#             )
#         ''')
#         self.conn.commit()

#     def initialize_users(self):
#         cursor = self.conn.cursor()
        
#         # Check if users exist
#         cursor.execute("SELECT COUNT(*) FROM users")
#         if cursor.fetchone()[0] == 0:
#             # Hash passwords
#             admin_pass = self.hash_password('adminpass')
#             tester_pass = self.hash_password('testerpass')
            
#             # Insert default users
#             users = [
#                 ('admin', admin_pass, 'admin'),
#                 ('tester', tester_pass, 'tester')
#             ]
            
#             cursor.executemany(
#                 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
#                 users
#             )
#             self.conn.commit()

#     def hash_password(self, password):
#         return hashlib.sha256(password.encode()).hexdigest()

#     def validate_user(self, username, password):
#         cursor = self.conn.cursor()
#         hashed_password = self.hash_password(password)
        
#         cursor.execute(
#             'SELECT role FROM users WHERE username = ? AND password = ?', 
#             (username, hashed_password)
#         )
#         result = cursor.fetchone()
        
#         return result[0] if result else None

import sqlite3
import hashlib
from datetime import datetime

class UserDatabase:
    def __init__(self, db_path='users.db'):
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.create_tables()
        self.initialize_users()

    def create_tables(self):
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'tester',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        self.conn.commit()

    def initialize_users(self):
        cursor = self.conn.cursor()
        
        # Check if users exist
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            # Hash passwords for default tester users
            tester1_pass = self.hash_password('tester123')
            tester2_pass = self.hash_password('tester456')
            
            # Insert default tester users (only tester role)
            users = [
                ('tester1', tester1_pass, 'tester'),
                ('tester2', tester2_pass, 'tester')
            ]
            
            cursor.executemany(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
                users
            )
            self.conn.commit()
            
    # Add this method to the UserDatabase class in database.py

    def create_user(self, username, password, role='tester'):
        """
        Create a new user account
        
        :param username: Username for the new account
        :param password: Plain text password (will be hashed)
        :param role: User role (defaults to 'tester')
        :return: User ID of created user or None if creation failed
        """
        cursor = self.conn.cursor()
        
        try:
            # Check if username already exists
            cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
            if cursor.fetchone():
                raise ValueError(f"Username '{username}' already exists")
            
            # Hash the password
            hashed_password = self.hash_password(password)
            
            # Insert new user
            cursor.execute('''
                INSERT INTO users (username, password, role, created_at)
                VALUES (?, ?, ?, ?)
            ''', (username, hashed_password, role, datetime.now().isoformat()))
            
            user_id = cursor.lastrowid
            self.conn.commit()
            return user_id
            
        except sqlite3.IntegrityError:
            raise ValueError(f"Username '{username}' already exists")
        except Exception as e:
            self.conn.rollback()
            raise e

    def username_exists(self, username):
        """
        Check if a username already exists
        
        :param username: Username to check
        :return: True if username exists, False otherwise
        """
        cursor = self.conn.cursor()
        cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
        return cursor.fetchone() is not None

    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()

    def validate_user(self, username, password):
        cursor = self.conn.cursor()
        hashed_password = self.hash_password(password)
        
        cursor.execute(
            'SELECT id, role FROM users WHERE username = ? AND password = ?', 
            (username, hashed_password)
        )
        result = cursor.fetchone()
        
        return {'user_id': result[0], 'role': result[1]} if result else None
    
    
    def update_user_profile(self, user_id, username=None, password=None):
        cursor = self.conn.cursor()
        
        try:
            update_fields = []
            values = []
            
            if username:
                # Check if new username already exists (excluding current user)
                cursor.execute('SELECT id FROM users WHERE username = ? AND id != ?', (username, user_id))
                if cursor.fetchone():
                    raise ValueError(f"Username '{username}' already exists")
                
                update_fields.append("username = ?")
                values.append(username)
            
            if password:
                hashed_password = self.hash_password(password)
                update_fields.append("password = ?")
                values.append(hashed_password)
            
            if not update_fields:
                return False
            
            values.append(user_id)
            
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, values)
            
            self.conn.commit()
            return cursor.rowcount > 0
            
        except ValueError:
            raise
        except Exception as e:
            self.conn.rollback()
            raise e


    def get_user_by_username(self, username):
        cursor = self.conn.cursor()
        cursor.execute(
            'SELECT id, username, role, created_at FROM users WHERE username = ?', 
            (username,)
        )
        result = cursor.fetchone()
        
        if result:
            return {
                'id': result[0],
                'username': result[1], 
                'role': result[2],
                'created_at': result[3]
            }
        return None

    def get_all_users(self):
        cursor = self.conn.cursor()
        cursor.execute('SELECT id, username, role, created_at FROM users')
        results = cursor.fetchall()
        
        return [{
            'id': row[0],
            'username': row[1],
            'role': row[2],
            'created_at': row[3]
        } for row in results]
        
    

class ReportDatabase:
    def __init__(self, db_path='reports.db'):
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.create_tables()

    def create_tables(self):
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY,
                report_id TEXT UNIQUE NOT NULL,
                target_ip TEXT NOT NULL,
                generated_at TIMESTAMP NOT NULL,
                total_vulnerabilities INTEGER NOT NULL DEFAULT 0,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        self.conn.commit()

    def create_report(self, report_id, target_ip, generated_at, total_vulnerabilities, user_id):
        """
        Create a new vulnerability report entry
        
        :param report_id: Unique report identifier (e.g., VULN_1234567890)
        :param target_ip: IP address of the scanned target
        :param generated_at: ISO timestamp when report was generated
        :param total_vulnerabilities: Total number of vulnerabilities found
        :param user_id: ID of the user who generated the report
        :return: Database row ID of the created report
        """
        cursor = self.conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO reports (report_id, target_ip, generated_at, total_vulnerabilities, user_id)
                VALUES (?, ?, ?, ?, ?)
            ''', (report_id, target_ip, generated_at, total_vulnerabilities, user_id))
            
            db_id = cursor.lastrowid
            self.conn.commit()
            return db_id
        except sqlite3.IntegrityError as e:
            # Handle duplicate report_id
            raise ValueError(f"Report ID {report_id} already exists") from e

    def get_reports_by_user(self, user_id):
        """Get all reports for a specific user"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT id, report_id, target_ip, generated_at, total_vulnerabilities
            FROM reports 
            WHERE user_id = ?
            ORDER BY generated_at DESC
        ''', (user_id,))
        
        results = cursor.fetchall()
        return [{
            'id': row[0],
            'report_id': row[1],
            'target_ip': row[2],
            'generated_at': row[3],
            'total_vulnerabilities': row[4]
        } for row in results]

    def get_report_by_id(self, report_id, user_id=None):
        """Get a specific report by report_id"""
        cursor = self.conn.cursor()
        if user_id:
            # Ensure user can only access their own reports
            cursor.execute('''
                SELECT id, report_id, target_ip, generated_at, total_vulnerabilities, user_id
                FROM reports 
                WHERE report_id = ? AND user_id = ?
            ''', (report_id, user_id))
        else:
            cursor.execute('''
                SELECT id, report_id, target_ip, generated_at, total_vulnerabilities, user_id
                FROM reports 
                WHERE report_id = ?
            ''', (report_id,))
        
        result = cursor.fetchone()
        if result:
            return {
                'id': result[0],
                'report_id': result[1],
                'target_ip': result[2],
                'generated_at': result[3],
                'total_vulnerabilities': result[4],
                'user_id': result[5]
            }
        return None

    def get_report_by_db_id(self, db_id, user_id=None):
        """Get a specific report by database ID"""
        cursor = self.conn.cursor()
        if user_id:
            # Ensure user can only access their own reports
            cursor.execute('''
                SELECT id, report_id, target_ip, generated_at, total_vulnerabilities, user_id
                FROM reports 
                WHERE id = ? AND user_id = ?
            ''', (db_id, user_id))
        else:
            cursor.execute('''
                SELECT id, report_id, target_ip, generated_at, total_vulnerabilities, user_id
                FROM reports 
                WHERE id = ?
            ''', (db_id,))
        
        result = cursor.fetchone()
        if result:
            return {
                'id': result[0],
                'report_id': result[1],
                'target_ip': result[2],
                'generated_at': result[3],
                'total_vulnerabilities': result[4],
                'user_id': result[5]
            }
        return None

    def update_report(self, report_id, user_id, **kwargs):
        """Update report fields"""
        cursor = self.conn.cursor()
        
        # Build dynamic update query
        update_fields = []
        values = []
        
        allowed_fields = ['target_ip', 'total_vulnerabilities']
        for field in allowed_fields:
            if field in kwargs:
                update_fields.append(f"{field} = ?")
                values.append(kwargs[field])
        
        if not update_fields:
            return False
        
        values.extend([report_id, user_id])
        
        query = f'''
            UPDATE reports 
            SET {', '.join(update_fields)}
            WHERE report_id = ? AND user_id = ?
        '''
        
        cursor.execute(query, values)
        self.conn.commit()
        return cursor.rowcount > 0

    def delete_report(self, report_id, user_id):
        """Delete a report by report_id"""
        cursor = self.conn.cursor()
        cursor.execute('''
            DELETE FROM reports 
            WHERE report_id = ? AND user_id = ?
        ''', (report_id, user_id))
        
        self.conn.commit()
        return cursor.rowcount > 0

    def delete_report_by_db_id(self, db_id, user_id):
        """Delete a report by database ID"""
        cursor = self.conn.cursor()
        cursor.execute('''
            DELETE FROM reports 
            WHERE id = ? AND user_id = ?
        ''', (db_id, user_id))
        
        self.conn.commit()
        return cursor.rowcount > 0

    def get_all_reports(self):
        """Get all reports (admin function)"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT r.id, r.report_id, r.target_ip, r.generated_at, 
                   r.total_vulnerabilities, r.user_id, u.username
            FROM reports r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.generated_at DESC
        ''')
        
        results = cursor.fetchall()
        return [{
            'id': row[0],
            'report_id': row[1],
            'target_ip': row[2],
            'generated_at': row[3],
            'total_vulnerabilities': row[4],
            'user_id': row[5],
            'username': row[6]
        } for row in results]

    def get_user_report_stats(self, user_id):
        """Get statistics for a user's reports"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT 
                COUNT(*) as total_reports,
                SUM(total_vulnerabilities) as total_vulnerabilities,
                AVG(total_vulnerabilities) as avg_vulnerabilities_per_report,
                MIN(generated_at) as first_report,
                MAX(generated_at) as latest_report
            FROM reports 
            WHERE user_id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        if result:
            return {
                'total_reports': result[0],
                'total_vulnerabilities': result[1] or 0,
                'avg_vulnerabilities_per_report': round(result[2] or 0, 2),
                'first_report': result[3],
                'latest_report': result[4]
            }
        return None

    def log_report_generation(self, report_data):
        """
        Log report generation based on the pdfReportGenerator logReportGeneration method
        
        :param report_data: Dictionary containing report logging data
        :return: Database ID of the created report log
        """
        return self.create_report(
            report_id=report_data['reportId'],
            target_ip=report_data['targetIP'],
            generated_at=report_data['generatedAt'],
            total_vulnerabilities=report_data['vulnerabilitiesCount'],
            user_id=report_data['user_id']  # This should be added to the report_data from the frontend
        )