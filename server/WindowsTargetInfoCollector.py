# import os
# import json
# import pythoncom
# import wmi

# class WindowsTargetInfoCollector:
#     def __init__(self, ip_address, username=None, password=None):
#         """
#         Initialize the Windows target information collector.
        
#         :param ip_address: IP address of the target Windows machine
#         :param username: Optional username for WMI authentication
#         :param password: Optional password for WMI authentication
#         """
#         self.ip_address = ip_address
#         self.username = username
#         self.password = password
        
#         # Validate required parameters
#         if not ip_address:
#             raise ValueError("IP Address is required")

#     def safe_convert_to_gb(self, value):
#         """
#         Safely convert value to GB, handling different input types
        
#         :param value: Value to convert (can be string or numeric)
#         :return: Formatted GB string
#         """
#         try:
#             # Convert to numeric, handle potential string inputs
#             numeric_value = float(str(value).replace(',', ''))
#             return f"{numeric_value / (1024**3):.2f} GB"
#         except (ValueError, TypeError):
#             return "N/A"

#     def safe_get_attribute(self, obj, attribute, default='N/A'):
#         """
#         Safely get an attribute from an object
        
#         :param obj: Object to get attribute from
#         :param attribute: Attribute name
#         :param default: Default value if attribute doesn't exist
#         :return: Attribute value or default
#         """
#         try:
#             value = getattr(obj, attribute)
#             return str(value) if value is not None else default
#         except Exception:
#             return default

#     def collect_system_info(self):
#         """
#         Collect comprehensive system information using WMI
        
#         :return: Dictionary of system information
#         """
#         try:
#             # Ensure COM is initialized for the current thread
#             pythoncom.CoInitialize()
            
#             try:
#                 # Determine WMI Connection Parameters
#                 connection_params = {
#                     'computer': self.ip_address
#                 }
                
#                 # Add credentials if provided
#                 if self.username and self.password:
#                     connection_params.update({
#                         'user': self.username,
#                         'password': self.password
#                     })

#                 # WMI Connection (local or remote)
#                 c = wmi.WMI(**connection_params)

#                 # Collect System Information
#                 system_info = {}

#                 # Operating System Details
#                 for os in c.Win32_OperatingSystem():
#                     system_info['os'] = {
#                         'name': self.safe_get_attribute(os, 'Caption'),
#                         'version': self.safe_get_attribute(os, 'Version'),
#                         'install_date': self.safe_get_attribute(os, 'InstallDate'),
#                         'system_directory': self.safe_get_attribute(os, 'SystemDirectory'),
#                         'windows_directory': self.safe_get_attribute(os, 'WindowsDirectory')
#                     }

#                 # Hardware Information
#                 for computer in c.Win32_ComputerSystem():
#                     system_info['hardware'] = {
#                         'manufacturer': self.safe_get_attribute(computer, 'Manufacturer'),
#                         'model': self.safe_get_attribute(computer, 'Model'),
#                         'total_physical_memory': self.safe_convert_to_gb(
#                             self.safe_get_attribute(computer, 'TotalPhysicalMemory')
#                         )
#                     }

#                 # Processor Details
#                 processors = []
#                 for processor in c.Win32_Processor():
#                     processors.append({
#                         'name': self.safe_get_attribute(processor, 'Name'),
#                         'description': self.safe_get_attribute(processor, 'Description'),
#                         'max_clock_speed': f"{self.safe_get_attribute(processor, 'MaxClockSpeed', 'N/A')} MHz"
#                     })
#                 system_info['processors'] = processors

#                 # Disk Information
#                 disks = []
#                 for disk in c.Win32_LogicalDisk(DriveType=3):  # Fixed drives only
#                     disks.append({
#                         'device_id': self.safe_get_attribute(disk, 'DeviceID'),
#                         'size': self.safe_convert_to_gb(self.safe_get_attribute(disk, 'Size')),
#                         'free_space': self.safe_convert_to_gb(self.safe_get_attribute(disk, 'FreeSpace'))
#                     })
#                 system_info['disks'] = disks

#                 # Network Adapters
#                 network_adapters = []
#                 for adapter in c.Win32_NetworkAdapterConfiguration(IPEnabled=True):
#                     ip_addresses = self.safe_get_attribute(adapter, 'IPAddress')
#                     network_adapters.append({
#                         'description': self.safe_get_attribute(adapter, 'Description'),
#                         'ip_address': ip_addresses.split(',')[0] if ip_addresses else 'N/A',
#                         'mac_address': self.safe_get_attribute(adapter, 'MACAddress')
#                     })
#                 system_info['network_adapters'] = network_adapters

#                 return system_info

#             except Exception as e:
#                 print(f"Error collecting system information: {e}")
#                 raise
            
#             finally:
#                 # Uninitialize COM for the thread
#                 pythoncom.CoUninitialize()

#         except Exception as e:
#             print(f"Initialization error: {e}")
#             raise

import os
import json
import pythoncom
import wmi

