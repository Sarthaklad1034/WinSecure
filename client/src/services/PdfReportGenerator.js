// services/PdfReportGenerator.js
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

class VulnerabilityReportGenerator {
    constructor() {
        this.pdf = null;
        this.currentY = 20;
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.contentWidth = 170; // A4 width minus margins
    }

    // Initialize PDF document
    initializePDF() {
        this.pdf = new jsPDF("p", "mm", "a4");
        this.currentY = 20;
    }

    // Check if we need a new page
    checkPageBreak(requiredHeight = 20) {
        if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
            this.pdf.addPage();
            this.currentY = 20;
            return true;
        }
        return false;
    }

    // Add title to PDF
    addTitle(title, fontSize = 20, color = [44, 62, 80]) {
        this.pdf.setFontSize(fontSize);
        this.pdf.setTextColor(...color);
        this.pdf.setFont("helvetica", "bold");

        const textWidth = this.pdf.getTextWidth(title);
        const x = (210 - textWidth) / 2; // Center horizontally

        this.pdf.text(title, x, this.currentY);
        this.currentY += 15;
    }

    // Add section header
    addSectionHeader(title, color = [52, 152, 219]) {
        this.checkPageBreak(30); // Increased space requirement

        // Add space before section
        this.currentY += 15;

        // Background rectangle for section header
        this.pdf.setFillColor(...color);
        this.pdf.rect(this.margin, this.currentY - 8, this.contentWidth, 14, "F"); // Increased height

        // Section title text
        this.pdf.setFontSize(14);
        this.pdf.setTextColor(255, 255, 255);
        this.pdf.setFont("helvetica", "bold");
        this.pdf.text(title, this.margin + 5, this.currentY + 2); // Adjusted positioning

        this.currentY += 15; // Add space after header
    }

    // Add key-value pair
    addKeyValue(key, value, indent = 0) {
        this.checkPageBreak(10);

        const x = this.margin + indent;

        // Key (bold)
        this.pdf.setFontSize(10);
        this.pdf.setFont("helvetica", "bold");
        this.pdf.setTextColor(44, 62, 80);
        this.pdf.text(`${key}:`, x, this.currentY);

        // Value (normal)
        this.pdf.setFont("helvetica", "normal");
        this.pdf.setTextColor(52, 73, 94);

        const keyWidth = this.pdf.getTextWidth(`${key}: `) + 10;
        const maxValueWidth = this.contentWidth - keyWidth - indent;
        const valueLines = this.pdf.splitTextToSize(String(value), maxValueWidth);

        this.pdf.text(valueLines, x + keyWidth, this.currentY);
        this.currentY += valueLines.length * 6 + 4;
    }

    // Add table
    addTable(headers, rows, title = null) {
        if (title) {
            this.addSubHeader(title);
        }

        const colWidth = this.contentWidth / headers.length;
        const rowHeight = 8;

        this.checkPageBreak(rowHeight * (rows.length + 2));

        // Table headers
        this.pdf.setFillColor(236, 240, 241);
        this.pdf.rect(
            this.margin,
            this.currentY,
            this.contentWidth,
            rowHeight,
            "F"
        );

        this.pdf.setFontSize(9);
        this.pdf.setFont("helvetica", "bold");
        this.pdf.setTextColor(44, 62, 80);

        headers.forEach((header, index) => {
            const x = this.margin + index * colWidth + 2;
            this.pdf.text(header, x, this.currentY + 5);
        });

        this.currentY += rowHeight;

        // Table rows
        this.pdf.setFont("helvetica", "normal");
        this.pdf.setTextColor(52, 73, 94);

        rows.forEach((row, rowIndex) => {
            // Alternate row colors
            if (rowIndex % 2 === 0) {
                this.pdf.setFillColor(249, 249, 249);
                this.pdf.rect(
                    this.margin,
                    this.currentY,
                    this.contentWidth,
                    rowHeight,
                    "F"
                );
            }

            row.forEach((cell, colIndex) => {
                const x = this.margin + colIndex * colWidth + 2;
                const cellText = this.pdf.splitTextToSize(String(cell), colWidth - 4);
                this.pdf.text(cellText[0] || "", x, this.currentY + 5);
            });

            this.currentY += rowHeight;
        });

        this.currentY += 5;
    }

    // Add sub header
    addSubHeader(title, color = [149, 165, 166]) {
        this.checkPageBreak(15);

        this.pdf.setFontSize(12);
        this.pdf.setFont("helvetica", "bold");
        this.pdf.setTextColor(...color);
        this.pdf.text(title, this.margin, this.currentY);

        // Underline
        const textWidth = this.pdf.getTextWidth(title);
        this.pdf.setDrawColor(...color);
        this.pdf.line(
            this.margin,
            this.currentY + 2,
            this.margin + textWidth,
            this.currentY + 2
        );

        this.currentY += 12;
    }

    // Add vulnerability severity indicator
    addSeverityIndicator(severity, count) {
        const colors = {
            Critical: [231, 76, 60],
            High: [230, 126, 34],
            Medium: [241, 196, 15],
            Low: [46, 204, 113],
            Info: [52, 152, 219],
            critical: [231, 76, 60],
            high: [230, 126, 34],
            medium: [241, 196, 15],
            low: [46, 204, 113],
            info: [52, 152, 219],
            unknown: [127, 140, 141],
            Unknown: [127, 140, 141],
        };

        const color = colors[severity] || [127, 140, 141];

        // Draw colored rectangle
        this.pdf.setFillColor(...color);
        this.pdf.rect(this.margin, this.currentY - 3, 4, 6, "F");

        // Add text
        this.pdf.setFontSize(10);
        this.pdf.setFont("helvetica", "normal");
        this.pdf.setTextColor(44, 62, 80);
        this.pdf.text(`${severity}: ${count}`, this.margin + 8, this.currentY);

        this.currentY += 8;
    }

    // Enhanced safe value getter with deep path support
    safeGet(obj, path, fallback = "N/A") {
        try {
            if (!obj || typeof obj !== "object") {
                return fallback;
            }

            const keys = path.split(".");
            let result = obj;

            for (const key of keys) {
                if (result == null || result == undefined) {
                    return fallback;
                }
                result = result[key];
            }

            if (
                result === null ||
                result === undefined ||
                result === "" ||
                result === "N/A" ||
                result === "Unknown"
            ) {
                return fallback;
            }

            if (typeof result === "number" && result === 0) {
                return result;
            }

            return result;
        } catch (error) {
            console.warn(`Error accessing path '${path}':`, error);
            return fallback;
        }
    }

    // Extract target IP from various possible locations
    extractTargetIP(reportData) {
        const possiblePaths = [
            "target.ip",
            "target.systemData.ip",
            "targetIP",
            "ip_address",
            "target_ip",
            "networkScan.target_ip",
            "vulnerabilityAssessment.target_ip",
        ];

        for (const path of possiblePaths) {
            const value = this.safeGet(reportData, path);
            if (value !== "N/A" && value) {
                return value;
            }
        }

        return "192.168.56.1"; // Default fallback
    }

    // FIXED: Extract system information - corrected to match actual data structure
    extractSystemInfo(reportData) {
        console.log(
            "PDF Generator - Full reportData structure:",
            JSON.stringify(reportData, null, 2)
        );

        const systemInfo = {
            os: "Unknown",
            hostname: "Unknown",
            systemType: "Unknown Unknown",
            totalMemory: "Unknown",
        };

        // Get the system data from the correct path
        const systemData = this.safeGet(reportData, "target.systemData");
        if (!systemData || typeof systemData !== "object") {
            console.warn("No system data found at target.systemData");
            return systemInfo;
        }

        console.log("Found systemData:", systemData);

        // Check if there's a nested systemInfo object
        let actualSystemInfo = systemData;
        if (systemData.systemInfo) {
            actualSystemInfo = systemData.systemInfo;
            console.log("Using nested systemInfo:", actualSystemInfo);
        }

        // Extract OS information - FIXED paths
        const osPaths = [
            "os.name", // Primary path based on actual data structure
            "systemInfo.os.name", // Alternative nested path
            "os", // Direct os value
            "operating_system", // Alternative naming
            "osName", // Camel case variant
        ];

        for (const path of osPaths) {
            const osValue =
                this.safeGet(actualSystemInfo, path) || this.safeGet(systemData, path);
            if (osValue && osValue !== "Unknown" && osValue !== "N/A") {
                systemInfo.os = osValue;
                console.log(`Found OS at path ${path}:`, osValue);
                break;
            }
        }

        // Extract hostname - FIXED paths
        const hostnamePaths = [
            "hostname",
            "systemInfo.hostname",
            "computer_name",
            "computerName",
            "host",
            "name",
        ];

        for (const path of hostnamePaths) {
            const hostnameValue =
                this.safeGet(actualSystemInfo, path) || this.safeGet(systemData, path);
            if (
                hostnameValue &&
                hostnameValue !== "Unknown" &&
                hostnameValue !== "N/A"
            ) {
                systemInfo.hostname = hostnameValue;
                console.log(`Found hostname at path ${path}:`, hostnameValue);
                break;
            }
        }

        // Extract manufacturer and model for system type - FIXED paths
        const manufacturerPaths = [
            "hardware.manufacturer", // Primary path based on actual data
            "systemInfo.hardware.manufacturer", // Alternative nested path
            "manufacturer",
            "vendor",
        ];

        const modelPaths = [
            "hardware.model", // Primary path based on actual data
            "systemInfo.hardware.model", // Alternative nested path
            "model",
            "product",
        ];

        let manufacturer = "Unknown";
        let model = "Unknown";

        for (const path of manufacturerPaths) {
            const value =
                this.safeGet(actualSystemInfo, path) || this.safeGet(systemData, path);
            if (value && value !== "Unknown" && value !== "N/A") {
                manufacturer = value;
                console.log(`Found manufacturer at path ${path}:`, value);
                break;
            }
        }

        for (const path of modelPaths) {
            const value =
                this.safeGet(actualSystemInfo, path) || this.safeGet(systemData, path);
            if (value && value !== "Unknown" && value !== "N/A") {
                model = value;
                console.log(`Found model at path ${path}:`, value);
                break;
            }
        }

        // Combine manufacturer and model
        if (manufacturer !== "Unknown" || model !== "Unknown") {
            systemInfo.systemType = `${manufacturer} ${model}`.trim();
            // Clean up double "Unknown"
            if (systemInfo.systemType === "Unknown Unknown") {
                systemInfo.systemType = "Unknown";
            }
        }

        // Extract total memory - FIXED paths
        const memoryPaths = [
            "hardware.total_physical_memory", // Primary path based on actual data
            "systemInfo.hardware.total_physical_memory", // Alternative nested path
            "total_physical_memory",
            "totalPhysicalMemory",
            "total_memory",
            "totalMemory",
            "memory.total",
            "memory",
            "ram",
        ];

        for (const path of memoryPaths) {
            const memoryValue =
                this.safeGet(actualSystemInfo, path) || this.safeGet(systemData, path);
            if (memoryValue && memoryValue !== "Unknown" && memoryValue !== "N/A") {
                // Handle different memory formats
                if (
                    typeof memoryValue === "string" &&
                    (memoryValue.includes("GB") || memoryValue.includes("MB"))
                ) {
                    systemInfo.totalMemory = memoryValue;
                } else if (typeof memoryValue === "number") {
                    // Convert bytes to GB if it's a large number (> 1GB)
                    if (memoryValue > 1073741824) {
                        systemInfo.totalMemory = `${(memoryValue / 1024 ** 3).toFixed(
              2
            )} GB`;
                    } else {
                        systemInfo.totalMemory = `${memoryValue} GB`;
                    }
                } else {
                    systemInfo.totalMemory = String(memoryValue);
                }
                console.log(`Found memory at path ${path}:`, memoryValue);
                break;
            }
        }

        console.log("PDF Generator - Final extracted system info:", systemInfo);
        return systemInfo;
    }

    // Extract vulnerability summary with flexible counting
    extractVulnerabilitySummary(reportData) {
        const summary = {
            total: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            unknown: 0,
        };

        // Try different paths for vulnerability data
        const vulnData = this.safeGet(reportData, "vulnerabilityAssessment", {});
        const vulnerabilities = this.safeGet(vulnData, "vulnerabilities", []);

        if (Array.isArray(vulnerabilities)) {
            summary.total = vulnerabilities.length;

            // Count by severity
            vulnerabilities.forEach((vuln) => {
                const severity = (vuln.severity || "unknown").toLowerCase();
                if (summary.hasOwnProperty(severity)) {
                    summary[severity]++;
                } else {
                    summary.unknown++;
                }
            });
        } else {
            // Try to get from summary object
            const summaryData = this.safeGet(vulnData, "summary", {});
            summary.total = this.safeGet(summaryData, "total", 0);
            summary.critical = this.safeGet(summaryData, "critical", 0);
            summary.high = this.safeGet(summaryData, "high", 0);
            summary.medium = this.safeGet(summaryData, "medium", 0);
            summary.low = this.safeGet(summaryData, "low", 0);
            summary.unknown = this.safeGet(summaryData, "unknown", 0);
        }

        return summary;
    }

    // Extract network scan results with flexible data handling
    extractNetworkScanResults(reportData) {
        const networkScan = this.safeGet(reportData, "networkScan", {});

        const results = {
            scanType: this.safeGet(networkScan, "scan_type", "network_scan"),
            status: this.safeGet(networkScan, "status", "completed"),
            timestamp: this.safeGet(
                networkScan,
                "scan_timestamp",
                new Date().toISOString()
            ),
            openPorts: {},
        };

        // Try to extract open ports from different possible structures
        let openPorts = this.safeGet(networkScan, "open_ports", {});

        if (Object.keys(openPorts).length === 0) {
            // Try alternative path
            openPorts = this.safeGet(networkScan, "results.open_ports", {});
        }

        if (Object.keys(openPorts).length === 0) {
            // Try to parse from raw_output if available
            const rawOutput = this.safeGet(networkScan, "raw_output", "");
            if (rawOutput) {
                try {
                    const parsed = JSON.parse(rawOutput);
                    openPorts = this.safeGet(parsed, "open_ports", {});
                } catch (e) {
                    console.warn("Failed to parse raw_output:", e);
                }
            }
        }

        results.openPorts = openPorts;
        return results;
    }

    // Generate complete vulnerability report with enhanced error handling
    // Also update your generateReport method to handle the backend response:
    async generateReport(reportData) {
        try {
            this.initializePDF();

            if (!reportData) {
                reportData = {};
            }

            console.log(
                "PDF Generator - Full Report Data:",
                JSON.stringify(reportData, null, 2)
            );

            // Extract data using enhanced methods
            const targetIP = this.extractTargetIP(reportData);
            const systemInfo = this.extractSystemInfo(reportData);
            const vulnSummary = this.extractVulnerabilitySummary(reportData);
            const networkResults = this.extractNetworkScanResults(reportData);

            console.log("PDF Generator - Extracted Data:", {
                targetIP,
                systemInfo,
                vulnSummary,
                networkResults,
            });

            // 1. Cover Page
            this.addCoverPage(reportData, targetIP);

            // 2. Executive Summary
            this.addExecutiveSummary(reportData, targetIP, vulnSummary);

            // 3. Target Information
            this.addTargetInformation(reportData, targetIP, systemInfo);

            // 4. Network Scan Results
            this.addNetworkScanResults(reportData, networkResults);

            // 5. Vulnerability Assessment Results
            this.addVulnerabilityResults(reportData, vulnSummary);

            // 6. Recommendations
            this.addRecommendations(reportData);

            // 7. Footer on each page
            this.addFooters(reportData, targetIP);

            // Save the PDF
            const fileName = `Vulnerability_Assessment_Report_${
        new Date().toISOString().split("T")[0]
      }_${targetIP.replace(/\./g, "_")}.pdf`;

            this.pdf.save(fileName);

            // LOG THE REPORT GENERATION
            this.logReportGeneration(reportData, targetIP, vulnSummary, true);

            return {
                success: true,
                fileName,
                message: "Report generated successfully",
            };
        } catch (error) {
            console.error("Error generating PDF report:", error);

            // LOG THE FAILED GENERATION
            const targetIP = this.extractTargetIP(reportData) || "Unknown";
            const vulnSummary = this.extractVulnerabilitySummary(reportData) || {
                total: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
            };
            this.logReportGeneration(
                reportData,
                targetIP,
                vulnSummary,
                false // Changed from "Failed" to false
            );

            return {
                success: false,
                error: error.message,
                message: "Failed to generate report",
            };
        }
    }

    // Cover Page - Enhanced
    addCoverPage(reportData, targetIP) {
        // Logo/Title area
        this.pdf.setFillColor(44, 62, 80);
        this.pdf.rect(0, 0, 210, 60, "F");

        this.pdf.setFontSize(28);
        this.pdf.setTextColor(255, 255, 255);
        this.pdf.setFont("helvetica", "bold");
        this.pdf.text("VULNERABILITY", 105, 25, { align: "center" });
        this.pdf.text("ASSESSMENT REPORT", 105, 40, { align: "center" });

        this.currentY = 80;

        // Report metadata
        this.pdf.setFontSize(12);
        this.pdf.setTextColor(44, 62, 80);
        this.pdf.setFont("helvetica", "normal");

        const reportId = this.safeGet(reportData, "reportId", `VULN_${Date.now()}`);
        const reportGenerated = this.safeGet(
            reportData,
            "reportGenerated",
            new Date().toISOString()
        );

        // Create metadata array
        const metadataItems = [
            { key: "Target IP", value: targetIP },
            { key: "Report ID", value: reportId },
            { key: "Generated", value: new Date(reportGenerated).toLocaleString() },
            { key: "Assessment Date", value: new Date().toLocaleDateString() },
            { key: "Status", value: "Complete" },
        ];

        // Add metadata
        metadataItems.forEach((item) => {
            this.addKeyValue(item.key, item.value);
        });

        // Assessment summary box
        this.currentY += 20;
        this.pdf.setFillColor(236, 240, 241);
        this.pdf.rect(this.margin, this.currentY, this.contentWidth, 40, "F");

        this.pdf.setFontSize(14);
        this.pdf.setFont("helvetica", "bold");
        this.pdf.setTextColor(44, 62, 80);
        this.pdf.text("Assessment Summary", this.margin + 5, this.currentY + 10);

        this.pdf.setFontSize(10);
        this.pdf.setFont("helvetica", "normal");
        this.pdf.text(
            "This report contains a comprehensive security assessment",
            this.margin + 5,
            this.currentY + 20
        );
        this.pdf.text(
            "of the target system including vulnerability identification",
            this.margin + 5,
            this.currentY + 27
        );
        this.pdf.text(
            "and risk analysis with remediation recommendations.",
            this.margin + 5,
            this.currentY + 34
        );

        this.pdf.addPage();
        this.currentY = 20;
    }

    // Executive Summary - Enhanced
    addExecutiveSummary(reportData, targetIP, vulnSummary) {
        this.addSectionHeader("EXECUTIVE SUMMARY");

        this.addSubHeader("Assessment Overview");

        const scanDate = this.safeGet(
            reportData,
            "reportGenerated",
            new Date().toISOString()
        );

        this.addKeyValue("Target System", targetIP);
        this.addKeyValue("Assessment Type", "Automated Vulnerability Assessment");
        this.addKeyValue("Total Vulnerabilities", vulnSummary.total);
        this.addKeyValue("Scan Date", new Date(scanDate).toLocaleString());

        // Add spacing before vulnerability summary
        this.currentY += 10;
        this.addSubHeader("Vulnerability Summary");

        // Display severity indicators
        const severityOrder = ["Critical", "High", "Medium", "Low", "Unknown"];
        severityOrder.forEach((severity) => {
            const count = vulnSummary[severity.toLowerCase()] || 0;
            this.addSeverityIndicator(severity, count);
        });
    }

    // Target Information Section - Enhanced
    addTargetInformation(reportData, targetIP, systemInfo) {
        this.addSectionHeader("TARGET INFORMATION");

        this.addKeyValue("Target IP Address", targetIP);
        this.addKeyValue("Operating System", systemInfo.os);
        this.addKeyValue("Hostname", systemInfo.hostname);
        this.addKeyValue("System Type", systemInfo.systemType);
        this.addKeyValue("Total Memory", systemInfo.totalMemory);
    }

    // Network Scan Results - Enhanced
    addNetworkScanResults(reportData, networkResults) {
        this.addSectionHeader("NETWORK SCAN RESULTS");

        this.addKeyValue("Scan Type", networkResults.scanType);
        this.addKeyValue("Scan Status", networkResults.status);
        this.addKeyValue(
            "Scan Timestamp",
            new Date(networkResults.timestamp).toLocaleString()
        );
        this.addKeyValue(
            "Open Ports Found",
            Object.keys(networkResults.openPorts).length
        );

        if (Object.keys(networkResults.openPorts).length > 0) {
            this.addSubHeader("Open Ports Details");

            const portHeaders = ["Port", "Service", "State", "Protocol"];
            const portRows = Object.entries(networkResults.openPorts).map(
                ([port, details]) => [
                    port,
                    details.service || details.name || "Unknown",
                    details.state || "open",
                    details.protocol || "TCP",
                ]
            );

            this.addTable(portHeaders, portRows);
        }
    }

    // Vulnerability Assessment Results - Enhanced
    addVulnerabilityResults(reportData, vulnSummary) {
            this.addSectionHeader("VULNERABILITY ASSESSMENT");

            this.addKeyValue("Total Vulnerabilities Identified", vulnSummary.total);

            const vulnerabilities = this.safeGet(
                reportData,
                "vulnerabilityAssessment.vulnerabilities", []
            );

            if (Array.isArray(vulnerabilities) && vulnerabilities.length > 0) {
                this.addSubHeader("Detailed Vulnerability Analysis");

                vulnerabilities.forEach((vuln, index) => {
                    this.checkPageBreak(80); // Increased to account for potential larger boxes

                    const severityColors = {
                        Critical: [231, 76, 60],
                        High: [230, 126, 34],
                        Medium: [241, 196, 15],
                        Low: [46, 204, 113],
                        Info: [52, 152, 219],
                        critical: [231, 76, 60],
                        high: [230, 126, 34],
                        medium: [241, 196, 15],
                        low: [46, 204, 113],
                        info: [52, 152, 219],
                    };

                    const severity = this.safeGet(vuln, "severity", "Medium");
                    const color = severityColors[severity] || [127, 140, 141];

                    // Calculate dynamic content height
                    const vulnTitle = this.safeGet(
                        vuln,
                        "title",
                        this.safeGet(vuln, "name", "Unknown Vulnerability")
                    );

                    const ultimateClean = (text) => {
                        return text
                            .replace(/[\r\n\t]/g, " ") // Replace line breaks and tabs with spaces
                            .replace(/\s+/g, " ") // Replace multiple whitespace with single space
                            .replace(/\u00A0/g, " ") // Replace non-breaking spaces
                            .replace(/\u2028/g, " ") // Replace line separator
                            .replace(/\u2029/g, " ") // Replace paragraph separator
                            .trim(); // Remove leading/trailing whitespace
                    };

                    const description = ultimateClean(
                        this.safeGet(vuln, "description", "No description available")
                    );

                    const descLines = this.pdf.splitTextToSize(
                        description,
                        this.contentWidth - 15
                    );

                    // Calculate actual content height needed
                    const titleHeight = 8; // Height for title
                    const metaHeight = 8; // Height for severity/port/cvss line
                    const descriptionHeight = Math.min(descLines.length, 3) * 4; // 3 units per line, max 3 lines
                    const padding = 8; // Top and bottom padding (8 each)

                    const totalBoxHeight =
                        titleHeight + metaHeight + descriptionHeight + padding;

                    // Draw vulnerability box with dynamic height
                    this.pdf.setFillColor(250, 250, 250);
                    this.pdf.rect(
                        this.margin,
                        this.currentY,
                        this.contentWidth,
                        totalBoxHeight,
                        "F"
                    );

                    // Severity indicator with dynamic height
                    this.pdf.setFillColor(...color);
                    this.pdf.rect(this.margin, this.currentY, 5, totalBoxHeight, "F");

                    // Vulnerability title
                    this.pdf.setFontSize(11);
                    this.pdf.setFont("helvetica", "bold");
                    this.pdf.setTextColor(44, 62, 80);
                    this.pdf.text(
                        `${index + 1}. ${vulnTitle}`,
                        this.margin + 8,
                        this.currentY + 8
                    );

                    // Vulnerability metadata
                    const port = this.safeGet(vuln, "port", "Unknown");
                    const cvssScore = this.safeGet(
                        vuln,
                        "cvss_score",
                        this.safeGet(vuln, "cvss", "N/A")
                    );
                    const cveId = this.safeGet(
                        vuln,
                        "cve_id",
                        this.safeGet(vuln, "cve", "N/A")
                    );

                    this.pdf.setFontSize(9);
                    this.pdf.setFont("helvetica", "normal");
                    this.pdf.setTextColor(52, 73, 94);
                    this.pdf.text(
                        `Severity: ${severity} | Port: ${port} | CVSS: ${cvssScore} | CVE: ${cveId}`,
                        this.margin + 8,
                        this.currentY + 16
                    );

                    // Description text
                    this.pdf.text(
                        descLines.slice(0, 3),
                        this.margin + 8,
                        this.currentY + 24
                    );

                    // Move to next vulnerability with minimal spacing
                    this.currentY += totalBoxHeight + 2; // Reduced gap between vulnerability boxes
                });
            }
        }
        // Recommendations Section - Enhanced
    addRecommendations(reportData) {
        this.addSectionHeader("RECOMMENDATIONS");

        const recommendations = this.safeGet(reportData, "recommendations", []);

        if (Array.isArray(recommendations) && recommendations.length > 0) {
            recommendations.forEach((rec, index) => {
                this.checkPageBreak(20);

                this.pdf.setFontSize(11);
                this.pdf.setFont("helvetica", "bold");
                this.pdf.setTextColor(44, 62, 80);
                this.pdf.text(`${index + 1}. ${rec}`, this.margin, this.currentY);

                this.currentY += 15;
            });
        } else {
            // Default recommendations
            const defaultRecommendations = [
                "Apply security patches for identified vulnerabilities",
                "Close unnecessary open ports",
                "Implement network segmentation",
                "Regular vulnerability assessments",
                "Monitor system logs for suspicious activities",
            ];

            defaultRecommendations.forEach((rec, index) => {
                this.checkPageBreak(20);

                this.pdf.setFontSize(11);
                this.pdf.setFont("helvetica", "bold");
                this.pdf.setTextColor(44, 62, 80);
                this.pdf.text(`${index + 1}. ${rec}`, this.margin, this.currentY);

                this.currentY += 15;
            });
        }
    }

    // Add footers to all pages - Enhanced
    addFooters(reportData, targetIP) {
        const totalPages = this.pdf.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
            this.pdf.setPage(i);

            // Footer line
            this.pdf.setDrawColor(189, 195, 199);
            this.pdf.line(this.margin, 280, 210 - this.margin, 280);

            // Footer text
            this.pdf.setFontSize(8);
            this.pdf.setFont("helvetica", "normal");
            this.pdf.setTextColor(127, 140, 141);

            // Left side - Report info
            this.pdf.text(
                `Vulnerability Assessment Report - ${targetIP}`,
                this.margin,
                285
            );

            // Center - Generated date
            const dateText = `Generated: ${new Date().toLocaleDateString()}`;
            const dateWidth = this.pdf.getTextWidth(dateText);
            this.pdf.text(dateText, (210 - dateWidth) / 2, 285);

            // Right side - Page number
            const pageText = `Page ${i} of ${totalPages}`;
            const pageWidth = this.pdf.getTextWidth(pageText);
            this.pdf.text(pageText, 210 - this.margin - pageWidth, 285);
        }
    }

    // Replace your logReportGeneration method in PdfReportGenerator with this updated version:

    logReportGeneration(reportData, targetIP, vulnSummary, success = true) {
        const reportId = this.safeGet(reportData, "reportId", `VULN_${Date.now()}`);
        const generatedAt = new Date().toISOString();

        // Calculate total vulnerabilities more accurately
        let totalVulnerabilities = 0;
        if (vulnSummary && typeof vulnSummary === "object") {
            // If vulnSummary has a total property
            if (vulnSummary.total !== undefined) {
                totalVulnerabilities = vulnSummary.total;
            } else {
                // Calculate from individual severity counts
                totalVulnerabilities =
                    (vulnSummary.critical || 0) +
                    (vulnSummary.high || 0) +
                    (vulnSummary.medium || 0) +
                    (vulnSummary.low || 0);
            }
        }

        const logData = {
            reportId: reportId,
            targetIP: targetIP,
            generatedAt: generatedAt,
            vulnerabilitiesCount: totalVulnerabilities,
            status: success ? "SUCCESS" : "FAILED",
            timestamp: Date.now(),
        };

        console.log("=== VULNERABILITY REPORT GENERATION LOG ===");
        console.log("Report ID:", logData.reportId);
        console.log("Target IP:", logData.targetIP);
        console.log("Generated At:", logData.generatedAt);
        console.log("Total Vulnerabilities:", logData.vulnerabilitiesCount);
        console.log("Status:", logData.status);
        console.log("============================================");

        // Note: localStorage is not available in Claude.ai artifacts
        // If you need persistent storage, implement backend API call here

        return logData;
    }
}

// Utility function to create and download report
export const generateVulnerabilityReport = async(reportData) => {
    const generator = new VulnerabilityReportGenerator();
    return await generator.generateReport(reportData);
};

// Export the service
export default VulnerabilityReportGenerator;