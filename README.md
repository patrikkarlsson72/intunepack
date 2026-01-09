# IntunePack

A lightweight Windows desktop application that enables IT administrators to easily create and extract `.intunewin` files for Microsoft Intune deployment. With an intuitive click-to-select interface and Windows-friendly design, IntunePack eliminates the need for complex command-line usage, making packaging tasks faster and more accessible for enterprise IT teams.

## 🚀 Features

- **IntuneWinAppUtilDecoder Integration**: Complete integration with Microsoft Intune Win32 Content Prep Tool
- **Simplified 3-Step Package Creation**: Browse Folders → Select Setup File → Create Package (output saved to setup folder automatically)
- **Visual Progress Tracking**: Real-time workflow status with green dot indicators for each completed step
- **Package Creation**: Create .intunewin files from installers, folders, or files using correct IntuneWinAppUtil.exe parameters
- **Package Extraction**: Extract contents from existing .intunewin files
- **About Section**: Comprehensive application information accessible via Info button in header
- **Version Information**: Display of application, Tauri, Rust versions and platform details
- **Resource Links**: Direct access to GitHub repository and documentation
- **Click-to-Select Interface**: Simple file operations with visual feedback
- **Real-time Progress**: Live status updates and operation monitoring
- **File Dialogs**: Native Windows file and folder selection
- **Keyboard Shortcuts**: Ctrl+O for quick file access
- **Theme Support**: Windows-friendly dark and light themes with automatic adaptation
- **Optimized Window Size**: Default 900x800 window dimensions for better content visibility
- **Professional UI**: Clean, enterprise-ready interface design
- **Accessibility**: Full keyboard navigation and screen reader support
- **Modern Tech Stack**: Built with Tauri, React, and TypeScript

## 📋 Current Status

**Version**: 1.2.2  
**Status**: Production Ready  
**Platform**: Windows 10/11 (64-bit)

### ✅ Completed
- Complete user interface and theme system
- IntuneWinAppUtilDecoder integration for package creation and extraction
- Simplified 3-step package creation workflow with automatic output location
- Correct IntuneWinAppUtil.exe command-line parameter implementation
- Enhanced file detection and success verification
- Real-time progress tracking and logging
- File dialog integration for Windows-native experience
- Click-to-select framework with operation detection
- Windows-friendly dark and light themes with automatic adaptation
- About section with comprehensive application information
- Version information display and resource links
- Optimized window sizing (900x800) for better content visibility
- Theme-aware Operation Logs button styling
- Responsive design and accessibility features
- Comprehensive error handling and user feedback
- Project structure and build system

### 🚧 In Development
- User preferences and settings persistence
- Batch processing capabilities
- Advanced package validation
- Auto-download of IntuneWin executables

## 🛠️ Technology Stack

- **Frontend**: React 19.1.0 + TypeScript
- **Backend**: Tauri 2.8.5 + Rust
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite 7.0.4
- **Icons**: Lucide React
- **URL Opening**: Open Crate 5.0 for cross-platform URL handling
- **Platform**: Windows Desktop

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Rust 1.70+
- Windows 10/11 (64-bit)
- **IntuneWin Executables**: Download `IntuneWinAppUtil.exe` and `IntuneWinAppUtilDecoder.exe` and place them in `src-tauri/bin/`

### Installation
```bash
# Clone the repository
git clone https://github.com/patrikkarlsson72/intunepack.git
cd intunepack

# Install dependencies
npm install

# Start development server
npm run tauri dev
```

### Building
```bash
# Build for production
npm run tauri build
```

## 📦 IntuneWin Executables Setup

To use IntunePack, you need to download the Microsoft Intune Win32 Content Prep Tool executables:

### Download Sources
- **IntuneWinAppUtil.exe**: Available from Microsoft's official Intune Win32 Content Prep Tool
- **IntuneWinAppUtilDecoder.exe**: Available from the [IntuneWinAppUtilDecoder GitHub repository](https://github.com/okieselbach/Intune/tree/master/IntuneWinAppUtilDecoder)

### Installation
1. Download both executables
2. Place them in the `src-tauri/bin/` directory:
   ```
   intunepack/
   └── src-tauri/
       └── bin/
           ├── IntuneWinAppUtil.exe
           └── IntuneWinAppUtilDecoder.exe
   ```

### Verification
The application will automatically detect the executables and show helpful error messages if they're missing.

## 📖 Documentation

- **[Product Requirements Document](doc/prd.md)**: Feature specifications and user stories
- **[Software Requirements Specification](doc/srs.md)**: Technical implementation details
- **[User Interface Design Document](doc/uidd.md)**: UI/UX specifications and design system
- **[Changelog](CHANGELOG.md)**: Complete project history and changes

## 📋 Workflows

### Package Creation Workflow

IntunePack provides a streamlined 3-step process for creating .intunewin packages:

1. **Browse Folders**: Select the folder containing your application setup files
2. **Select Setup File**: Choose the main setup executable (e.g., setup.exe, setup.msi)
3. **Create Package**: Click "Create Package" to generate the .intunewin file

**Output Location**: The generated .intunewin file is automatically saved in the same folder as your setup files, keeping everything organized together.

### Package Extraction Workflow

Extract .intunewin packages in a simple 1-step process:

1. **Select File**: Choose the .intunewin file to extract

**Output Location**: Files are automatically extracted to the same folder as the .intunewin file for easy access.

The application provides visual feedback with green dot indicators and automatic output locations, ensuring a clear and intuitive user experience.

## 🎯 Target Users

- **Primary**: IT administrators managing Microsoft Intune deployments
- **Secondary**: MSI/packaging specialists and enterprise IT teams
- **Environment**: Windows-based enterprise environments

## 🎨 Design Philosophy

IntunePack is designed specifically for Windows IT administrators, prioritizing:
- **Familiarity**: Windows 11 design language and patterns
- **Efficiency**: Streamlined workflows for common tasks
- **Professional**: Enterprise-ready appearance and functionality
- **Accessibility**: Inclusive design for all users

## 🎨 Branding & Logo

IntunePack features a custom logo that automatically adapts to your theme preference:

- **Light Theme**: Dark gray text with blue wireframe box icon
- **Dark Theme**: White text with blue wireframe box icon  
- **Design**: 3D wireframe box with upward arrow representing packaging and deployment
- **Colors**: Professional blue (#2563EB) and neutral grays for maximum readability
- **Theme Switching**: Automatic logo switching based on user's light/dark theme preference

The logo is optimized for both themes to ensure perfect visibility and professional appearance in all lighting conditions.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and code of conduct.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tauri Team**: For the excellent desktop app framework
- **React Team**: For the powerful UI library
- **shadcn/ui**: For beautiful and accessible components
- **Tailwind CSS**: For the utility-first CSS framework
- **Microsoft**: For the IntuneWin packaging specification

## 📞 Support

For questions, issues, or contributions, please:
- Open an issue on GitHub
- Check the documentation
- Review the changelog for recent changes

---

**IntunePack** - Making Intune packaging simple for Windows administrators.
