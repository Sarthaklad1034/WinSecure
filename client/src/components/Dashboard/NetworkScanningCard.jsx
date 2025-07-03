import React, { useState } from 'react';

const NetworkScanningCard = ({ onComplete, isDisabled, targetIP }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [scanProgress, setScanProgress] = useState('');

    const performNetworkScan = async () => {
        if (!targetIP) {
            alert('Target IP is required for network scanning');
            return;
        }

        setIsScanning(true);
        setScanProgress('Initializing network scan...');

        try {
            const response = await fetch('/network-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip_address: targetIP })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            setScanProgress('Processing scan results...');
            
            // Read the response as text first
            const blob = await response.blob();
            const text = await blob.text();
            
            let networkScanData;
            try {
                // Try to parse as JSON first
                networkScanData = JSON.parse(text);
            } catch (parseError) {
                // If parsing fails, create a structured JSON object from text
                networkScanData = {
                    ip_address: targetIP,
                    scan_timestamp: new Date().toISOString(),
                    scan_type: 'network_scan',
                    status: 'completed',
                    raw_output: text,
                    // Extract structured data from text
                    open_ports: extractPortsFromText(text),
                    services: extractServicesFromText(text),
                    host_info: extractHostInfoFromText(text),
                    scan_summary: {
                        total_ports_scanned: extractTotalPortsFromText(text),
                        open_ports_count: extractOpenPortsCountFromText(text),
                        filtered_ports_count: extractFilteredPortsCountFromText(text),
                        closed_ports_count: extractClosedPortsCountFromText(text)
                    }
                };
            }

            // Ensure the data structure is consistent
            const finalNetworkData = {
                ip_address: networkScanData.ip_address || targetIP,
                scan_timestamp: networkScanData.scan_timestamp || new Date().toISOString(),
                scan_type: 'network_scan',
                status: 'completed',
                open_ports: networkScanData.open_ports || [],
                services: networkScanData.services || [],
                host_info: networkScanData.host_info || {},
                scan_summary: networkScanData.scan_summary || {},
                raw_output: networkScanData.raw_output || text
            };

            // Generate JSON file for download
            const jsonString = JSON.stringify(finalNetworkData, null, 2);
            const jsonBlob = new Blob([jsonString], { type: 'application/json' });
            const url = window.URL.createObjectURL(jsonBlob);
            const downloadLink = document.createElement('a');
            downloadLink.style.display = 'none';
            downloadLink.href = url;
            downloadLink.download = `network_scan_${targetIP.replace(/\./g, '_')}_${new Date().getTime()}.json`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(downloadLink);

            setScanProgress('Network scan completed successfully');
            setIsScanning(false);
            setIsCompleted(true);
            
            // Pass structured network scan data to parent
            onComplete(finalNetworkData);
            
        } catch (error) {
            console.error('Network Scan Error:', error);
            alert(`Network scan failed: ${error.message}`);
            setScanProgress('');
            setIsScanning(false);
        }
    };

    // Helper function to extract ports from text data
    const extractPortsFromText = (text) => {
        const ports = [];
        const lines = text.split('\n');
        
        lines.forEach(line => {
            // Look for port patterns like "80/tcp open http"
            const portMatch = line.match(/(\d+)\/(tcp|udp)\s+(open|closed|filtered)\s*(.*)/i);
            if (portMatch) {
                ports.push({
                    port: parseInt(portMatch[1]),
                    protocol: portMatch[2].toLowerCase(),
                    state: portMatch[3].toLowerCase(),
                    service: portMatch[4] ? portMatch[4].trim() : 'unknown'
                });
            }
        });
        
        return ports;
    };

    // Helper function to extract services from text data
    const extractServicesFromText = (text) => {
        const services = [];
        const lines = text.split('\n');
        
        lines.forEach(line => {
            // Look for service information
            const serviceMatch = line.match(/(\d+)\/(tcp|udp)\s+open\s+(\w+)/i);
            if (serviceMatch) {
                const existingService = services.find(s => s.name === serviceMatch[3]);
                if (!existingService) {
                    services.push({
                        name: serviceMatch[3],
                        port: parseInt(serviceMatch[1]),
                        protocol: serviceMatch[2].toLowerCase(),
                        version: extractVersionFromLine(line)
                    });
                }
            }
        });
        
        return services;
    };

    // Helper function to extract version info from line
    const extractVersionFromLine = (line) => {
        const versionMatch = line.match(/version\s+([^\s,]+)/i);
        return versionMatch ? versionMatch[1] : 'unknown';
    };

    // Helper function to extract host info
    const extractHostInfoFromText = (text) => {
        const hostInfo = {};
        const lines = text.split('\n');
        
        lines.forEach(line => {
            if (line.toLowerCase().includes('host is up')) {
                hostInfo.status = 'up';
            }
            if (line.toLowerCase().includes('latency')) {
                const latencyMatch = line.match(/(\d+\.?\d*)s\s+latency/i);
                if (latencyMatch) {
                    hostInfo.latency = `${latencyMatch[1]}s`;
                }
            }
            if (line.toLowerCase().includes('mac address')) {
                const macMatch = line.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/);
                if (macMatch) {
                    hostInfo.mac_address = macMatch[0];
                }
            }
        });
        
        return hostInfo;
    };

    // Helper functions for scan summary
    const extractTotalPortsFromText = (text) => {
        const match = text.match(/(\d+)\s+ports?\s+scanned/i);
        return match ? parseInt(match[1]) : 0;
    };

    const extractOpenPortsCountFromText = (text) => {
        const openPorts = extractPortsFromText(text).filter(p => p.state === 'open');
        return openPorts.length;
    };

    const extractFilteredPortsCountFromText = (text) => {
        const filteredPorts = extractPortsFromText(text).filter(p => p.state === 'filtered');
        return filteredPorts.length;
    };

    const extractClosedPortsCountFromText = (text) => {
        const closedPorts = extractPortsFromText(text).filter(p => p.state === 'closed');
        return closedPorts.length;
    };

    return (
        <div className={`
            relative overflow-hidden
            bg-white/95 backdrop-blur-xl
            rounded-2xl shadow-lg hover:shadow-xl
            transition-all duration-300 ease-out
            border border-white/20
            min-h-52 sm:min-h-60
            p-5 sm:p-6
            flex flex-col
            ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1.5'}
            ${isDisabled ? 'bg-gray-100/70' : ''}
            border-l-4 border-l-purple-600
        `}>
            {/* Shimmer effect */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
            
            {/* Card Title */}
            <h2 className="
                text-center text-lg sm:text-xl font-bold
                text-purple-600 mb-5
                pb-3 border-b-2 border-purple-600
                tracking-wide
            ">
                2. Network Scanning
            </h2>

            {/* Card Content */}
            <div className="flex flex-col flex-grow text-center justify-between items-center">
                <p className="
                    text-gray-600 text-sm sm:text-base
                    leading-relaxed mb-4
                    text-center
                ">
                    Enumerate all externally accessible services and ports to ensure secure configurations in the <b>{targetIP || 'target system'}</b>.
                </p>

                {/* Progress Display
                {scanProgress && !isCompleted && (
                    <div className="
                        my-3 px-4 py-2
                        bg-blue-50 border border-blue-200
                        rounded-lg text-sm text-blue-700
                        font-medium
                    ">
                        {scanProgress}
                    </div>
                )} */}

                <button
                    onClick={performNetworkScan}
                    className={`
                        w-full py-2.5 sm:py-3 px-4 sm:px-6
                        mt-3 border-none rounded-lg
                        text-xs sm:text-sm font-bold
                        uppercase tracking-widest
                        transition-all duration-300
                        flex items-center justify-center
                        ${!isDisabled && !isScanning && !isCompleted && targetIP
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                        disabled:opacity-60
                    `}
                    disabled={isDisabled || isScanning || isCompleted || !targetIP}
                >
                    {isCompleted 
                        ? 'Completed ✓' 
                        : isScanning 
                        ? 'Scanning...' 
                        : 'Start Network Scan'}
                </button>
            </div>

{isScanning && (
  <div className="absolute inset-0 bg-white/98 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl z-10 animate-fade-in">
    {/* Spinner */}
    <div className="relative w-16 h-16 mb-6">
      <div className="absolute inset-0 rounded-full border-4 border-purple-200" />
      <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin" />
    </div>
    <h3 className="text-purple-600 font-semibold text-base sm:text-lg mb-2">
      Scanning Network
    </h3>
    <p className="text-gray-600 text-xs sm:text-sm text-center px-4">
      Discovering services and open ports...
    </p>
  </div>
)}





            {/* Completion overlay */}
            {isCompleted && (
    <div className="absolute inset-0 bg-white/98 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl z-10 animate-fade-in px-4">
        <div className="w-14 h-14 mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg animate-pulse">
            ✓
        </div>
        <h3 className="text-purple-600 font-semibold text-base sm:text-lg mb-2">Scan Complete</h3>
        <p className="text-gray-600 text-xs sm:text-sm text-center">
            Network data saved as JSON file
        </p>
    </div>
)}

        </div>
    );
};

export default NetworkScanningCard;