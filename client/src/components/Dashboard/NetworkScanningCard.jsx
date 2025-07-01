// import React, { useState } from 'react';
// import styles from './css/VulnerabilityAssessment.module.css';

// const NetworkScanningCard = ({ onComplete, isDisabled, targetIP }) => {
//     const [isScanning, setIsScanning] = useState(false);
//     const [scanResults, setScanResults] = useState(null);
//     const [isCardCompleted, setIsCardCompleted] = useState(false);

//     console.log("Using targetIP:", targetIP);

//     const handleStartScan = () => {
//         setIsScanning(true);

//         fetch('http://localhost:5000/network-scan', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ ip_address: targetIP })
//         })
//         .then(response => {
//             if (!response.ok) {
//                 return response.json().then(errorData => {
//                     throw new Error(errorData.message || 'Network scan failed');
//                 });
//             }
//             return response.text(); // Get plain text response (e.g., nmap results)
//         })
//         .then(scanResultText => {
//             setScanResults(scanResultText);

//             // Download logic
//             const blob = new Blob([scanResultText], { type: 'text/plain' });
//             const url = window.URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.style.display = 'none';
//             a.href = url;
//             a.download = `network_scan_${targetIP.replace(/\./g, '_')}.txt`;
//             document.body.appendChild(a);
//             a.click();
//             window.URL.revokeObjectURL(url);

//             setIsScanning(false);
//             setIsCardCompleted(true);
//             onComplete(scanResultText); // Send result to parent
//         })
//         .catch(error => {
//             console.error('Network Scan Error:', error);
//             alert(`Network Scan Failed: ${error.message}`);
//             setIsScanning(false);
//         });
//     };

//     return (
//         <div className={`${styles.card} ${isDisabled ? styles.disabledCard : ''}`} style={{ position: 'relative', overflow: 'hidden', minHeight: '200px' }}>
//             <h2 className={styles.cardTitle}>2. Network Scanning</h2>

//             <div className={styles.cardContent}>
//                 <p>Perform network scanning for {targetIP}</p>

//                 <button
//                     onClick={handleStartScan}
//                     className={styles.cardButton}
//                     disabled={isDisabled || isScanning || isCardCompleted}
//                 >
//                     {isCardCompleted
//                         ? 'Completed'
//                         : isScanning
//                         ? 'Scanning...'
//                         : 'Start Network Scan'}
//                 </button>
//             </div>

//             {/* Processing overlay with blue theme - matching other cards dimensions */}
//             {isScanning && (
//                 <div style={{
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     background: 'white',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     borderRadius: 'inherit',
//                     zIndex: 10,
//                     minHeight: '200px'
//                 }}>
//                     <div style={{
//                         width: '60px',
//                         height: '60px',
//                         border: '4px solid #e3f2fd',
//                         borderTop: '4px solid #2196F3',
//                         borderRadius: '50%',
//                         animation: 'spin 1s linear infinite',
//                         margin: '0 auto 20px'
//                     }}></div>
//                     <h3 style={{
//                         margin: '0 0 10px 0',
//                         color: '#1976D2',
//                         fontSize: '18px',
//                         fontWeight: '600'
//                     }}>
//                         Scanning Network
//                     </h3>
//                     <p style={{
//                         margin: 0,
//                         color: '#666',
//                         fontSize: '14px'
//                     }}>
//                         Discovering open ports and services...
//                     </p>
//                 </div>
//             )}

//             {/* Completion overlay with green theme - matching other cards dimensions */}
//             {isCardCompleted && (
//                 <div style={{
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     background: 'white',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     borderRadius: 'inherit',
//                     zIndex: 10,
//                     minHeight: '200px'
//                 }}>
//                     <div style={{
//                         width: '60px',
//                         height: '60px',
//                         backgroundColor: '#4CAF50',
//                         borderRadius: '50%',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         margin: '0 auto 20px',
//                         color: 'white',
//                         fontSize: '24px',
//                         fontWeight: 'bold'
//                     }}>
//                         ✓
//                     </div>
//                     <h3 style={{
//                         margin: '0 0 10px 0',
//                         color: '#2E7D32',
//                         fontSize: '18px',
//                         fontWeight: '600'
//                     }}>
//                         Scan Complete
//                     </h3>
//                     <p style={{
//                         margin: 0,
//                         color: '#666',
//                         fontSize: '14px'
//                     }}>
//                         Network ports and services mapped
//                     </p>
//                 </div>
//             )}

//             {/* CSS for spinner animation */}
//             <style jsx>{`
//                 @keyframes spin {
//                     0% { transform: rotate(0deg); }
//                     100% { transform: rotate(360deg); }
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default NetworkScanningCard;

