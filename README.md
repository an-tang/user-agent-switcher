# User-Agent Switcher

A Chromium browser extension (Chrome, Brave, Edge) to set a persistent custom User-Agent.

## Features

- **Toggle on/off** - Quick enable/disable switch
- **All websites mode** - Apply one User-Agent to all requests
- **Per-site rules** - Set different User-Agents for specific domains
- **Built-in presets** - Chrome Win/Mac, iPhone, Android, Chrome OS
- **Custom presets** - Save your own User-Agent strings with custom names
- **Persistent** - Settings survive browser restarts

## Installation

### From Source

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load in browser:
   - Open `chrome://extensions/` (or `brave://extensions/`)
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the `dist` folder

### From Chrome Web Store

*Coming soon*

## Usage

1. Click the extension icon in your toolbar
2. Toggle **Enable** on
3. Choose mode:
   - **All websites**: Enter a User-Agent string or click a preset
   - **Per-site rules**: Add domain + User-Agent pairs
4. Click **Save**

### Custom Presets

1. Enter or select a User-Agent
2. Type a name in the "Preset name" field
3. Click **+ Save as Preset**
4. Click the **×** on any custom preset to delete it

## Development

```bash
npm install      # Install dependencies
npm run build    # Build to dist/
npm run watch    # Watch mode for development
npm run clean    # Remove dist folder
```

## Permissions

- `storage` - Save settings locally
- `declarativeNetRequest` - Modify request headers
- `host_permissions: <all_urls>` - Apply to all websites

## Tech Stack

- TypeScript
- Chrome Extension Manifest V3
- declarativeNetRequest API

## License

MIT
