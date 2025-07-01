// import React, { useState } from 'react';
// import styles from './css/VulnerabilityAssessment.module.css';

// const TargetSelectionCard = ({ onComplete, isDisabled }) => {
//     const [targetIP, setTargetIP] = useState('');
//     const [isFormValid, setIsFormValid] = useState(false);
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [isCompleted, setIsCompleted] = useState(false);

//     const handleIPChange = (e) => {
//         const ip = e.target.value;
//         setTargetIP(ip);

//         // Validate IP address format
//         const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
//         setIsFormValid(ipRegex.test(ip));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         if (!isFormValid) return;

//         setIsProcessing(true);

//         fetch('/collect-target-info', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 ip_address: targetIP,
//             })
//         })
//             .then(response => {
//                 if (!response.ok) {
//                     return response.json().then(errorData => {
//                         throw new Error(errorData.message || 'Network response was not ok');
//                     });
//                 }
//                 return response.blob();
//             })
//             .then(blob => {
//                 const url = window.URL.createObjectURL(blob);
//                 const a = document.createElement('a');
//                 a.style.display = 'none';
//                 a.href = url;
//                 a.download = `system_info_${targetIP.replace(/\./g, '_')}.txt`;
//                 document.body.appendChild(a);
//                 a.click();
//                 window.URL.revokeObjectURL(url);

//                 setIsProcessing(false);
//                 setIsCompleted(true);
//                 onComplete(targetIP);
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 alert(`Failed to collect target information: ${error.message}`);
//                 setIsProcessing(false);
//             });
//     };

//     return (
//         <div className={styles.card} style={{ position: 'relative', overflow: 'hidden', minHeight: '200px' }}>
//             <h2 className={styles.cardTitle}>1. Target Selection</h2>
//             <form onSubmit={handleSubmit} className={styles.cardForm}>
//                 <div className={styles.formGroup}>
//                     <label>Target IP Address</label>
//                     <input
//                         type="text"
//                         value={targetIP}
//                         onChange={handleIPChange}
//                         placeholder="Enter IP Address"
//                         style={{ width: '90%', padding: '10px' }}
//                         disabled={isDisabled || isProcessing || isCompleted}
//                         required
//                     />
//                 </div>

//                 <button
//                     type="submit"
//                     className={styles.cardButton}
//                     disabled={!isFormValid || isDisabled || isProcessing || isCompleted}
//                 >
//                     {isCompleted ? 'Completed' : isProcessing ? 'Processing...' : 'Confirm Target'}
//                 </button>
//             </form>

//             {/* Processing overlay with light blue theme - matching other cards dimensions */}
//             {isProcessing && (
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
//                         Validating Target
//                     </h3>
//                     <p style={{
//                         margin: 0,
//                         color: '#666',
//                         fontSize: '14px'
//                     }}>
//                         Collecting system information...
//                     </p>
//                 </div>
//             )}

//             {/* Completion overlay with light green theme - matching other cards dimensions */}
//             {isCompleted && (
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
//                         Target Confirmed
//                     </h3>
//                     <p style={{
//                         margin: 0,
//                         color: '#666',
//                         fontSize: '14px'
//                     }}>
//                         System information collected successfully
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

// export default TargetSelectionCard;

import React, { useState } from 'react';
import styles from './../css/VulnerabilityAssessment.module.css';

const TargetSelectionCard = ({ onComplete, isDisabled }) => {
    const [targetIP, setTargetIP] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleIPChange = (e) => {
        const ip = e.target.value;
        setTargetIP(ip);

        // Validate IP address format
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        setIsFormValid(ipRegex.test(ip));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isFormValid) return;

        setIsProcessing(true);

        fetch('/collect-target-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ip_address: targetIP,
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || 'Network response was not ok');
                    });
                }
                // First, get the JSON data for processing
                return response.json();
            })
            .then(systemData => {
                // Extract the system data for the parent component
                const extractedSystemData = {
                    ip: targetIP,
                    timestamp: new Date().toISOString(),
                    systemInfo: systemData,
                    // Add any additional processing of the system data here
                };

                // Create and download the file for user reference
                const dataString = JSON.stringify(systemData, null, 2);
                const blob = new Blob([dataString], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `system_info_${targetIP.replace(/\./g, '_')}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setIsProcessing(false);
                setIsCompleted(true);
                
                // Pass both IP and system data to parent component
                onComplete({
                    ip: targetIP,
                    systemData: extractedSystemData
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`Failed to collect target information: ${error.message}`);
                setIsProcessing(false);
            });
    };

    return (
        <div className={`${styles.card} ${styles.targetCard} ${isDisabled ? styles.disabledCard : ''}`}>
            <h2 className={styles.cardTitle}>1. Target Selection</h2>
            <form onSubmit={handleSubmit} className={styles.cardForm}>
                <div className={styles.formGroup}>
                    <label>Target IP Address</label>
                    <input
                        type="text"
                        value={targetIP}
                        onChange={handleIPChange}
                        placeholder="Enter IP Address"
                        className={styles.targetInputField}
                        disabled={isDisabled || isProcessing || isCompleted}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={`${styles.cardButton} ${styles.targetConfirmButton}`}
                    disabled={!isFormValid || isDisabled || isProcessing || isCompleted}
                >
                    {isCompleted ? 'Completed' : isProcessing ? 'Processing...' : 'Confirm Target'}
                </button>
            </form>

            {/* Processing overlay with green theme */}
            {isProcessing && (
                <div className={styles.targetProcessingOverlay}>
                    <div className={styles.targetProcessingSpinner}></div>
                    <h3 className={styles.targetProcessingTitle}>
                        Validating Target
                    </h3>
                    <p className={styles.targetProcessingText}>
                        Collecting system information...
                    </p>
                </div>
            )}

            {/* Completion overlay with green theme */}
            {isCompleted && (
                <div className={styles.targetCompletionOverlay}>
                    <div className={styles.targetCompletionIcon}>
                        ✓
                    </div>
                    <h3 className={styles.targetCompletionTitle}>
                        Target Confirmed
                    </h3>
                    <p className={styles.targetCompletionText}>
                        System information collected successfully
                    </p>
                </div>
            )}
        </div>
    );
};

export default TargetSelectionCard;