// import React, { useState } from 'react';
// import styles from './css/VulnerabilityAssessment.module.css';

// const NetworkScanningCard = ({ onComplete, isDisabled, targetIP }) => {
//     const [isScanning, setIsScanning] = useState(false);
//     const [scanResults, setScanResults] = useState(null);
//     const [isCardCompleted, setIsCardCompleted] = useState(false);

//     console.log("Using targetIP:", targetIP);

//     const handleStartScan = () => {
//         setIsScanning(true);

//         fetch('http://localhost:5000/network-scan', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ ip_address: targetIP })
//         })
//         .then(response => {
//             if (!response.ok) {
//                 return response.json().then(errorData => {
//                     throw new Error(errorData.message || 'Network scan failed');
//                 });
//             }
//             return response.text(); // Get plain text response (e.g., nmap results)
//         })
//         .then(scanResultText => {
//             setScanResults(scanResultText);

//             // Download logic
//             const blob = new Blob([scanResultText], { type: 'text/plain' });
//             const url = window.URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.style.display = 'none';
//             a.href = url;
//             a.download = `network_scan_${targetIP.replace(/\./g, '_')}.txt`;
//             document.body.appendChild(a);
//             a.click();
//             window.URL.revokeObjectURL(url);

//             setIsScanning(false);
//             setIsCardCompleted(true);
//             onComplete(scanResultText); // Send result to parent
//         })
//         .catch(error => {
//             console.error('Network Scan Error:', error);
//             alert(`Network Scan Failed: ${error.message}`);
//             setIsScanning(false);
//         });
//     };

//     return (
//         <div className={`${styles.card} ${styles.networkCard} ${isDisabled ? styles.disabledCard : ''}`}>
//             <h2 className={styles.cardTitle}>2. Network Scanning</h2>

//             <div className={styles.cardContent}>
//                 <p>Perform network scanning for {targetIP}</p>

//                 <button
//                     onClick={handleStartScan}
//                     className={`${styles.cardButton} ${styles.networkScanButton}`}
//                     disabled={isDisabled || isScanning || isCardCompleted}
//                 >
//                     {isCardCompleted
//                         ? 'Completed'
//                         : isScanning
//                         ? 'Scanning...'
//                         : 'Start Network Scan'}
//                 </button>
//             </div>

//             {/* Processing overlay */}
//             {isScanning && (
//                 <div className={styles.networkProcessingOverlay}>
//                     <div className={styles.networkProcessingSpinner}></div>
//                     <h3 className={styles.networkProcessingTitle}>
//                         Scanning Network
//                     </h3>
//                     <p className={styles.networkProcessingText}>
//                         Discovering open ports and services...
//                     </p>
//                 </div>
//             )}

//             {/* Completion overlay */}
//            {isCardCompleted && (
//     <div className={styles.networkCompletionOverlay}>
//         <div className={styles.networkCompletionIcon}>✓</div>
//         <h3 className={styles.networkCompletionTitle}>Scan Complete</h3>
//         <p className={styles.networkCompletionText}>Network ports and services mapped</p>
//     </div>
// )}

//         </div>
//     );
// };

// export default NetworkScanningCard;

import React, { useState } from 'react';
import styles from './../css/VulnerabilityAssessment.module.css';

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
        <div className={`${styles.card} ${styles.networkCard} ${isDisabled ? styles.disabledCard : ''}`}>
            <h2 className={styles.cardTitle}>2. Network Scanning</h2>
            <div className={styles.cardContent}>
<p>Enumerate all externally accessible services and ports to ensure secure configurations in the <b>{targetIP || 'target system'}</b>.</p>      
                {scanProgress && !isCompleted && (
                    <div style={{ 
                        margin: '10px 0', 
                        padding: '8px', 
                        background: '#e8f4fd', 
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#1976d2'
                    }}>
                        {scanProgress}
                    </div>
                )}

                <button
                    onClick={performNetworkScan}
                    className={`${styles.cardButton} ${styles.networkButton}`}
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
                <div className={styles.networkProcessingOverlay}>
                    <div className={styles.networkProcessingSpinner}></div>
                    <h3 className={styles.networkProcessingTitle}>Scanning Network</h3>
                    <p className={styles.networkProcessingText}>Discovering services and open ports...</p>
                </div>
            )}

            {isCompleted && (
                <div className={styles.networkCompletionOverlay}>
                    <div className={styles.networkCompletionIcon}>✓</div>
                    <h3 className={styles.networkCompletionTitle}>Scan Complete</h3>
                    <p className={styles.networkCompletionText}>Network data saved as JSON file</p>
                </div>
            )}
        </div>
    );
};

export default NetworkScanningCard;