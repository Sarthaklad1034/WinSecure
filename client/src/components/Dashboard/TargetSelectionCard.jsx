// import React, { useState } from 'react';
// import styles from './../css/VulnerabilityAssessment.module.css';

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
//                 // First, get the JSON data for processing
//                 return response.json();
//             })
//             .then(systemData => {
//                 // Extract the system data for the parent component
//                 const extractedSystemData = {
//                     ip: targetIP,
//                     timestamp: new Date().toISOString(),
//                     systemInfo: systemData,
//                     // Add any additional processing of the system data here
//                 };

//                 // Create and download the file for user reference
//                 const dataString = JSON.stringify(systemData, null, 2);
//                 const blob = new Blob([dataString], { type: 'application/json' });
//                 const url = window.URL.createObjectURL(blob);
//                 const a = document.createElement('a');
//                 a.style.display = 'none';
//                 a.href = url;
//                 a.download = `system_info_${targetIP.replace(/\./g, '_')}.json`;
//                 document.body.appendChild(a);
//                 a.click();
//                 window.URL.revokeObjectURL(url);
//                 document.body.removeChild(a);

//                 setIsProcessing(false);
//                 setIsCompleted(true);
                
//                 // Pass both IP and system data to parent component
//                 onComplete({
//                     ip: targetIP,
//                     systemData: extractedSystemData
//                 });
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 alert(`Failed to collect target information: ${error.message}`);
//                 setIsProcessing(false);
//             });
//     };

//     return (
//         <div className={`${styles.card} ${styles.targetCard} ${isDisabled ? styles.disabledCard : ''}`}>
//             <h2 className={styles.cardTitle}>1. Target Selection</h2>
//             <form onSubmit={handleSubmit} className={styles.cardForm}>
//                 <div className={styles.formGroup}>
//                     <label>Target IP Address</label>
//                     <input
//                         type="text"
//                         value={targetIP}
//                         onChange={handleIPChange}
//                         placeholder="Enter IP Address"
//                         className={styles.targetInputField}
//                         disabled={isDisabled || isProcessing || isCompleted}
//                         required
//                     />
//                 </div>

//                 <button
//                     type="submit"
//                     className={`${styles.cardButton} ${styles.targetConfirmButton}`}
//                     disabled={!isFormValid || isDisabled || isProcessing || isCompleted}
//                 >
//                     {isCompleted ? 'Completed' : isProcessing ? 'Processing...' : 'Confirm Target'}
//                 </button>
//             </form>

//             {/* Processing overlay with green theme */}
//             {isProcessing && (
//                 <div className={styles.targetProcessingOverlay}>
//                     <div className={styles.targetProcessingSpinner}></div>
//                     <h3 className={styles.targetProcessingTitle}>
//                         Validating Target
//                     </h3>
//                     <p className={styles.targetProcessingText}>
//                         Collecting system information...
//                     </p>
//                 </div>
//             )}

//             {/* Completion overlay with green theme */}
//             {isCompleted && (
//                 <div className={styles.targetCompletionOverlay}>
//                     <div className={styles.targetCompletionIcon}>
//                         ✓
//                     </div>
//                     <h3 className={styles.targetCompletionTitle}>
//                         Target Confirmed
//                     </h3>
//                     <p className={styles.targetCompletionText}>
//                         System information collected successfully
//                     </p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TargetSelectionCard;

import React, { useState } from 'react';

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
            border-l-4 border-l-indigo-500
        `}>
            {/* Shimmer effect */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
            
            {/* Card Title */}
            <h2 className="
                text-center text-lg sm:text-xl font-bold
                text-indigo-600 mb-5
                pb-3 border-b-2 border-indigo-500
                tracking-wide
            ">
                1. Target Selection
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 flex-grow">
                <div className="flex flex-col gap-2">
                    <label className="
                        text-slate-700 font-semibold text-xs sm:text-sm
                        uppercase tracking-wider text-left
                    ">
                        Target IP Address
                    </label>
                    <input
                        type="text"
                        value={targetIP}
                        onChange={handleIPChange}
                        placeholder="Enter IP Address"
                        className="
                            w-full px-3 py-3 sm:px-4 sm:py-3
                            border-2 border-indigo-200
                            rounded-lg text-sm sm:text-base
                            transition-all duration-300
                            bg-indigo-50/50
                            focus:outline-none focus:border-indigo-500
                            focus:ring-2 focus:ring-indigo-200 focus:bg-white
                            disabled:bg-gray-100 disabled:cursor-not-allowed
                        "
                        disabled={isDisabled || isProcessing || isCompleted}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={`
                        w-full py-2.5 sm:py-3 px-4 sm:px-6
                        mt-3 border-none rounded-lg
                        text-xs sm:text-sm font-bold
                        uppercase tracking-widest
                        transition-all duration-300
                        flex items-center justify-center
                        ${isFormValid && !isDisabled && !isProcessing && !isCompleted
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                        disabled:opacity-60
                    `}
                    disabled={!isFormValid || isDisabled || isProcessing || isCompleted}
                >
                    {isCompleted ? 'Completed' : isProcessing ? 'Processing...' : 'Confirm Target'}
                </button>
            </form>

           {isProcessing && (
  <div className="
      absolute inset-0 
      bg-white/98 backdrop-blur-md
      flex flex-col items-center justify-center
      rounded-2xl z-10
      animate-fade-in
  ">
    {/* Modern Material-style Spinner */}
    <div className="relative w-16 h-16 mb-6">
      <div className="absolute inset-0 rounded-full border-4 border-indigo-200" />
      <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
    </div>

    <h3 className="text-indigo-600 font-semibold text-base sm:text-lg mb-2">
      Validating Target
    </h3>
    <p className="text-gray-600 text-xs sm:text-sm text-center px-4">
      Collecting system information...
    </p>
  </div>
)}


            {/* Completion overlay */}
            {isCompleted && (
                <div className="
                    absolute inset-0 
                    bg-white/98 backdrop-blur-md
                    flex flex-col items-center justify-center
                    rounded-2xl z-10
                    animate-fade-in
                ">
                    <div className="
                        w-12 h-12 sm:w-14 sm:h-14
                        bg-gradient-to-r from-indigo-600 to-purple-600
                        rounded-full flex items-center justify-center
                        mb-4 text-white text-lg sm:text-xl font-bold
                        shadow-lg animate-pulse
                    ">
                        ✓
                    </div>
                    <h3 className="
                        text-indigo-600 font-semibold
                        text-base sm:text-lg mb-2
                    ">
                        Target Confirmed
                    </h3>
                    <p className="
                        text-gray-600 text-xs sm:text-sm
                        text-center px-4
                    ">
                        System information collected successfully
                    </p>
                </div>
            )}
        </div>
    );
};

export default TargetSelectionCard;