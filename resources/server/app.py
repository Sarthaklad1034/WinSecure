# import sys
# import os
# import json
# import socket
# from io import BytesIO
# from flask import Flask, request, jsonify, send_from_directory, send_file, Response, session
# from flask_cors import CORS
# from datetime import datetime

# # Add current directory to sys.path for local imports
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# # === Setup Flask App ===

# # Check if running from a frozen (packaged) environment
# IS_FROZEN = getattr(sys, 'frozen', False)

# if IS_FROZEN:
#     BASE_DIR = os.path.dirname(sys.executable)
#     REACT_BUILD_DIR = os.path.join(BASE_DIR, 'resources', 'react')
# else:
#     BASE_DIR = os.path.abspath(os.path.dirname(__file__))
#     REACT_BUILD_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'client', 'build'))

# print("React static folder being used by Flask:", REACT_BUILD_DIR)
# print("Does index.html exist?:", os.path.exists(os.path.join(REACT_BUILD_DIR, 'index.html')))

# # Initialize Flask app with correct static path
# app = Flask(__name__, static_folder=REACT_BUILD_DIR, static_url_path='')

# # Set secret key and enable CORS
# app.secret_key = 'your-secret-key-here'
# CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# # === Local Module Imports (after path fix) ===
# from database import UserDatabase, ReportDatabase
# from WindowsTargetInfoCollector import WindowsTargetInfoCollector
# from WindowsNetworkScanner import WindowsNetworkScanner
# from VulnerabilityDatabase import match_vulnerabilities, generate_vulnerability_report_json

# # === Initialize Databases ===
# user_db = UserDatabase()
# report_db = ReportDatabase()

import sys
import os
import json
import socket
from io import BytesIO
from flask import Flask, request, jsonify, send_from_directory, send_file, Response, session
from flask_cors import CORS
from datetime import datetime

# Add current directory to sys.path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# === Setup Flask App ===

# Check if running from a frozen (packaged) environment
IS_FROZEN = getattr(sys, 'frozen', False)

if IS_FROZEN:
    # In packaged app, resources are in the parent directory of the executable
    BASE_DIR = os.path.dirname(sys.executable)
    REACT_BUILD_DIR = os.path.join(BASE_DIR, 'resources', 'react')
else:
    # In development, check if REACT_BUILD_PATH is set by electron
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    REACT_BUILD_DIR = os.environ.get('REACT_BUILD_PATH')
    
    if not REACT_BUILD_DIR:
        # Fallback to default development path
        REACT_BUILD_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'client', 'build'))

print("Environment Detection:")
print(f"IS_FROZEN: {IS_FROZEN}")
print(f"BASE_DIR: {BASE_DIR}")
print(f"REACT_BUILD_DIR: {REACT_BUILD_DIR}")
print(f"React build directory exists: {os.path.exists(REACT_BUILD_DIR)}")

# Verify index.html exists
index_path = os.path.join(REACT_BUILD_DIR, 'index.html')
print(f"index.html path: {index_path}")
print(f"index.html exists: {os.path.exists(index_path)}")

