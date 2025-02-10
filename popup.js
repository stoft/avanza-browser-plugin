// State management
const state = {
  portfolioData: [],
  setPortfolioData: (data) => {
    console.log("Setting portfolio data:", data);
    state.portfolioData = data;
    renderTable(data);
  },
};

// Create debug element globally
const debugDiv = document.createElement("div");
debugDiv.className = "debug";
debugDiv.textContent = "Debug: Popup loaded. Waiting for data...";

// Pure function to create table row HTML
const createTableRow = (asset) => {
  console.log("Creating row for asset:", asset);
  return `
    <tr>
        <td>${asset.name}</td>
        <td>${asset.quantity || asset.value}</td>
        <td>${asset.quantity ? asset.value : ""}</td>
        <td class="orderbook-id">${asset.orderbookId || ""}</td>
    </tr>
`;
};

// Render function for the table
const renderTable = (data) => {
  console.log("Rendering table with data:", data);
  const tbody = document.querySelector("#assetTable tbody");
  if (!tbody) {
    console.error("Could not find table body element");
    return;
  }
  tbody.innerHTML = data.map(createTableRow).join("");
};

// Copy data to clipboard
const copyToClipboard = (data) => {
  console.log("Copying data to clipboard:", data);
  const formattedData = data
    .map(
      (asset) =>
        `${asset.name}\t${asset.quantity || asset.value}\t${
          asset.quantity ? asset.value : ""
        }\t${asset.orderbookId || ""}`
    )
    .join("\n");

  navigator.clipboard
    .writeText(formattedData)
    .then(() => {
      console.log("Successfully copied to clipboard");
      showCopySuccess();
    })
    .catch((err) => console.error("Failed to copy:", err));
};

// Show success message
const showCopySuccess = () => {
  const button = document.getElementById("copyButton");
  if (!button) {
    console.error("Could not find copy button");
    return;
  }
  const originalText = button.textContent;
  button.textContent = "Copied!";
  setTimeout(() => {
    button.textContent = originalText;
  }, 2000);
};

// Fetch data from the page
const fetchData = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      debugDiv.textContent = "Debug: No active tab found";
      return;
    }

    console.log("Found active tab:", tabs[0]);
    debugDiv.textContent =
      "Debug: Found active tab, ensuring content script...";

    // Get the background page
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      backgroundPage.ensureContentScript(tabs[0].id, (success) => {
        if (!success) {
          debugDiv.textContent = "Debug: Failed to ensure content script";
          return;
        }

        debugDiv.textContent =
          "Debug: Content script ready, requesting data...";
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "getPortfolioData" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Runtime error:", chrome.runtime.lastError);
              debugDiv.textContent = "Debug: Error communicating with page";
              return;
            }

            console.log("Received response from content script:", response);
            debugDiv.textContent = response
              ? `Debug: Found ${response.length} items`
              : "Debug: No data received from page";

            if (response) {
              state.setPortfolioData(response);
            } else {
              console.error("No response from content script");
              const tbody = document.querySelector("#assetTable tbody");
              if (tbody) {
                tbody.innerHTML =
                  '<tr><td colspan="2">No data found. Make sure you are on the portfolio page.</td></tr>';
              }
            }
          }
        );
      });
    });
  });
};

// Initialize popup
document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup initialized");

  // Add debug element to DOM
  document.body.appendChild(debugDiv);

  // Initial data fetch
  fetchData();

  // Set up refresh button
  const refreshButton = document.getElementById("refreshButton");
  if (!refreshButton) {
    console.error("Could not find refresh button");
    return;
  }
  refreshButton.addEventListener("click", () => {
    console.log("Refresh button clicked");
    debugDiv.textContent = "Debug: Refreshing data...";
    fetchData();
  });

  // Set up copy button
  const copyButton = document.getElementById("copyButton");
  if (!copyButton) {
    console.error("Could not find copy button");
    return;
  }
  copyButton.addEventListener("click", () => {
    console.log("Copy button clicked");
    copyToClipboard(state.portfolioData);
  });
});
