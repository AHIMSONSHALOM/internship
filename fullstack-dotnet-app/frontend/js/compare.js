/**
 * js/compare.js
 * Implements variable multi-item comparison grids matching 
 * specified project minimum and maximum configuration limits.
 */

// MANDATORY SPECIFICATION: Configurable Item Constraints Boundaries 
const MIN_COMPARE_LIMIT = 2;
const MAX_COMPARE_LIMIT = 4;

/**
 * Grabs all checked grid items, evaluates rules, and outputs 
 * a balanced side-by-side product attribute comparison matrix.
 */
function handleProductComparison() {
    // Collect all checked product checkboxes inside the grid view
    const checkedBoxes = document.querySelectorAll(".product-select:checked");
    const selectedCount = checkedBoxes.length;

    // 1. Verify Configurable Constraints Boundaries 
    if (selectedCount < MIN_COMPARE_LIMIT || selectedCount > MAX_COMPARE_LIMIT) {
        alert(`Comparison Error:\nYou must select between ${MIN_COMPARE_LIMIT} and ${MAX_COMPARE_LIMIT} products to generate a comparison matrix!\n\nCurrently selected: ${selectedCount} item(s).`);
        return;
    }

    const containerRow = document.getElementById("compareCardsRowContainer");
    if (!containerRow) return;
    containerRow.innerHTML = ""; // Clear out previous layout rows

    // 2. Calculate Bootstrap Grid Sizing based on total selected items
    // 12 columns total: 2 items = col-md-5, 3 items = col-md-4, 4 items = col-md-3
    let columnClass = "col-md-3"; 
    if (selectedCount === 2) columnClass = "col-md-5";
    if (selectedCount === 3) columnClass = "col-md-4";

    // 3. Loop through selections and dynamically build comparative matrices cards
    checkedBoxes.forEach((box, index) => {
        const row = box.closest("tr");
        
        // Extract field values cleanly from row columns indexing positions 
        const name = row.cells[2].textContent.trim();
        const brand = row.cells[3].textContent.trim();
        const qty = row.cells[4].textContent.trim();
        const price = row.cells[5].textContent.trim();
        const rating = row.cells[6].textContent.trim();

        // Generate card layout row template column string
        const cardHtml = `
            <div class="${columnClass}">
                <div class="card p-3 shadow-sm border bg-white rounded h-100">
                    <div class="bg-light p-2 rounded mb-3">
                        <span class="text-muted small fw-bold uppercase">Device #${index + 1}</span>
                        <h4 class="fw-bold text-dark mb-0 mt-1" style="font-size: 1.25rem;">${name}</h4>
                    </div>
                    <table class="table table-sm table-borderless text-start my-2 small">
                        <tbody>
                            <tr>
                                <td class="text-muted fw-semibold" style="width: 40%;">Brand:</td>
                                <td class="fw-bold"><span class="badge bg-secondary">${brand}</span></td>
                            </tr>
                            <tr>
                                <td class="text-muted fw-semibold">Stock Qty:</td>
                                <td class="fw-bold text-dark">${qty} items</td>
                            </tr>
                            <tr>
                                <td class="text-muted fw-semibold">Rating Score:</td>
                                <td class="fw-bold text-warning">${rating}</td>
                            </tr>
                        </tbody>
                    </table>
                    <hr class="text-muted my-2">
                    <div class="mt-auto pt-2">
                        <span class="text-muted d-block small">Market Price</span>
                        <h5 class="text-success fw-bold fs-4 mb-0">${price}</h5>
                    </div>
                </div>
            </div>
        `;

        // Inject middle "VS" visual split badge row ONLY if displaying exactly 2 items
        if (selectedCount === 2 && index === 1) {
            const vsBadgeHtml = `
                <div class="col-md-2 d-flex align-items-center justify-content-center my-2">
                    <span class="badge bg-danger fs-5 rounded-circle p-2 shadow-sm animate-bounce">VS</span>
                </div>
            `;
            containerRow.innerHTML += vsBadgeHtml;
        }

        // Append generated component element card straight to UI matrix frame wrapper
        containerRow.innerHTML += cardHtml;
    });

    // 4. Pop open the Bootstrap comparison modal window layout
    const comparisonModalSelector = new bootstrap.Modal(document.getElementById('compareModal'));
    comparisonModalSelector.show();
}