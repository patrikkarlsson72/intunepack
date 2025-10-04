# Changelog

All notable changes to IntunePack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Package Creation Workflow**: Fixed incorrect IntuneWinAppUtil.exe command parameters causing package creation failures
- **False Error Reporting**: Resolved issue where app reported "Package creation failed" despite successful .intunewin file creation
- **File Detection Logic**: Enhanced success detection with proper .intunewin file verification and fallback checking
- **Console Input Issue**: Resolved System.InvalidOperationException during .intunewin extraction by redirecting stdin to null
- **Double File Selection**: Fixed workflow where users had to select .intunewin file twice during extraction
- **File Path Management**: Improved state management to properly track selected files with full paths
- **Drag and Drop Limitations**: Replaced non-working drag and drop with enhanced click-to-select interface
- **User Experience**: Streamlined single-click workflow for file selection and extraction

### Improved
- **Package Creation Workflow**: Implemented proper 4-step workflow with visual progress tracking
- **Command Line Integration**: Updated to use correct IntuneWinAppUtil.exe parameters (-c, -s, -o, -q)
- **Success Detection**: Enhanced file creation verification with multiple detection methods
- **Error Detection**: Enhanced extraction success detection by checking for actual output files (.zip and extracted folders)
- **Error Reporting**: Added detailed stdout/stderr information for better debugging
- **User Interface**: Updated UI text and visual feedback to reflect click-to-select functionality
- **Accessibility**: Added keyboard shortcuts (Ctrl+O) for quick file access
- **Workflow**: Simplified file selection process with clear visual guidance

### Added
- **IntuneWinAppUtilDecoder Integration**: Complete integration with Microsoft Intune Win32 Content Prep Tool
- **Package Creation**: Full .intunewin file creation using IntuneWinAppUtil.exe
- **Package Extraction**: Complete .intunewin file extraction using IntuneWinAppUtilDecoder.exe
- **Real-time Progress Tracking**: Live progress updates during packaging operations
- **File Dialog Integration**: Native Windows file and folder selection dialogs
- **Error Handling**: Comprehensive error messages and troubleshooting guidance
- **Executable Management**: Automatic detection and validation of required tools
- **Click-to-Select Interface**: Enhanced file selection with visual feedback and keyboard shortcuts
- **Visual Feedback**: Real-time visual feedback for file selection and operations
- **File Type Validation**: Automatic validation for .intunewin files on extract operations
- **Custom Logo Implementation**: Theme-adaptive logo system with dual logo files
- **Branding System**: Professional logo design with 3D wireframe box and upward arrow icon

### Technical Implementation
- **Rust Backend**: Tauri commands for IntuneWin operations (`create_intunewin`, `extract_intunewin`)
- **Progress Events**: Real-time progress updates via Tauri event system
- **File System Integration**: Proper file path handling and validation
- **Plugin Configuration**: Shell and dialog plugin setup for system integration
- **Error Recovery**: Graceful handling of missing executables with helpful messages

### Fixed
- **Tauri v2 Compatibility**: Updated API calls from `emit_all` to `emit` with proper trait imports
- **Plugin Configuration**: Corrected shell and dialog plugin settings for Tauri v2
- **Dialog Plugin Startup Error**: Fixed PluginInitialization error by removing empty dialog configuration from tauri.conf.json
- **Build Issues**: Resolved compilation errors and dependency conflicts
- **Port Conflicts**: Fixed development server port management

### Planned
- Add batch processing capabilities
- Implement user preferences and settings persistence
- Add package validation and verification features
- Create installer and distribution packages
- Add IntuneWinAppUtil.exe and IntuneWinAppUtilDecoder.exe auto-download

## [0.1.0] - 2025-10-03

### Added
- **Initial Release**: Complete IntunePack desktop application
- **Project Setup**: Tauri + React + TypeScript foundation
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Theme System**: Windows-friendly dark theme optimized for IT administrators
- **Drag & Drop Interface**: Central workspace for file operations
- **Action Cards**: Create Package and Extract Package functionality
- **Status Indicators**: Real-time operation status and progress tracking
- **Logs Panel**: Collapsible panel for operation monitoring and debugging
- **Theme Toggle**: Light/dark mode switching with sun/moon icons
- **Responsive Design**: Adaptive layout for different window sizes
- **Accessibility**: Full keyboard navigation and screen reader support
- **Documentation**: Comprehensive PRD, SRS, and UIDD documents

