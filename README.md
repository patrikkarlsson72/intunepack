# IntunePack

A lightweight Windows desktop application that enables IT administrators to easily create and extract `.intunewin` files for Microsoft Intune deployment. With an intuitive drag-and-drop interface and Windows-friendly design, IntunePack eliminates the need for complex command-line usage, making packaging tasks faster and more accessible for enterprise IT teams.

## 🚀 Features

- **IntuneWinAppUtilDecoder Integration**: Complete integration with Microsoft Intune Win32 Content Prep Tool
- **Package Creation**: Create .intunewin files from installers, folders, or files
- **Package Extraction**: Extract contents from existing .intunewin files
- **Drag & Drop Interface**: Simple file operations with visual feedback
- **Real-time Progress**: Live status updates and operation monitoring
- **File Dialogs**: Native Windows file and folder selection
- **Windows-Friendly Theme**: Optimized dark theme for IT administrators
- **Professional UI**: Clean, enterprise-ready interface design
- **Accessibility**: Full keyboard navigation and screen reader support
- **Modern Tech Stack**: Built with Tauri, React, and TypeScript

## 📋 Current Status

**Version**: 0.1.0+ (With IntuneWinAppUtilDecoder Integration)  
**Status**: Core Functionality Complete, Ready for Testing  
**Platform**: Windows 10/11 (64-bit)

### ✅ Completed
- Complete user interface and theme system
- IntuneWinAppUtilDecoder integration for package creation and extraction
- Real-time progress tracking and logging
- File dialog integration for Windows-native experience
- Drag and drop framework with operation detection
- Windows-friendly dark theme
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
