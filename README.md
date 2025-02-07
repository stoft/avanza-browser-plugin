# Avanza Portfolio Copier

A Chrome extension that extracts and copies portfolio data from Avanza's website.

## Features

- Extracts warrant and certificate positions from Avanza portfolio
- Shows number of shares for each position
- Includes orderbookId for each instrument
- Shows available cash balance
- Alphabetically sorts assets (with cash at bottom)
- Copy data in tab-separated format for easy spreadsheet pasting
- Visual debug indicators
- Refresh without page reload

## Installation

1. Clone this repository
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension directory

## Usage

1. Navigate to your Avanza portfolio page
2. Click the extension icon
3. View your positions in the popup
4. Click "Copy to Clipboard" to copy data in tab-separated format
5. Use "Refresh Data" to update without reloading the page

## Data Format

The extension extracts:

- Asset name
- Number of shares
- OrderbookId
- Available cash (shown at bottom)

## Development

The extension consists of:

- `popup.html/js`: UI and user interaction
- `content.js`: Data extraction from Avanza's page
- `background.js`: Manages content script persistence
- `manifest.json`: Extension configuration

## Notes

- Works with Avanza's current (2024) portfolio page structure
- Handles Swedish number formats
- Sorts using Swedish locale
