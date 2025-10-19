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

### Windows EXE and Service

- Build EXE (PowerShell):

  ```powershell
  # From repo root
  .\scripts\build-windows.ps1            # defaults to node18-win-x64 -> dist\your-nodered.exe
  # or customize target/output
  .\scripts\build-windows.ps1 -Target node20-win-x64 -OutputName my-nodered.exe
  ```

- Install as a Windows Service using WinSW:

  1) Prepare a folder for the service payload, e.g. `C:\Services\your-nodered`.
  2) Copy the built EXE from `dist\your-nodered.exe` into that folder.
  3) Copy the XML from `service\your-nodered.xml` into the same folder.
  4) (Optional) Copy your `.env` file; create `var\` (for flows) and `logs\` directories.
  5) Download WinSW (Windows Service Wrapper) x64 release:

     - https://github.com/winsw/winsw/releases
     - Place `WinSW-x64.exe` in the same folder and rename it to `your-nodered-service.exe`.
     - Rename `your-nodered.xml` to `your-nodered-service.xml` so it shares the same basename as the WinSW binary.

  6) Install and run (in elevated PowerShell):

  ```powershell
  Set-Location C:\Services\your-nodered
  .\your-nodered-service.exe install
  .\your-nodered-service.exe start
  ```

  - Check status: `sc.exe query your-nodered`
  - Stop/remove: `./your-nodered-service.exe stop` then `./your-nodered-service.exe uninstall`

  Notes:
  - The XML sets `USERDIR` to `%BASE%\var` and `workingdirectory` to `%BASE%`. Ensure the service account has write permission to this folder.
  - Adjust `PORT`, `LOG_LEVEL`, or add `FLOWS` in the XML `<env>` entries as needed.
  - Logs are written under `%BASE%\logs` and roll by size and date.

### Windows Service (node-windows)

If Node is installed on the machine, you can run this runtime as a native Windows Service using node-windows, configured via an external JSON file (no hardcoded env in the script).

Setup:
- Copy the template and edit your settings:

  ```powershell
  Copy-Item service\windows-service.config.json.example service\windows-service.config.json
  # Edit service\windows-service.config.json to set name, workingDirectory, envFile, etc.
  ```

- Install dependencies if needed:

  ```powershell
  npm install
  ```

- Install the service (run PowerShell as Administrator):

  ```powershell
  npm run service:install
  ```

- Uninstall later:

  ```powershell
  npm run service:uninstall
  ```

Config reference (service/windows-service.config.json):
- `name`: Service name registered in SCM (e.g., `your-nodered`).
- `description`: Text shown in Services UI.
- `workingDirectory`: Base directory for the process; relative paths resolve from the config file location.
- `script`: Entry script to run (defaults to `bin/cli.js`).
- `envFile`: Path to an `.env` file whose variables are injected into the service environment.
- `env`: Inline key-value env vars to set (overrides values from `envFile`).
- `nodeOptions`: Optional array of Node flags (e.g., `--max-old-space-size=512`).
- `scriptOptions`: Optional array of args passed to your script.
- `startOnInstall`: When true, the service starts immediately after installation.

Notes:
- Run installs/uninstalls in an elevated PowerShell (Administrator).
- Ensure the service account has write access to your `var/` directory for flows and credentials.
- Since `bin/cli.js` already loads `dotenv/config`, you can also rely on a `.env` in `workingDirectory`; the service config provides a way to explicitly inject env if preferred.

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