### Technical Implementation
- **Frontend**: React 19.1.0 with TypeScript
- **Backend**: Tauri 2.8.5 with Rust
- **Build System**: Vite 7.0.4 for fast development and optimized builds
- **UI Components**: shadcn/ui with Lucide React icons
- **Styling**: Tailwind CSS 4.1.14 with custom Windows 11 color palette
- **State Management**: React hooks and Context API
- **File Operations**: Drag and drop with file type detection
- **Error Handling**: Comprehensive error reporting and user feedback

### Design Features
- **Windows-Native Feel**: Interface designed for Windows IT administrators
- **Professional Appearance**: Suitable for enterprise environments
- **High Contrast**: WCAG AA compliant contrast ratios
- **Smooth Animations**: 200ms transitions with hardware acceleration
- **Visual Feedback**: Hover states, scaling effects, and status indicators
- **Color Coding**: Windows-style blue for create, green for extract operations

### Documentation
- **Product Requirements Document**: Comprehensive feature specifications
- **Software Requirements Specification**: Technical implementation details
- **User Interface Design Document**: Complete UI/UX specifications
- **README**: Project overview and setup instructions
- **Changelog**: This file for tracking all changes

### Repository
- **GitHub Integration**: Project pushed to https://github.com/patrikkarlsson72/intunepack
- **Version Control**: Complete git history with descriptive commits
- **Project Structure**: Organized codebase with clear separation of concerns

## Development History

### Project Initialization
- **2025-10-03**: Project created from Tauri + React + TypeScript template
- **2025-10-03**: Initial UI components and layout structure implemented
- **2025-10-03**: Theme system and styling framework established
- **2025-10-03**: Drag and drop functionality framework added
- **2025-10-03**: Action cards and status indicators implemented

### Naming and Branding
- **2025-10-03**: Renamed from "IntuneWin Helper" to "IntunePack"
- **2025-10-03**: Updated all configuration files and documentation
- **2025-10-03**: Resolved compilation errors and build issues
- **2025-10-03**: Cleaned up project structure and removed old references

### Theme and UI Improvements
- **2025-10-03**: Implemented Windows-friendly dark theme
- **2025-10-03**: Updated color palette to Windows 11 dark mode colors
- **2025-10-03**: Improved contrast and readability for IT administrators
- **2025-10-03**: Enhanced visual feedback and hover states
- **2025-10-03**: Added smooth animations and transitions

### Documentation Updates
- **2025-10-03**: Comprehensive PRD update with final specifications
- **2025-10-03**: Detailed SRS with technical implementation details
- **2025-10-03**: Complete UIDD with Windows-friendly design specifications
- **2025-10-03**: Created comprehensive changelog for project tracking

### Repository Management
- **2025-10-03**: Initial commit with complete project structure
- **2025-10-03**: GitHub repository setup and push
- **2025-10-03**: Documentation updates and final project organization

### IntuneWinAppUtilDecoder Integration
- **2025-10-03**: Researched IntuneWinAppUtilDecoder vs custom implementation approach
- **2025-10-03**: Decided to integrate existing tools for reliability and speed
- **2025-10-03**: Added Rust backend commands for IntuneWin operations
- **2025-10-03**: Implemented real-time progress tracking with Tauri events
- **2025-10-03**: Added file dialog integration for Windows-native experience
- **2025-10-03**: Updated frontend to handle drag-and-drop and operation selection
- **2025-10-03**: Fixed Tauri v2 compatibility issues (emit_all → emit, plugin configs)
- **2025-10-03**: Resolved build errors and dependency conflicts
- **2025-10-03**: Added comprehensive error handling for missing executables
- **2025-10-03**: Updated documentation with integration details

### Bug Fixes and Stability Improvements
- **2025-01-27**: Fixed critical startup crash caused by dialog plugin configuration error
  - Removed empty `"dialog": {}` configuration from tauri.conf.json
  - Resolved PluginInitialization deserialization error
  - Dialog plugin now properly initialized with default settings via Rust code
  - Application now starts successfully without configuration conflicts