class WindowsTargetInfoCollector:
    def __init__(self, ip_address, username=None, password=None):
        self.ip_address = ip_address
        self.username = username
        self.password = password

        if not ip_address:
            raise ValueError("IP Address is required")

    def safe_convert_to_gb(self, value):
        try:
            numeric_value = float(str(value).replace(',', ''))
            return f"{numeric_value / (1024**3):.2f} GB"
        except (ValueError, TypeError):
            return "N/A"

    def safe_get_attribute(self, obj, attribute, default='N/A'):
        try:
            value = getattr(obj, attribute)
            return str(value) if value is not None else default
        except Exception:
            return default

    def collect_system_info(self):
        try:
            pythoncom.CoInitialize()
            try:
                connection_params = {'computer': self.ip_address}
                if self.username and self.password:
                    connection_params.update({'user': self.username, 'password': self.password})

                c = wmi.WMI(**connection_params)
                system_info = {}

                # ---------------- OS DETAILS ----------------
                for os in c.Win32_OperatingSystem():
                    system_info['os'] = {
                        'name': self.safe_get_attribute(os, 'Caption'),
                        'version': self.safe_get_attribute(os, 'Version'),
                        'build_number': self.safe_get_attribute(os, 'BuildNumber'),
                        'architecture': self.safe_get_attribute(os, 'OSArchitecture'),
                        'install_date': self.safe_get_attribute(os, 'InstallDate'),
                        'system_directory': self.safe_get_attribute(os, 'SystemDirectory'),
                        'windows_directory': self.safe_get_attribute(os, 'WindowsDirectory'),
                        'product_type': self.safe_get_attribute(os, 'ProductType'),
                        'service_pack': f"{self.safe_get_attribute(os, 'ServicePackMajorVersion')}.{self.safe_get_attribute(os, 'ServicePackMinorVersion')}"
                    }

                # ---------------- HARDWARE ----------------
                for cs in c.Win32_ComputerSystem():
                    system_info['hardware'] = {
                        'manufacturer': self.safe_get_attribute(cs, 'Manufacturer'),
                        'model': self.safe_get_attribute(cs, 'Model'),
                        'total_physical_memory': self.safe_convert_to_gb(
                            self.safe_get_attribute(cs, 'TotalPhysicalMemory'))
                    }
                    system_info['hostname'] = self.safe_get_attribute(cs, 'Name')

                # ---------------- PROCESSORS ----------------
                processors = []
                for p in c.Win32_Processor():
                    processors.append({
                        'name': self.safe_get_attribute(p, 'Name'),
                        'description': self.safe_get_attribute(p, 'Description'),
                        'max_clock_speed': f"{self.safe_get_attribute(p, 'MaxClockSpeed')} MHz",
                        'architecture': self.safe_get_attribute(p, 'Architecture')
                    })
                system_info['processors'] = processors

                # ---------------- DISKS ----------------
                disks = []
                for d in c.Win32_LogicalDisk(DriveType=3):
                    disks.append({
                        'device_id': self.safe_get_attribute(d, 'DeviceID'),
                        'volume_name': self.safe_get_attribute(d, 'VolumeName'),
                        'size': self.safe_convert_to_gb(self.safe_get_attribute(d, 'Size')),
                        'free_space': self.safe_convert_to_gb(self.safe_get_attribute(d, 'FreeSpace')),
                        'file_system': self.safe_get_attribute(d, 'FileSystem')
                    })
                system_info['disks'] = disks

                # ---------------- NETWORK ----------------
                network_adapters = []
                for net in c.Win32_NetworkAdapterConfiguration(IPEnabled=True):
                    ip = self.safe_get_attribute(net, 'IPAddress')
                    network_adapters.append({
                        'description': self.safe_get_attribute(net, 'Description'),
                        'ip_address': ip.split(',')[0] if ip else 'N/A',
                        'mac_address': self.safe_get_attribute(net, 'MACAddress'),
                        'dns_domain': self.safe_get_attribute(net, 'DNSDomain')
                    })
                system_info['network_adapters'] = network_adapters

                # ---------------- SERVICES ----------------
                services = []
                for svc in c.Win32_Service():
                    services.append({
                        'name': self.safe_get_attribute(svc, 'Name'),
                        'display_name': self.safe_get_attribute(svc, 'DisplayName'),
                        'state': self.safe_get_attribute(svc, 'State'),
                        'start_mode': self.safe_get_attribute(svc, 'StartMode')
                    })
                system_info['services'] = services

                # ---------------- HOTFIXES ----------------
                hotfixes = []
                for hf in c.Win32_QuickFixEngineering():
                    hotfixes.append(self.safe_get_attribute(hf, 'HotFixID'))
                system_info['hotfixes'] = hotfixes

                return system_info

            except Exception as e:
                print(f"[!] Error collecting system information: {e}")
                raise
            finally:
                pythoncom.CoUninitialize()

        except Exception as e:
            print(f"[!] Initialization error: {e}")
            raise
