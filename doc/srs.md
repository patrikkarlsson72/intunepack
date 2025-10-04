# Software Requirements Specification – IntunePack

## System Overview
IntunePack is a Windows desktop application built with modern web technologies and native performance. The application provides a graphical interface for creating and extracting `.intunewin` files, targeting IT administrators who need efficient tools for Microsoft Intune package management.

## System Design

### Architecture
- **Desktop Application**: Built with Tauri for Windows, providing native performance and system integration
- **Frontend**: React with TypeScript, bundled with Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent, accessible design
- **Backend**: Rust-based Tauri commands for file system operations and package processing

### Core Logic
- **File Detection**: Automatically detect selected file types (`.exe`, `.msi`, folders, or `.intunewin`)
- **Package Operations**: Backend Rust commands handle `.intunewin` creation and extraction
- **Real-time Feedback**: Progress indicators and logging system for operation monitoring
- **Error Handling**: Comprehensive error reporting and user-friendly messages

## Architecture Pattern

### Component Architecture
- **Frontend**: React component-based architecture with TypeScript
- **Backend**: Tauri Rust commands for file operations and system integration
- **Pattern**: MVVM-like architecture — UI (React) ↔ State Manager ↔ Tauri Commands
- **Communication**: Bidirectional communication between frontend and backend via Tauri's IPC

### State Management
- **Primary**: React hooks and Context API for lightweight state management
- **Global State**: Theme context for dark/light mode switching
- **Local State**: Component-level state for UI interactions and form data
- **Operation States**: 
  - `idle`: Ready for user input
  - `processing`: Active operation in progress
  - `completed`: Operation finished successfully
  - `failed`: Operation encountered an error

## Data Flow

### Package Creation Flow
1. User clicks "Browse Folders" → Select folder containing setup files
2. User selects main setup executable (setup.exe, setup.msi, etc.)
3. User chooses output directory for the generated .intunewin file
4. User clicks "Create Package" → React calls Tauri command `create_intunewin(setup_folder, setup_file, output_folder)`
5. Backend executes IntuneWinAppUtil.exe with correct parameters (-c, -s, -o, -q)
6. Backend streams progress updates and logs to frontend
7. Frontend updates workflow tracker with green dot indicators
8. Backend verifies .intunewin file creation with multiple detection methods
9. Operation completes → Success/error state displayed to user

### Package Extraction Flow
1. User clicks to select `.intunewin` file → React validates file type
2. React calls Tauri command `extract_intunewin(file_path, output_dir)`
3. Backend extracts package contents → streams progress and logs
4. Frontend displays extraction progress and results
5. Operation completes → Extracted files available in output directory

## Technical Stack

### Frontend Technologies
- **React 19.1.0**: Modern React with latest features
- **TypeScript**: Type-safe development with comprehensive type checking
- **Vite 7.0.4**: Fast build tool and development server
- **Tailwind CSS 4.1.14**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible UI components
- **Lucide React**: Modern icon library

### Backend Technologies
- **Tauri 2.8.5**: Rust-based desktop app framework
- **Rust**: System programming language for performance and safety
- **Serde**: Serialization framework for JSON communication
- **Tauri Plugin Opener**: File system integration
- **IntuneWinAppUtil.exe**: Microsoft's official tool for .intunewin package creation
- **IntuneWinAppUtilDecoder.exe**: Third-party tool for .intunewin package extraction

### Development Tools
- **Node.js**: JavaScript runtime for development
- **npm**: Package management
- **Cargo**: Rust package manager
- **Git**: Version control

## User Interface Design

### Layout Components
- **Header**: Application branding, theme toggle, and status indicator
- **Click-to-Select Zone**: Central workspace for file operations
- **Workflow Tracker**: Visual progress indicators showing completed steps in package creation
- **Action Cards**: Primary function buttons (Create Package, Extract Package)
- **Logs Panel**: Collapsible panel for operation monitoring and debugging

### Theme System
- **Windows-Friendly Dark Theme**: Optimized for IT administrators
- **Color Palette**: Windows 11 dark mode colors for familiarity
- **Accessibility**: High contrast ratios and clear typography
- **Responsive Design**: Adapts to different window sizes

## API Design

### Tauri Commands
```rust
// Package Creation (Updated with correct parameters)
create_intunewin(setup_folder: String, setup_file: String, output_folder: String) -> Result<OperationResult, String>

// Package Extraction  
extract_intunewin(file_path: String, output_dir: String) -> Result<OperationResult, String>
```

### IntuneWinAppUtil Integration
The application integrates with Microsoft's IntuneWinAppUtil.exe using the correct command-line syntax:

```bash
IntuneWinAppUtil.exe -c <setup_folder> -s <setup_file> -o <output_folder> -q
```

**Parameters:**
- `-c`: Setup folder containing all application files
- `-s`: Main setup executable (setup.exe, setup.msi, etc.)
- `-o`: Output folder for the generated .intunewin file
- `-q`: Quiet mode to avoid interactive prompts

**File Detection:**
- Primary: Checks for expected filename pattern (setup_file_name.intunewin)
- Fallback: Scans output directory for any .intunewin files
- Verification: Confirms file creation before reporting success

### Message Format
```json
{
  "status": "in-progress" | "success" | "error",
  "progress": 0-100,
  "message": "Operation status message",
  "timestamp": "ISO 8601 timestamp"
}
```

## Security Considerations

### Local-Only Operations
- **No Network Access**: All operations performed locally on the user's machine
- **No Data Collection**: No telemetry or user data transmission
- **File System Access**: Limited to user-specified directories only
- **Sandboxed Execution**: Tauri provides security boundaries for system access

### Future Security Enhancements
- **Code Signing**: Digital signature for executable verification
- **Antivirus Compatibility**: Ensure compatibility with enterprise security tools
- **Permission Management**: Granular file system access controls

## Performance Requirements

### System Requirements
- **OS**: Windows 10/11 (64-bit)
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 100MB for application, additional space for package operations
- **CPU**: Modern multi-core processor recommended

### Performance Targets
- **Startup Time**: < 3 seconds application launch
- **Package Creation**: Handle files up to 2GB efficiently
- **Memory Usage**: < 500MB during normal operations
- **UI Responsiveness**: 60fps animations and interactions

## Future Enhancements

### Planned Features
- **Batch Operations**: Process multiple packages simultaneously
- **Template System**: Save and reuse packaging configurations
- **Integration**: Direct upload to Microsoft Intune (optional)
- **Configuration**: User preferences and settings persistence

### Technical Improvements
- **Local Database**: SQLite for operation history and preferences
- **Plugin System**: Extensible architecture for custom operations
- **Multi-threading**: Parallel processing for large packages
- **Auto-updates**: Built-in update mechanism
