# Software Requirements Specification – IntunePack

## System Design
- Desktop application built with Tauri for Windows.
- Frontend built in React with Vite bundler.
- UI styled with Tailwind and shadcn components.
- Core logic:
  - Detect dropped file type (`.exe`, `.msi`, folder, or `.intunewin`).
  - Call backend (Rust/Tauri command) to create or extract `.intunewin`.
  - Display progress and logs in the UI.

## Architecture Pattern
- **Frontend**: React component-based architecture.
- **Backend**: Tauri Rust commands handle file operations.
- **Pattern**: MVVM-like — UI (React) ↔ State Manager ↔ Tauri commands.

## State Management
- Lightweight state management with React hooks + Context API.
- States:
  - Idle
  - Processing
  - Completed
  - Failed
- Log messages and progress stored in a global state accessible by components.

## Data Flow
1. User drags/drops file → React detects file type.
2. React calls Tauri command (`create_intunewin`, `extract_intunewin`).
3. Backend processes file → streams progress updates and logs to frontend.
4. Frontend updates state → Progress bar + log panel render in real time.

## Technical Stack
- **Frontend**: React, Vite, shadcn UI, Tailwind CSS
- **Backend**: Tauri (Rust)
- **Packaging**: Tauri bundler for Windows executable
- **Logging**: JSON messages from Rust → parsed in React for display
- **OS**: Windows only

## Authentication Process
- No authentication required (local-only desktop app).
- Future enhancement: optional integration with Microsoft identity for Intune upload.

## Route Design
- Single-page application (no routing required).
- Component-based layout:
  - Header
  - Drag-and-drop workspace
  - Action cards
  - Logs panel

## API Design
- Internal Tauri commands (Rust ↔ JS bridge):
  - `create_intunewin(input_path, output_dir) -> { progress, logs }`
  - `extract_intunewin(file_path, output_dir) -> { progress, logs }`
- Messages exchanged as JSON objects with:
  - `status` (in-progress, success, error)
  - `progress` (%)
  - `message` (log line)

## Database Design ERD
- No database required (local-only app).
- Future enhancement: local SQLite or JSON config file to remember last used directories.
