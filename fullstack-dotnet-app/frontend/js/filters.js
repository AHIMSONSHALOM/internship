/**
 * js/filters.js
 * Controls real-time hierarchical categories, dynamic brand generation,
 * dual-slider price metrics, and star scale evaluation calculations.
 */

let currentPage = 1;
const rowsPerPage = 10;
let filteredRowElements = [];

// Hierarchical Category-to-Brand Mapping Dictionary for Dynamic UI Checkboxes
const brandMapping = {
    "Mobile Phone": ["Samsung", "Apple", "Google", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo"],
    "Laptop / PC": ["Apple", "Dell", "HP", "Lenovo", "Asus"],
    "Home Appliance": ["Sony", "LG", "Dyson", "Samsung", "IFB"],
    "Footwear": ["Nike", "Adidas", "Puma", "Converse", "Asics"]
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Listen for changes on Category checkboxes to dynamically re-build the Brand list
    const categoryContainer = document.getElementById("categoryFilter");
    if (categoryContainer) {
        categoryContainer.addEventListener("change", () => {
            updateBrandListChoices();
            currentPage = 1;
            applyActiveFilters();
        });
    }

    // Initialize Price Slider Hookups
    const priceSlider = document.getElementById("priceRange");
    if (priceSlider) {
        priceSlider.addEventListener("input", (e) => {
            const maxInput = document.getElementById("maxPriceInput");
            if (maxInput) maxInput.value = e.target.value;
            applyActiveFilters();
        });
    }

    // Listen for changes on Star Rating Checkboxes
    const ratingFilterContainer = document.getElementById("ratingFilter");
    if (ratingFilterContainer) {
        ratingFilterContainer.addEventListener("change", () => {
            currentPage = 1;
            applyActiveFilters();
        });
    }
});

/**
 * SCANS CHECKED CATEGORIES AND RENDERS ONLY VALID ASSOCIATED BRAND CHECKBOXES
 */
function updateBrandListChoices() {
    const container = document.getElementById("dynamicBrandsContainer");
    if (!container) return;

    // Collect all checked categories
    const checkedCategories = [];
    document.querySelectorAll(".category-checkbox:checked").forEach(cb => {
        checkedCategories.push(cb.value);
    });

    // If no categories are checked, show a reminder and clear out old boxes
    if (checkedCategories.length === 0) {
        container.innerHTML = '<p class="text-muted small">Select a category first...</p>';
        return;
    }

    // Build a unique array list of matching brands across all checked categories
    let matchingBrands = [];
    checkedCategories.forEach(cat => {
        if (brandMapping[cat]) {
            matchingBrands = matchingBrands.concat(brandMapping[cat]);
        }
    });
    // Remove duplicates
    matchingBrands = [...new Set(matchingBrands)];

    // Generate HTML checkboxes row elements dynamically
    container.innerHTML = "";
    matchingBrands.forEach((brand, index) => {
        const brandBoxHtml = `
            <div class="form-check">
                <input class="form-check-input brand-checkbox" type="checkbox" id="brand_${index}" value="${brand.toLowerCase()}" onchange="applyActiveFilters()">
                <label class="form-check-label small" for="brand_${index}">${brand}</label>
            </div>
        `;
        container.innerHTML += brandBoxHtml;
    });
}

function syncSliderFromInput() {
    const priceSlider = document.getElementById("priceRange");
    const maxInputValue = parseFloat(document.getElementById("maxPriceInput").value) || 0;
    if (priceSlider) priceSlider.value = maxInputValue;
    currentPage = 1;
    applyActiveFilters();
}

function handleLiveSearch() {
    currentPage = 1; 
    applyActiveFilters();
}

/**
 * MASTER EVALUATION MATRIX ENGINE
 */
