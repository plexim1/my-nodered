# your-nodered

Customizable Node-RED runtime that embeds the editor in an Express application and loads modular settings fragments.

## Features

- Modular settings split across `src/settings/settings.d/` and merged at runtime
- Theme assets served from `/theme` for stylesheet, script, and favicon overrides
- CLI entry point (`your-nodered`) for local runs or global npm installs
- Docker and Docker Compose examples for containerized deployments
- Optional pkg build script for standalone binaries

## Requirements

- Node.js 18 or newer
- npm (or compatible package manager)

## Installation

Install dependencies:

```bash
npm install
```

### Global install (optional)

Publish or link the project globally and run it via the CLI:

```bash
# inside the project folder
npm install -g .
# now available on PATH
your-nodered
```

## Running Locally

```bash
# development mode with NODE_ENV=development
npm run dev

# production-style run
npm start

# direct CLI invocation
node ./bin/cli.js
```

Set environment variables to override defaults:

- `PORT` – HTTP port (defaults to `1880`)
- `LOG_LEVEL` – Console log level (e.g. `debug`, `info`, `warn`)
- `FLOWS` – Flow file name (defaults to `flows.json`)
- `USERDIR` – Absolute path for the Node-RED user directory (defaults to `var/` inside the project)

Example:

```bash
PORT=3000 LOG_LEVEL=debug npm start
```

## Customizing Settings

Settings fragments live in `src/settings/settings.d/` and are merged lexically. Add new files prefixed with an ordering number (e.g. `40-my-plugin.js`) exporting default overrides:

```js
export default {
  someSetting: {
    nestedOption: true,
  },
};
```

The deep merge helper keeps arrays as replacements and skips `undefined` values so Node-RED defaults remain intact.

## Theme Overrides

`theme/editor.css` imports the `zendesk-garden` preset from `@node-red-contrib-themes/theme-collection` and layers override rules driven by `--garden-*` CSS custom properties. Adjust them directly in the file or run `window.myNoderedTheme.apply({ "--garden-primary": "#123456" })` in the browser console to persist tweaks (use `window.myNoderedTheme.reset()` to clear). Static assets under `theme/` are still served at `/theme`, so you can swap `editor.js`, `favicon.png`, or add additional files as needed.

## Building Standalone Binaries

Use pkg to produce executables for supported platforms:

```bash
npm run build:pkg
# outputs to ./dist
```

Ensure the pkg tool is installed (it is included as a dev dependency).

## Docker Usage

Build and run the container manually:

```bash
docker build -t your-nodered .
docker run --rm -p 1880:1880 -e LOG_LEVEL=info your-nodered
```

Or use the provided Compose file for persistent storage:

```bash
docker-compose up --build
```

The Compose setup mounts `var/` to a named volume (`nodered_data`) for flow persistence.

## Additional Notes

- Custom nodes can be dropped into the `nodes/` directory and referenced from `20-runtime.js`
- Security hooks are illustrated in `30-security.local.js` (adminAuth example is commented out)
- When packaging or containerizing, ensure environment variables are forwarded according to your deployment target

