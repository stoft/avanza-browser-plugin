// Function to extract portfolio data using a functional approach
const extractPortfolioData = () => {
  // Helper to safely extract text content
  const safeText = (elem) => {
    console.log("Extracting text from element:", elem);
    return elem ? elem.textContent.trim() : "";
  };

  // Find all warrant and certificate rows
  const getAssetRows = () => {
    console.log("Searching for asset containers...");

    // Updated selectors to match the actual structure
    const tables = Array.from(document.querySelectorAll("aza-positions-table"));
    console.log("Found tables:", tables.length);

    const getRowsFromTable = (table) => {
      const rows = Array.from(table.querySelectorAll("tbody tr.position-row"));
      console.log("Found rows in table:", rows.length);
      return rows;
    };

    const allRows = tables.flatMap(getRowsFromTable);
    console.log("Total rows found:", allRows.length);
    return allRows;
  };

  // Get available cash
  const getAvailableCash = () => {
    console.log("Searching for available cash...");

    // Find all dt elements and then find the one with the correct text
    const dtElements = document.querySelectorAll("dt[mintpairlistkey]");
    const cashDt = Array.from(dtElements).find(
      (dt) => dt.textContent.trim() === "Tillgängligt för köp"
    );

    // If we found the dt element, get its corresponding dd element's numerical value
    const cashElement =
      cashDt?.nextElementSibling?.querySelector("aza-numerical");
    console.log("Found cash element:", cashElement);

    if (cashElement) {
      const rawValue = safeText(cashElement);
      console.log("Raw cash value:", rawValue);

      // Convert Swedish format number to integer
      const numericValue = rawValue
        .replace(/\s+kr$/, "") // Remove currency
        .replace(/kronor$/, "") // Remove currency word
        .replace(/\s+/g, "") // Remove spaces
        .replace(",", "."); // Convert Swedish decimal to dot

      // Parse as float and round to integer
      const roundedValue = Math.round(parseFloat(numericValue)).toString();
      console.log("Processed cash value:", roundedValue);

      return {
        name: "Tillgängligt för köp",
        value: roundedValue,
      };
    }
    return null;
  };

  // Transform row elements into data objects
  const parseRow = (row) => {
    console.log("Parsing row:", row);

    const nameElem = row.querySelector("th .name-column-content a");

    // Extract orderbookId from href
    const href = nameElem?.getAttribute("href") || "";
    const orderbookId = href.split("/").filter(Boolean).slice(-2)[0];

    // Get quantity (first numerical cell)
    const quantityElem = row.querySelector(
      "td:not(.tools-column):not(.checkbox-column) aza-numerical"
    );

    // Get value (second to last cell before tools)
    const cells = Array.from(row.querySelectorAll("td"));
    const valueCell = cells[cells.length - 2];
    const valueElem = valueCell?.querySelector("aza-numerical");

    console.log("Raw elements:", { quantityElem, valueElem });

    const result = {
      name: safeText(nameElem),
      quantity: safeText(quantityElem)
        .replace(/\s+st$/, "")
        .replace(/\s+/g, "")
        .replace(/[^0-9-,]/g, "")
        .replace(",", ""),
      value: safeText(valueElem)
        .replace(/\s+kr$/, "")
        .replace(/kronor$/, "")
        .replace(/\s+/g, "")
        .replace(/[^0-9-,]/g, "")
        .replace(",", ""),
      orderbookId,
    };
    console.log("Parsed row result:", result);
    return result;
  };

  // Extract and transform all rows
  const assetRows = getAssetRows().map(parseRow);
  const cashData = getAvailableCash();

  // Sort asset rows alphabetically by name
  const sortedAssetRows = assetRows.sort(
    (a, b) => a.name.localeCompare(b.name, "sv") // Use Swedish locale for correct sorting
  );

  // Combine sorted assets with cash data at the bottom
  const result = cashData ? [...sortedAssetRows, cashData] : sortedAssetRows;

  console.log("Final extracted data:", result);
  return result;
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);
  if (request.action === "getPortfolioData") {
    const data = extractPortfolioData();
    console.log("Sending response back to popup:", data);
    sendResponse(data);
  }
});

// Log when content script loads
console.log("Avanza Portfolio Copier content script loaded");

// Calculate scrollbar width
const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

// Visual debug indicator
const debugDiv = document.createElement("div");
debugDiv.style.position = "fixed";
debugDiv.style.top = "50%";
debugDiv.style.right = `${scrollbarWidth}px`;
debugDiv.style.transform = "translateY(-50%) rotate(-90deg)";
debugDiv.style.transformOrigin = "right center";
debugDiv.style.background = "yellow";
debugDiv.style.padding = "5px";
debugDiv.style.zIndex = "9999";
debugDiv.style.whiteSpace = "nowrap"; // Prevent text wrapping
debugDiv.textContent = "Portfolio Copier Active";
document.body.appendChild(debugDiv);

// At the bottom of content.js, after the debug div
chrome.runtime.sendMessage({ action: "contentScriptLoaded" }, (response) => {
  console.log("Content script load acknowledged:", response);
});
