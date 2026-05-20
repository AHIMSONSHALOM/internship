/**
 * js/products.js
 * Manages fetching data items from C# Web API endpoints,
 * dynamic construction of rows inside the DOM data grid table with automated 
 * keyword category tracking, and handling modal forms submission payloads.
 */

// 1. Fetch data from active C# Web API endpoints and parse layout rows
async function fetchProducts() {
    try {
        // Run HTTP GET request toward our listening .NET runtime engine
        const response = await fetch('http://localhost:5246/api/product');
        const products = await response.json();
        
        const tableBody = document.getElementById('productTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = ''; // Safely wipe canvas grid rows
        
        products.forEach(prod => {
            // Accommodate key-casing properties flexibility across variations [cite: 4]
            const name = prod.f_PROD_NAME || prod.F_PROD_NAME;
            const brand = prod.f_BRAND || prod.F_BRAND;
            const qty = prod.f_QTY !== undefined ? prod.f_QTY : prod.F_QTY;
            const price = prod.f_PRICE || prod.F_PRICE;
            const rating = prod.f_PROD_RATING || prod.F_PROD_RATING;
            const id = prod.f_PRODUCT_ID || prod.F_PRODUCT_ID;
            const desc = prod.f_PROD_DESC || prod.F_PROD_DESC || "";

            // =========================================================
            // SMART AUTOMATED KEYWORD CATEGORY DETECTION ENGINE
            // =========================================================
            let categoryLabel = "General Product";
            let categoryIcon = "📦";
            
            const lowerName = name.toLowerCase();
            const lowerDesc = desc.toLowerCase();

            if (lowerName.includes("iphone") || lowerName.includes("galaxy") || lowerName.includes("pixel") || lowerDesc.includes("phone")) {
                categoryLabel = "Mobile Phone";
                categoryIcon = "📱";
            } else if (lowerName.includes("macbook") || lowerName.includes("laptop") || lowerName.includes("thinkpad") || lowerName.includes("xps") || lowerName.includes("pavilion")) {
                categoryLabel = "Laptop / PC";
                categoryIcon = "💻";
            } else if (lowerName.includes("tv") || lowerName.includes("fridge") || lowerName.includes("vacuum") || lowerName.includes("washing") || lowerName.includes("microwave")) {
                categoryLabel = "Home Appliance";
                categoryIcon = "🔌";
            } else if (lowerName.includes("shoes") || lowerName.includes("sneakers") || lowerName.includes("max") || lowerName.includes("ultrablast") || lowerDesc.includes("footwear")) {
                categoryLabel = "Footwear";
                categoryIcon = "👟";
            }

            // Constructing the row with the dynamic category badge included [cite: 8]
            const row = `
                <tr>
                    <td>
                        <button class="btn btn-info btn-sm text-white fw-bold me-1">Edit</button>
                        <button class="btn btn-danger btn-sm fw-bold">Delete</button>
                    </td>
                    <td><input type="checkbox" class="product-select" value="${id}"></td>
                    <td>
                        <div class="fw-bold text-dark">${categoryIcon} ${name}</div>
                        <span class="badge bg-light text-secondary border mt-1" style="font-size: 0.75rem;">${categoryLabel}</span>
                    </td>
                    <td><span class="badge bg-secondary">${brand}</span></td>
                    <td>${qty}</td>
                    <td class="text-success fw-bold">Rs. ${Number(price).toLocaleString()}</td>
                    <td class="text-warning">★ ${rating || '0.0'}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        // Ensure master checkbox resets to unchecked whenever data reloads
        const masterCheckbox = document.getElementById('selectAllCheckbox');
        if (masterCheckbox) masterCheckbox.checked = false;

        // AUTO-HOOK: Trigger runtime visibility check from filters.js right after data loads
        if (typeof applyActiveFilters === "function") {
            applyActiveFilters();
        }

    } catch (error) {
        console.error("Error connecting to backend API framework query:", error);
    }
}

// 2. Transmit Form payload down toward database engine via HTTP POST method
async function addNewProduct(event) {
    event.preventDefault();

    // Map object blueprint matching the Product class structure in C# Entity Framework [cite: 4]
    const newProduct = {
        F_PROD_NAME: document.getElementById('addName').value,
        F_BRAND: document.getElementById('addBrand').value,
        F_QTY: document.getElementById('addQty').value, // Matches schema tracking string type parameters [cite: 4]
        F_PRICE: parseFloat(document.getElementById('addPrice').value),
        F_PROD_DESC: document.getElementById('addDesc').value,
        F_PROD_RATING: parseFloat(document.getElementById('addRating').value) || 0.0
    };

    try {
        const response = await fetch('http://localhost:5246/api/product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });

        if (response.ok) {
            alert("Success! Product data row saved directly into MS-SQL Server.");
            
            // Programmatically request Bootstrap to shut down the form overlay window
            const modalEl = document.getElementById('addProductModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            
            // Wipe form input fields clean for subsequent records inclusion
            document.getElementById('addProductForm').reset();
            
            // Re-fetch sorted list out of active backend state
            fetchProducts(); 
        } else {
            alert("Error: Server responded with standard tracking fault code verification failure.");
        }
    } catch (err) {
        console.error("Critical failure during backend connectivity transmission:", err);
    }
}