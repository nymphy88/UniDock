# Gemini CLI Context for UniDock Project

This document outlines the context and structure of the UniDock project, providing instructional guidance for Gemini CLI interactions.

## Project Overview

UniDock is an Electron-based desktop application built with React, TypeScript, and Vite. It functions as a utility or overlay window, designed to be small, transparent, and always-on-top. The application integrates with external services like Supabase and Cloudflare KV, managing API keys and other secrets locally using `electron-store`.

## Technologies Stack

*   **Frontend Framework**: React
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Desktop Framework**: Electron
*   **State Management**: Implicitly managed by React, with `electron-store` for persistent secrets.
*   **Backend Integration**: Supabase (via `@supabase/supabase-js`), Cloudflare KV (via direct API calls).
*   **Local Storage**: `electron-store` for managing sensitive credentials.

## Key Files and Directories

*   **`README.md`**: Provides an overview of the project's setup, technologies (React, Vite, ESLint), and build tooling.
*   **`package.json`**: Defines project dependencies, development scripts (e.g., `dev`, `build`, `lint`, `electron`), and project metadata.
*   **`vite.config.ts`**: Configures Vite for building the React application and integrating the Electron main, preload, and renderer processes.
*   **`electron/main.ts`**: Contains the main process logic for the Electron application, including window creation, IPC handlers for secrets management, and integrations with Supabase and Cloudflare KV.
*   **`electron/preload.ts`**: (Assumed based on `vite.config.ts`) Provides a bridge for the renderer process to access Node.js APIs and Electron capabilities.
*   **`src/main.tsx`**: The entry point for the renderer process, likely bootstrapping the React application.
*   **`public/vite.svg`**, **`src/assets/react.svg`**: Placeholder assets.
*   **`.env`, `.env.local`**: Environment variable configuration.
*   **`tsconfig.json`**, **`tsconfig.app.json`**, **`tsconfig.node.json`**: TypeScript configuration files.

## Building and Running

### Development Server
Starts the Vite development server for the React renderer process.
```bash
npm run dev
```

### Build
Builds the application for production, including the Electron executable.
```bash
npm run build
```

### Run Electron App
Launches the Electron application.
```bash
npm run electron
```
or
```bash
npm run electron:serve
```
(Note: `electron:serve` waits for the dev server to be ready.)

### Type Checking
Ensures TypeScript code is free of type errors.
```bash
npm run typecheck
```

### Linting and Formatting
*   **Lint code**: `npm run lint`
*   **Fix linting errors**: `npm run lint:fix`
*   **Format code**: `npm run format`

## Development Conventions

*   **TypeScript**: The project uses TypeScript for type safety.
*   **ESLint**: Configuration for ESLint is provided in `eslint.config.js`, with instructions for enabling type-aware rules and integrating `eslint-plugin-react-x` and `eslint-plugin-react-dom`.
*   **Vite**: Vite is used as the build tool and development server, configured via `vite.config.ts`.
*   **Electron Integration**: The Electron main process is handled in `electron/main.ts`, with a preload script for communication between the renderer and main processes.
*   **Secrets Management**: Sensitive credentials (API keys, etc.) are stored locally using `electron-store` and accessed via IPC handlers in `electron/main.ts`.

## Notes for Interaction

*   When interacting with the application's features related to Supabase or Cloudflare KV, ensure that the necessary secrets are configured and available via `electron-store` or provide them when prompted.
*   Development commands like `npm run dev` will launch the Vite development server, which can then be connected to by the Electron renderer process.
*   Building the application (`npm run build`) will produce output in the `dist` and `dist-electron` directories.