function applyActiveFilters() {
    const searchString = document.getElementById("tableSearchInput")?.value.toLowerCase().trim() || "";
    const minPriceLimit = parseFloat(document.getElementById("minPriceInput")?.value) || 0;
    const maxPriceLimit = parseFloat(document.getElementById("maxPriceInput")?.value) || 200000;
    
    // A. Gather checked category string values
    const checkedCategories = [];
    document.querySelectorAll(".category-checkbox:checked").forEach(cb => {
        checkedCategories.push(cb.value.toLowerCase());
    });

    // B. Gather checked generated brand string values
    const checkedBrands = [];
    document.querySelectorAll(".brand-checkbox:checked").forEach(cb => {
        checkedBrands.push(cb.value);
    });

    // C. Gather checked rating thresholds values
    const checkedRatings = [];
    document.querySelectorAll(".rating-checkbox:checked").forEach(box => {
        checkedRatings.push(parseFloat(box.value));
    });

    const allTableRows = document.querySelectorAll("#productTableBody tr");
    filteredRowElements = [];

    allTableRows.forEach(row => {
        const productName = row.cells[2].querySelector(".fw-bold")?.textContent.toLowerCase() || "";
        const productCategory = row.cells[2].querySelector(".badge")?.textContent.trim().toLowerCase() || "";
        const productBrand = row.cells[3].textContent.trim().toLowerCase();
        const rawPriceValue = parseFloat(row.cells[5].textContent.replace(/[^\d.]/g, '')) || 0;
        const rawRatingValue = parseFloat(row.cells[6].textContent.replace(/[^\d.]/g, '')) || 0;

        // Condition verification rules evaluations
        const matchesSearch = searchString === "" || productName.includes(searchString) || productBrand.includes(searchString);
        const matchesCategory = checkedCategories.length === 0 || checkedCategories.includes(productCategory);
        const matchesBrand = checkedBrands.length === 0 || checkedBrands.includes(productBrand);
        const matchesPrice = rawPriceValue >= minPriceLimit && rawPriceValue <= maxPriceLimit;
        
        let matchesRating = true;
        if (checkedRatings.length > 0) {
            const lowestCheckedThreshold = Math.min(...checkedRatings);
            matchesRating = rawRatingValue >= lowestCheckedThreshold;
        }

        // Apply visibility tags
        if (matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating) {
            filteredRowElements.push(row);
            row.classList.remove("d-none");
        } else {
            row.classList.add("d-none");
        }
    });

    executePaginationRender();
}

/**
 * PAGINATION MANAGER
 */
function executePaginationRender() {
    const totalMatchingItems = filteredRowElements.length;
    const totalPages = Math.ceil(totalMatchingItems / rowsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    filteredRowElements.forEach((row, indexedPos) => {
        if (indexedPos >= startIndex && indexedPos < endIndex) {
            row.classList.remove("d-none"); 
        } else {
            row.classList.add("d-none"); 
        }
    });

    const summaryDisplayEl = document.getElementById("paginationSummary");
    if (summaryDisplayEl) {
        const rowFrom = totalMatchingItems === 0 ? 0 : startIndex + 1;
        const rowTo = Math.min(endIndex, totalMatchingItems);
        summaryDisplayEl.innerText = `Showing rows ${rowFrom} to ${rowTo} of ${totalMatchingItems} entries matched`;
    }

    renderPaginationControlLinks(totalPages);
}

function renderPaginationControlLinks(totalPages) {
    const container = document.getElementById("paginationContainer");
    if (!container) return;
    container.innerHTML = ""; 

    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePageStep(-1)">Previous</a>`;
    container.appendChild(prevLi);

    let startPageLink = Math.max(1, currentPage - 2);
    let endPageLink = Math.min(totalPages, startPageLink + 4);
    if (endPageLink - startPageLink < 4) startPageLink = Math.max(1, endPageLink - 4);

    for (let pageNum = startPageLink; pageNum <= endPageLink; pageNum++) {
        const numLi = document.createElement("li");
        numLi.className = `page-item ${currentPage === pageNum ? 'active' : ''}`;
        numLi.innerHTML = `<a class="page-link" href="#" onclick="setSpecificPage(${pageNum})">${pageNum}</a>`;
        container.appendChild(numLi);
    }

    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePageStep(1)">Next</a>`;
    container.appendChild(nextLi);
}

function setSpecificPage(targetPageNumber) {
    currentPage = targetPageNumber;
    executePaginationRender();
}

function changePageStep(directionStepValue) {
    currentPage += directionStepValue;
    executePaginationRender();
}

function clearAllFilters() {
    document.getElementById("tableSearchInput").value = "";
    document.getElementById("minPriceInput").value = "0";
    document.getElementById("maxPriceInput").value = "200000";
    document.getElementById("priceRange").value = "200000";
    
    document.querySelectorAll(".category-checkbox").forEach(cb => cb.checked = false);
    document.querySelectorAll(".rating-checkbox").forEach(cb => cb.checked = false);
    updateBrandListChoices();
    
    currentPage = 1;
    if (typeof fetchProducts === "function") fetchProducts();
}