# If React build directory doesn't exist, create a fallback
if not os.path.exists(REACT_BUILD_DIR):
    print("React build directory not found, creating fallback...")
    os.makedirs(REACT_BUILD_DIR, exist_ok=True)
    
    # Create a simple fallback index.html
    fallback_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WinSecure - Build Error</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .error-container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .error-title { color: #d32f2f; margin-bottom: 20px; }
        .error-message { color: #333; line-height: 1.6; }
        .command { background: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="error-container">
        <h1 class="error-title">🚨 React Build Not Found</h1>
        <div class="error-message">
            <p>The React frontend build files are missing. Please follow these steps:</p>
            <ol>
                <li>Navigate to the <strong>client</strong> directory</li>
                <li>Run: <div class="command">npm install</div></li>
                <li>Run: <div class="command">npm run build</div></li>
                <li>Run the setup script: <div class="command">node scripts/setup-python.js</div></li>
                <li>Rebuild the Electron app: <div class="command">npm run dist</div></li>
            </ol>
        </div>
    </div>
</body>
</html>'''
    
    with open(index_path, 'w') as f:
        f.write(fallback_html)
    print("Fallback index.html created")

# Initialize Flask app with correct static path
app = Flask(__name__, static_folder=REACT_BUILD_DIR, static_url_path='')

# Set secret key and enable CORS
app.secret_key = 'your-secret-key-here'
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# === Local Module Imports (after path fix) ===
try:
    from database import UserDatabase, ReportDatabase
    from WindowsTargetInfoCollector import WindowsTargetInfoCollector
    from WindowsNetworkScanner import WindowsNetworkScanner
    from VulnerabilityDatabase import match_vulnerabilities, generate_vulnerability_report_json
    print("All modules imported successfully")
except ImportError as e:
    print(f"Module import error: {e}")
    print("Some features may not work properly")

# === Initialize Databases ===
try:
    user_db = UserDatabase()
    report_db = ReportDatabase()
    print("Databases initialized")
except Exception as e:
    print(f"Database initialization error: {e}")

def guess_os(ip):
    """
    Attempt to determine the operating system by checking for Windows-specific ports.
    This is AV/EDR-safe as it only uses socket connections without ICMP.
    
    :param ip: IP address to check
    :return: "Windows" if Windows-specific ports are reachable, "Unknown" otherwise
    """
    windows_ports = [445, 135]  # SMB and RPC ports commonly open on Windows
    
    for port in windows_ports:
        try:
            # Create socket with timeout
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)  # 3 second timeout
            
            # Attempt connection
            result = sock.connect_ex((ip, port))
            sock.close()
            
            # If connection successful (port is open)
            if result == 0:
                return "Windows"
                
        except Exception as e:
            # Continue to next port if connection fails
            continue
    
    # If no Windows-specific ports are reachable
    return "Unknown"

# ===== AUTHENTICATION & USER MANAGEMENT =====

# Add this endpoint to server.py after the existing login endpoint

@app.route('/register', methods=['POST'])
def register():
    """
    Register a new user account (no confirm password, no email)
    """
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Validate required fields
    if not username or not password:
        return jsonify({
            'success': False,
            'message': 'Username and password are required'
        }), 400

    # Validate username length
    if len(username) < 3:
        return jsonify({
            'success': False,
            'message': 'Username must be at least 3 characters long'
        }), 400

    # Validate password length
    if len(password) < 6:
        return jsonify({
            'success': False,
            'message': 'Password must be at least 6 characters long'
        }), 400

    # Check if username already exists
    if user_db.username_exists(username):
        return jsonify({
            'success': False,
            'message': 'Username already exists'
        }), 409

    try:
        # Create new user (role is automatically set to 'tester')
        user_id = user_db.create_user(username, password, role='tester')

        # Automatically log in the user after successful registration
        session['user_id'] = user_id
        session['username'] = username
        session['role'] = 'tester'
        session['is_authenticated'] = True

        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user_id': user_id,
            'username': username,
            'role': 'tester',
            'isAuthenticated': True
        }), 201

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 409
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Registration failed due to server error'
        }), 500


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({
            'success': False,
            'message': 'Username and password are required'
        }), 400
    
    # Validate user
    user_info = user_db.validate_user(username, password)
    
    if user_info:
        # Store user info in session
        session['user_id'] = user_info['user_id']
        session['username'] = username
        session['role'] = user_info['role']
        session['is_authenticated'] = True
        
        return jsonify({
            'success': True, 
            'role': user_info['role'], 
            'user_id': user_info['user_id'],
            'username': username,
            'isAuthenticated': True,
            'message': 'Login successful'
        }), 200
    else:
        return jsonify({
            'success': False, 
            'message': 'Invalid username or password'
        }), 401

@app.route('/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session and session.get('is_authenticated'):
        return jsonify({
            'success': True,
            'isAuthenticated': True,
            'user_id': session['user_id'],
            'username': session['username'],
            'role': session['role']
        }), 200
    else:
        return jsonify({
            'success': False,
            'isAuthenticated': False,
            'message': 'Not authenticated'
        }), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    }), 200
    
@app.route('/update-profile', methods=['POST'])
def update_profile():
    """
    Update user profile (username and/or password)
    """
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401

    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        user_id = session['user_id']
        
        # Validate input
        if not username and not password:
            return jsonify({
                'success': False,
                'message': 'At least username or password must be provided'
            }), 400
        
        if username and len(username) < 3:
            return jsonify({
                'success': False,
                'message': 'Username must be at least 3 characters long'
            }), 400
        
        if password and len(password) < 6:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 6 characters long'
            }), 400
        
        # Update user profile
        success = user_db.update_user_profile(
            user_id=user_id,
            username=username if username else None,
            password=password if password else None
        )
        
        if success:
            # Update session with new username if it was changed
            if username:
                session['username'] = username
            
            return jsonify({
                'success': True,
                'message': 'Profile updated successfully',
                'username': username if username else session.get('username')
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'No changes were made'
            }), 400
            
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 409
    except Exception as e:
        print(f"Profile update error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to update profile due to server error'
        }), 500


@app.route('/user-info', methods=['GET'])
def get_user_info():
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401
    
    return jsonify({
        'success': True,
        'user_id': session['user_id'],
        'username': session['username'],
        'role': session['role']
    }), 200

# ===== ASSESSMENT ENDPOINTS =====

@app.route('/collect-target-info', methods=['POST', 'OPTIONS'])
def collect_target_info():
    """
    Endpoint to collect Windows system information and return as downloadable file
    """
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        response = Response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401

    data = request.json
    ip_address = data.get('ip_address')
    username = data.get('username')  # Optional
    password = data.get('password')  # Optional

    if not ip_address:
        return jsonify({
            'success': False, 
            'message': 'IP Address is required'
        }), 400

    # Check if target is a Windows system before attempting WMI
    detected_os = guess_os(ip_address)
    if detected_os != "Windows":
        return jsonify({
            'success': False,
            'message': f'Target is not a Windows system (Detected: {detected_os})'
        }), 400

    try:
        # Include username and password if they exist
        kwargs = {'ip_address': ip_address}
        if username:
            kwargs['username'] = username
        if password:
            kwargs['password'] = password

        collector = WindowsTargetInfoCollector(**kwargs)
        system_info = collector.collect_system_info()

        if system_info:
            # Convert system info to a formatted JSON string
            file_content = json.dumps(system_info, indent=4)
            
            # Create a file-like object in memory
            file_like_obj = BytesIO(file_content.encode('utf-8'))
            
            # Send file for download
            return send_file(
                file_like_obj, 
                mimetype='text/plain',
                as_attachment=True,
                download_name=f'system_info_{ip_address.replace(".", "_")}.txt'
            )
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to collect system information'
            }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500
        
@app.route('/network-scan', methods=['POST', 'OPTIONS'])
def network_scan():
    """
    Endpoint to perform network scanning and return as downloadable file
    """
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        response = Response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401

    data = request.json
    ip_address = data.get('ip_address')
    username = data.get('username')  # Optional
    password = data.get('password')  # Optional

    if not ip_address:
        return jsonify({
            'success': False, 
            'message': 'IP Address is required'
        }), 400

    try:
        # Include username and password if they exist
        kwargs = {'ip_address': ip_address}
        if username:
            kwargs['username'] = username
        if password:
            kwargs['password'] = password

        scanner = WindowsNetworkScanner(**kwargs)
        network_info = scanner.collect_network_info()

        if network_info:
            # Convert network info to a formatted JSON string
            file_content = json.dumps(network_info, indent=4)
            
            # Create a file-like object in memory
            file_like_obj = BytesIO(file_content.encode('utf-8'))
            
            # Send file for download
            return send_file(
                file_like_obj, 
                mimetype='text/plain',
                as_attachment=True,
                download_name=f'network_scan_{ip_address.replace(".", "_")}.txt'
            )
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to collect network information'
            }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Network Scan Error: {str(e)}'
        }), 500

@app.route('/vulnerability-assessment', methods=['POST', 'OPTIONS'])
def vulnerability_assessment():
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        response = Response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401

    # Add detailed logging
    print("Raw Request Data:", request.get_data(as_text=True))
    print("Request JSON:", request.json)

    # Ensure you're extracting data correctly
    data = request.json or {}
    
    ip_address = data.get('ip_address')
    network_scan_data = data.get('network_scan_data')

    # More detailed error logging
    print(f"IP Address: {ip_address}")
    print(f"Network Scan Data: {network_scan_data}")

    if not ip_address:
        print("Error: IP Address is missing")
        return jsonify({
            'success': False, 
            'message': 'IP Address is required'
        }), 400

    if not network_scan_data:
        print("Error: Network Scan Data is missing")
        return jsonify({
            'success': False, 
            'message': 'Network Scan Data is required'
        }), 400

    try:
        # Ensure network_scan_data is a dictionary
        if isinstance(network_scan_data, str):
            try:
                network_scan_data = json.loads(network_scan_data)
            except json.JSONDecodeError:
                print("Error: Could not parse network_scan_data")
                return jsonify({
                    'success': False,
                    'message': 'Invalid network scan data format'
                }), 400

        # Match vulnerabilities based on detected services
        vulnerabilities = match_vulnerabilities(network_scan_data)

        # Generate JSON report
        report_data = generate_vulnerability_report_json(ip_address, vulnerabilities)
        
        # Convert to JSON string
        report_content = json.dumps(report_data, indent=4)

        # Create file-like object for download
        file_like_obj = BytesIO(report_content.encode('utf-8'))
        
        return send_file(
            file_like_obj, 
            mimetype='application/json',
            as_attachment=True,
            download_name=f'vulnerability_report_{ip_address.replace(".", "_")}.json'
        )
        
    except Exception as e:
        # Log the full traceback
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'message': f'Vulnerability Assessment Error: {str(e)}'
        }), 500

@app.route('/log-report-generation', methods=['POST'])
def log_report_generation():
    """
    Endpoint to log PDF report generation to database
    """
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401

    try:
        data = request.json
        
        # Extract report data
        report_id = data.get('reportId')
        target_ip = data.get('targetIP')
        generated_at = data.get('generatedAt')
        vulnerabilities_count = data.get('vulnerabilitiesCount', 0)
        status = data.get('status', 'SUCCESS')
        
        # Validate required fields
        if not all([report_id, target_ip, generated_at]):
            return jsonify({
                'success': False,
                'message': 'Missing required fields: reportId, targetIP, generatedAt'
            }), 400
        
        # Create report entry in database using the correct method signature
        db_id = report_db.create_report(
            report_id=report_id,
            target_ip=target_ip,
            generated_at=generated_at,
            total_vulnerabilities=vulnerabilities_count,
            user_id=session['user_id']
        )
        
        return jsonify({
            'success': True,
            'message': 'Report generation logged successfully',
            'db_id': db_id,
            'report_id': report_id
        }), 200
        
    except ValueError as e:
        # Handle duplicate report_id
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        print(f"Error logging report generation: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error logging report generation: {str(e)}'
        }), 500

@app.route('/generate-comprehensive-report', methods=['POST'])
def generate_comprehensive_report():
    """
    Endpoint to handle comprehensive PDF report generation and logging
    """
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401

    try:
        data = request.json
        print("Received report data:", json.dumps(data, indent=2))  # Debug logging
        
        # Extract all the data from the frontend
        target_data = data.get('target', {})
        network_scan_data = data.get('networkScan', {})
        vulnerability_data = data.get('vulnerabilityAssessment', {})
        report_id = data.get('reportId', f'VULN_{int(datetime.now().timestamp() * 1000)}')
        
        target_ip = target_data.get('ip', '')
        
        if not target_ip:
            return jsonify({
                'success': False,
                'message': 'Target IP is required'
            }), 400
        
        # Count total vulnerabilities from the vulnerability data
        total_vulnerabilities = 0
        if vulnerability_data:
            # Check different possible structures
            if 'vulnerabilities' in vulnerability_data:
                vulnerabilities = vulnerability_data['vulnerabilities']
                if isinstance(vulnerabilities, list):
                    total_vulnerabilities = len(vulnerabilities)
                elif isinstance(vulnerabilities, dict):
                    # If vulnerabilities is a dict with severity levels
                    total_vulnerabilities = sum(
                        len(vuln_list) if isinstance(vuln_list, list) else 0 
                        for vuln_list in vulnerabilities.values()
                    )
            # Alternative: check for vulnerability summary
            elif 'summary' in vulnerability_data:
                summary = vulnerability_data['summary']
                total_vulnerabilities = summary.get('total', 0)
        
        print(f"Calculated total vulnerabilities: {total_vulnerabilities}")
        
        # Save to database using the correct method signature
        try:
            db_id = report_db.create_report(
                report_id=report_id,
                target_ip=target_ip,
                generated_at=datetime.now().isoformat(),
                total_vulnerabilities=total_vulnerabilities,
                user_id=session['user_id']
            )
            print(f"Report saved to database with ID: {db_id}")
        except Exception as db_error:
            print(f"Database save error: {str(db_error)}")
            # Continue even if DB save fails, but log the error
            db_id = None
        
        # Return success response (PDF generation happens on frontend)
        response_data = {
            'success': True,
            'message': 'Report generated and logged successfully',
            'reportId': report_id,
            'targetIP': target_ip,
            'totalVulnerabilities': total_vulnerabilities,
            'fileName': f'Vulnerability_Assessment_Report_{datetime.now().strftime("%Y-%m-%d")}_{target_ip.replace(".", "_")}.pdf'
        }
        
        if db_id:
            response_data['db_id'] = db_id
        
        return jsonify(response_data), 200
        
    except ValueError as e:
        print(f"ValueError: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        print(f"Error generating comprehensive report: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Error generating report: {str(e)}'
        }), 500
        
# ===== REPORTS MANAGEMENT ENDPOINTS =====

@app.route('/reports', methods=['GET'])
def get_reports():
    """Get reports for the authenticated user"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401
    
    try:
        user_id = session['user_id']
        user_role = session.get('role', 'tester')
        
        if user_role == 'admin':
            # Admin can see all reports
            reports = report_db.get_all_reports()
        else:
            # Regular users can only see their own reports
            reports = report_db.get_reports_by_user(user_id)
        
        return jsonify({
            'success': True,
            'reports': reports,
            'total': len(reports)
        }), 200
        
    except Exception as e:
        print(f"Error fetching reports: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error fetching reports: {str(e)}'
        }), 500

@app.route('/reports/<report_id>', methods=['GET'])
def get_report_details(report_id):
    """Get detailed information about a specific report"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401
    
    try:
        user_id = session['user_id']
        user_role = session.get('role', 'tester')
        
        if user_role == 'admin':
            # Admin can access any report
            report = report_db.get_report_by_id(report_id)
        else:
            # Regular users can only access their own reports
            report = report_db.get_report_by_id(report_id, user_id)
        
        if not report:
            return jsonify({
                'success': False,
                'message': 'Report not found or access denied'
            }), 404
        
        return jsonify({
            'success': True,
            'report': report
        }), 200
        
    except Exception as e:
        print(f"Error fetching report details: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error fetching report details: {str(e)}'
        }), 500

@app.route('/reports/<report_id>', methods=['DELETE'])
def delete_report(report_id):
    """Delete a specific report"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401
    
    try:
        user_id = session['user_id']
        user_role = session.get('role', 'tester')
        
        if user_role == 'admin':
            # Admin can delete any report
            success = report_db.delete_report(report_id, user_id=None)
        else:
            # Regular users can only delete their own reports
            success = report_db.delete_report(report_id, user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Report deleted successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Report not found or access denied'
            }), 404
        
    except Exception as e:
        print(f"Error deleting report: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error deleting report: {str(e)}'
        }), 500

@app.route('/reports/stats', methods=['GET'])
def get_report_stats():
    """Get statistics for the authenticated user's reports"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401
    
    try:
        user_id = session['user_id']
        stats = report_db.get_user_report_stats(user_id)
        
        return jsonify({
            'success': True,
            'stats': stats or {
                'total_reports': 0,
                'total_vulnerabilities': 0,
                'avg_vulnerabilities_per_report': 0,
                'first_report': None,
                'latest_report': None
            }
        }), 200
        
    except Exception as e:
        print(f"Error fetching report stats: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error fetching report stats: {str(e)}'
        }), 500

# ===== FRONTEND FALLBACK ROUTING =====
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    """
    Serve the React frontend for non-API routes.
    """
    # Define known API route prefixes (so we don't route React for them)
    api_routes = [
        'login', 'register', 'logout', 'user-info', 'check-auth', 'reports',
        'collect-target-info', 'network-scan',
        'vulnerability-assessment', 'log-report-generation',
        'generate-comprehensive-report'
    ]

    # If the request matches any known API route, return a JSON 404
    if any(path.startswith(route) for route in api_routes):
        return jsonify({'error': 'API endpoint not found'}), 404

    # If the requested file exists in the static folder, serve it
    requested_path = os.path.join(app.static_folder, path)
    if path and os.path.exists(requested_path):
        return send_from_directory(app.static_folder, path)

    # Fallback to React's index.html (for client-side routing)
    index_path = os.path.join(app.static_folder, 'index.html')
    if os.path.exists(index_path):
        return send_file(index_path)

    # If the build folder or index.html is missing
    return (
        f"""
        <!DOCTYPE html>
        <html>
        <head><title>React App Not Found</title></head>
        <body style="font-family:sans-serif; color: #b00;">
            <h1>⚠️ React app not found</h1>
            <p><strong>Expected at:</strong> <code>{index_path}</code></p>
            <p>Make sure you’ve run <code>npm run build</code> and copied the build to <code>resources/react</code> if packaging.</p>
        </body>
        </html>
        """, 404
    )


# === Run the Server (for dev testing) ===
if __name__ == "__main__":
    print("Resolved static folder path:", app.static_folder)
    print("index.html exists:", os.path.exists(os.path.join(app.static_folder, 'index.html')))
    app.run(debug=True, use_reloader=False)  # enable debug for dev, disable in prod
