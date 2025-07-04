# import socket
# import subprocess
# import ipaddress
# import json
# import platform

# class WindowsNetworkScanner:
#     def __init__(self, ip_address, username=None, password=None):
#         """
#         Initialize the network scanner
        
#         :param ip_address: Target IP address
#         :param username: Optional username for authentication
#         :param password: Optional password for authentication
#         """
#         self.ip_address = ip_address
#         self.username = username
#         self.password = password

#         if not ip_address:
#             raise ValueError("IP Address is required")

#     def _is_port_open(self, port, timeout=1):
#         """
#         Check if a specific port is open
        
#         :param port: Port number to check
#         :param timeout: Connection timeout in seconds
#         :return: Boolean indicating if port is open
#         """
#         try:
#             sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#             sock.settimeout(timeout)
#             result = sock.connect_ex((self.ip_address, port))
#             sock.close()
#             return result == 0
#         except Exception:
#             return False

#     def scan_network_ports(self):
#         """
#         Scan common ports and identify open ports
        
#         :return: Dictionary of open ports and their basic information
#         """
#         # Common ports to scan
#         common_ports = {
#             21: 'FTP',
#             22: 'SSH',
#             23: 'Telnet', 
#             25: 'SMTP',
#             53: 'DNS',
#             80: 'HTTP',
#             110: 'POP3',
#             143: 'IMAP',
#             443: 'HTTPS',
#             445: 'SMB',
#             3389: 'RDP',
#             5985: 'WinRM HTTP',
#             5986: 'WinRM HTTPS',
#             8080: 'HTTP Alternate',
#             9999: 'Custom Test Port'
#         }

#         open_ports = {}
#         for port, service in common_ports.items():
#             if self._is_port_open(port):
#                 open_ports[port] = {
#                     'service': service,
#                     'state': 'open'
#                 }
        
#         return open_ports

#     def ping_host(self):
#         """
#         Ping the target host to check connectivity
        
#         :return: Dictionary with ping results
#         """
#         try:
#             # Determine the appropriate ping command based on OS
#             param = '-n' if platform.system().lower() == 'windows' else '-c'
            
#             # Run ping command
#             result = subprocess.run(
#                 ['ping', param, '4', self.ip_address], 
#                 capture_output=True, 
#                 text=True, 
#                 timeout=5
#             )
            
#             return {
#                 'reachable': result.returncode == 0,
#                 'output': result.stdout
#             }
#         except subprocess.TimeoutExpired:
#             return {
#                 'reachable': False,
#                 'output': 'Ping timeout'
#             }
#         except Exception as e:
#             return {
#                 'reachable': False,
#                 'output': str(e)
#             }

#     def collect_network_info(self):
#         """
#         Collect comprehensive network information
        
#         :return: Dictionary of network information
#         """
#         try:
#             network_info = {
#                 'ip_address': self.ip_address,
#                 'ping_results': self.ping_host(),
#                 'open_ports': self.scan_network_ports(),
#                 'system_info': {
#                     'platform': platform.system(),
#                     'hostname': socket.gethostname()
#                 }
#             }
            
#             return network_info
#         except Exception as e:
#             print(f"Comprehensive network scan error: {e}")
#             raise

import socket
import subprocess
import json
import platform

class WindowsNetworkScanner:
    def __init__(self, ip_address, username=None, password=None):
        self.ip_address = ip_address
        self.username = username
        self.password = password

        if not ip_address:
            raise ValueError("IP Address is required")

    def _is_port_open(self, port, timeout=1):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(timeout)
                result = sock.connect_ex((self.ip_address, port))
                return result == 0
        except Exception:
            return False

    def is_host_alive(self, ports=[80, 443, 135]):
        for port in ports:
            if self._is_port_open(port):
                return True
        return False

    def scan_network_ports(self):
        common_ports = {
            21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
            53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP',
            443: 'HTTPS', 445: 'SMB', 3389: 'RDP',
            5985: 'WinRM HTTP', 5986: 'WinRM HTTPS',
            8080: 'HTTP Alternate', 9999: 'Custom Port'
        }

        open_ports = {}
        for port, service in common_ports.items():
            if self._is_port_open(port):
                open_ports[port] = {
                    'service': service,
                    'state': 'open'
                }

        return open_ports

    def perform_banner_grab(self, port, service):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(2)
                sock.connect((self.ip_address, port))

                if service in ["HTTP", "HTTP Alternate", "HTTPS"]:
                    sock.sendall(b"HEAD / HTTP/1.1\r\nHost: localhost\r\n\r\n")
                elif service == "SMTP":
                    sock.sendall(b"EHLO test\r\n")
                elif service == "FTP":
                    sock.sendall(b"SYST\r\n")
                elif service == "POP3":
                    sock.sendall(b"CAPA\r\n")
                elif service == "IMAP":
                    sock.sendall(b"1 CAPABILITY\r\n")
                elif service == "Telnet":
                    sock.sendall(b"\r\n")
                else:
                    # Try raw connection for unknown/custom services
                    sock.sendall(b"\r\n")

                response = sock.recv(1024).decode(errors='ignore').strip()
                return response
        except:
            return ""

    def reverse_dns_lookup(self):
        try:
            return socket.gethostbyaddr(self.ip_address)[0]
        except:
            return None

    def collect_network_info(self):
        try:
            open_ports = self.scan_network_ports()
            banner_data = {
                port: self.perform_banner_grab(port, open_ports[port]['service'])
                for port in open_ports
            }

            return {
                'ip_address': self.ip_address,
                'is_alive': self.is_host_alive(),
                'reverse_dns': self.reverse_dns_lookup(),
                'open_ports': open_ports,
                'banners': banner_data,
                'system_info': {
                    'platform': platform.system(),
                    'hostname': socket.gethostname()
                }
            }
        except Exception as e:
            print(f"Network scan error: {e}")
            raise
