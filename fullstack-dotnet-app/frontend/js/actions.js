/**
 * js/actions.js
 * Implements utilities for Action Bar operations: Template downloads, 
 * active filter CSV exports, batch file uploads, and email clients triggering.
 */

// 1. DOWNLOAD TEMPLATE ACTION
function downloadCSVTemplate() {
    // Standard format headers matching the mandatory T_PRODUCTS database schema exactly
    const csvContent = "data:text/csv;charset=utf-8,F_PROD_NAME,F_BRAND,F_QTY,F_PRICE,F_PROD_DESC,F_PROD_RATING\n"
        + "Galaxy S24,Samsung,50,79999.00,Flagship mobile phone device,4.7\n"
        + "MacBook Pro M3,Apple,15,169900.00,High performance laptop workstation,4.9\n"
        + "Front Load Washer,Samsung,20,38999.00,AI ecobubble fully automatic washing machine,4.4";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Inventory_Import_Template.csv");
    document.body.appendChild(link); // Required descriptor element for Firefox compatibility
    
    link.click();
    document.body.removeChild(link);
}

// 2. EXPORT DATA TO CSV FILE (Obeying active filter conditions)
function exportToCSV() {
    const tableRows = document.querySelectorAll("#productTableBody tr");
    if (tableRows.length === 0) {
        alert("No active product records found to export!");
        return;
    }

    // Header array matching database schema tracking fields
    let csvRows = ["Product ID,Product Name,Category Badge,Brand,Quantity,Price (Rs.),Rating Score"];

    tableRows.forEach(row => {
        // MANDATORY REQUIREMENT: Only export rows that are NOT hidden by active filters
        if (!row.classList.contains("d-none")) {
            const id = row.querySelector(".product-select")?.value || "";
            
            // Clean out comma delimiters within the cell strings to prevent layout splitting errors in Excel
            const name = row.cells[2].querySelector(".fw-bold")?.textContent.trim().replace(/,/g, "") || "";
            const category = row.cells[2].querySelector(".badge")?.textContent.trim() || "";
            
            const brand = row.cells[3].textContent.trim();
            const qty = row.cells[4].textContent.trim();
            const price = row.cells[5].textContent.trim().replace(/[^\d.]/g, '');
            const rating = row.cells[6].textContent.trim().replace("★", "").trim();

            csvRows.push(`${id},${name},${category},${brand},${qty},${price},${rating}`);
        }
    });

    const csvDataString = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvDataString);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", "Filtered_Inventory_Report.csv");
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

// 3. IMPORT CSV CLIENT-SIDE PARSER
function importCSVFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
        const textContent = e.target.result;
        const lines = textContent.split("\n");
        let successfulInsertsCount = 0;

        // Skip index row 0 (text labels header values)
        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].trim();
            if (currentLine === "") continue;

            const columns = currentLine.split(",");
            if (columns.length >= 4) {
                const productPayload = {
                    F_PROD_NAME: columns[0],
                    F_BRAND: columns[1],
                    F_QTY: columns[2], // Matches database String datatype requirement
                    F_PRICE: parseFloat(columns[3]) || 0.0,
                    F_PROD_DESC: columns[4] || "Batch CSV Import Line Record",
                    F_PROD_RATING: parseFloat(columns[5]) || 0.0
                };

                try {
                    // Transmit directly down toward your C# Controller endpoints
                    const response = await fetch('http://localhost:5246/api/product', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(productPayload)
                    });
                    if (response.ok) successfulInsertsCount++;
                } catch (err) {
                    console.error("Batch insert failure at line row mapping sequence:", err);
                }
            }
        }
        
        alert(`CSV Data Matrix Processing Completed!\nSuccessfully inserted ${successfulInsertsCount} new products into the database.`);
        if (typeof fetchProducts === "function") fetchProducts(); // Refresh layout automatically
        document.getElementById('csvFileInput').value = ''; // Reset file tracker reference pointer
    };

    reader.readAsText(file);
}

// 4. EMAIL FORWARDING SYSTEM (Informs about data compression packing protocol)
function openEmailModal() {
    const checkedBoxes = document.querySelectorAll(".product-select:checked");
    let summaryText = "";

    if (checkedBoxes.length > 0) {
        summaryText = "\n\nTarget Items Logged For Excel Zip Package Extraction:\n";
        checkedBoxes.forEach(box => {
            const row = box.closest("tr");
            const name = row.cells[2].querySelector(".fw-bold")?.textContent.trim() || "";
            summaryText += `- ${name} | Brand: ${row.cells[3].textContent.trim()} | Price: ${row.cells[5].textContent.trim()}\n`;
        });
        
        // Append checked elements description logs down inside the workspace view box
        document.getElementById("emailBody").value += summaryText;
    }

    const emailTargetModal = new bootstrap.Modal(document.getElementById('emailModal'));
    emailTargetModal.show();
}

function sendInventoryEmail() {
    const recipient = document.getElementById("emailRecipient").value;
    const subject = encodeURIComponent(document.getElementById("emailSubject").value);
    const body = encodeURIComponent(document.getElementById("emailBody").value);

    // Forces application routing window outward toward standard browser mail software clients (Outlook/Mail app)
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

    const emailModalEl = document.getElementById('emailModal');
    const modalInstance = bootstrap.Modal.getInstance(emailModalEl);
    if (modalInstance) modalInstance.hide();
}