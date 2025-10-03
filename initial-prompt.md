Create a Node.js project called my-nodered that embeds Node-RED and lets me customize it with my own settings and plugins.

Requirements:

Split settings files:

Put them in src/settings/settings.d/ as modular fragments (00-base.js, 10-editor.js, 20-runtime.js, 30-security.local.js, etc.).

Each fragment should export default {} with only the keys it overrides.

Write a loader src/settings/settings.js that merges fragments in lexical order with a deep merge function.

Anything not defined should fall back to Node-RED’s built-in defaults (so don’t duplicate defaults).

Allow environment variables like PORT, LOG_LEVEL, FLOWS, USERDIR to override.

Embedded runtime:

Provide src/server.js that starts Node-RED programmatically using Express + HTTP server, applies the merged settings, and mounts RED.httpAdmin and RED.httpNode.

CLI:

Add bin/cli.js as the entry point. It should print a banner and then call the start() function from src/server.js.

Expose this as the "bin" entry in package.json so users can run your-nodered after a global npm install.

package.json:

Name your-nodered, include dependencies: "node-red", "express", and some example contrib nodes (node-red-dashboard, node-red-contrib-cron-plus, @node-red-contrib-themes/theme-collection).

Add scripts for start, dev, and build:pkg (using pkg to build binaries).

Docker support:

Create a Dockerfile that installs dependencies, copies the src and theme folders, exposes port 1880, and runs npm start.

Add an example docker-compose.yml with a volume for persistence.

Theme folder:

Add theme/editor.css, theme/editor.js, and theme/favicon.png. These should be referenced from settings.d/10-editor.js.

Deep merge utility:

In src/settings/helpers.js, implement a simple recursive deepMerge that merges objects, replaces arrays, and allows undefined values to leave defaults untouched.

Security best practice:

In 30-security.local.js, show how an adminAuth block could be defined with a bcrypt hash (commented out).

Cross-platform:

Ensure everything works from npm install, from a standalone binary (pkg build), and from Docker.