### User Experience and Workflow Improvements
- **2025-01-27**: Major workflow improvements and bug fixes
  - **Console Input Fix**: Resolved System.InvalidOperationException in IntuneWinAppUtilDecoder.exe by redirecting stdin to null
  - **Single File Selection**: Fixed double file selection issue by improving state management and file path tracking
  - **Click-to-Select Interface**: Replaced non-working drag and drop with reliable click-to-select functionality
  - **Enhanced Error Detection**: Improved extraction success detection by checking for actual output files
  - **Keyboard Shortcuts**: Added Ctrl+O shortcut for quick file access
  - **Better User Guidance**: Updated UI text and visual feedback for clearer user experience
  - **Debug Logging**: Added comprehensive console logging for troubleshooting and development

### Package Creation Workflow Fixes
- **2025-01-27**: Critical fixes for package creation functionality
  - **Command Line Parameters**: Fixed IntuneWinAppUtil.exe command to use correct syntax (-c setup_folder -s setup_file -o output_folder -q)
  - **False Error Reporting**: Resolved issue where successful package creation was incorrectly reported as failed
  - **File Detection**: Enhanced .intunewin file detection with multiple verification methods
  - **4-Step Workflow**: Implemented proper workflow: Browse Folders → Select Setup File → Choose Output → Create Package
  - **Visual Progress Tracking**: Added workflow status indicators with green dots for completed steps
  - **Success Verification**: App now properly confirms when .intunewin files are actually created

### Logo and Branding Implementation
- **2025-01-27**: Complete logo system implementation and theme integration
  - **Custom Logo Design**: Created professional logo with 3D wireframe box and upward arrow icon
  - **Theme-Adaptive System**: Implemented dual-logo system for light and dark themes
  - **Light Theme Logo**: Dark gray text with blue wireframe box for optimal contrast on light backgrounds
  - **Dark Theme Logo**: White text with blue wireframe box for maximum visibility on dark backgrounds
  - **Automatic Switching**: Logo automatically changes based on user's theme preference
  - **Professional Branding**: Blue (#2563EB) and neutral gray color scheme matching Windows design language
  - **Optimized Sizing**: 64px height (4rem) for perfect header visibility and professional appearance
  - **CSS Integration**: Clean styling with hover effects and smooth transitions
  - **Accessibility**: Proper alt text and theme compatibility for all users

## Known Issues

### Current Limitations
- **Executable Requirements**: Requires manual download of IntuneWinAppUtil.exe and IntuneWinAppUtilDecoder.exe
- **Settings**: No user preferences or configuration persistence
- **Batch Processing**: Single file operations only
- **Advanced Validation**: Basic file validation without deep package inspection
- **Drag and Drop**: Not supported due to Tauri webview limitations (replaced with click-to-select)
- **Error Recovery**: Standard error handling without advanced recovery options

### Future Enhancements
- **Auto-Download**: Automatic download of IntuneWin executables during first run
- **Advanced Features**: Batch processing, templates, and automation
- **Integration**: Direct Microsoft Intune upload capabilities
- **Performance**: Multi-threading and large file handling optimizations
- **User Experience**: Advanced settings, preferences, and customization options
- **Package Validation**: Deep inspection of .intunewin files and contents
- **Template System**: Save and reuse packaging configurations

## Contributing

### Development Setup
1. Clone the repository: `git clone https://github.com/patrikkarlsson72/intunepack.git`
2. Install dependencies: `npm install`
3. Start development server: `npm run tauri dev`
4. Build for production: `npm run tauri build`

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Conventional Commits**: Descriptive commit messages
- **Documentation**: Comprehensive inline and external documentation

### Testing
- **Manual Testing**: UI interactions and visual feedback
- **Build Testing**: Development and production builds
- **Cross-Platform**: Windows 10/11 compatibility
- **Accessibility**: Keyboard navigation and screen reader support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Tauri Team**: For the excellent desktop app framework
- **React Team**: For the powerful UI library
- **shadcn/ui**: For the beautiful and accessible component library
- **Tailwind CSS**: For the utility-first CSS framework
- **Microsoft**: For the IntuneWin packaging specification
