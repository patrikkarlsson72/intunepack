# Product Requirements Document – IntunePack

## Elevator Pitch
A lightweight Windows desktop application that enables IT admins to easily create and extract `.intunewin` files. With simple drag-and-drop functionality, the app eliminates the need for complex command-line usage, making packaging tasks faster and more accessible.

## Who is this app for
- IT administrators managing application deployments in Microsoft Intune
- MSI/packaging specialists who frequently handle `.intunewin` packaging
- Teams looking for a simple, GUI-based alternative to command-line tools

## Functional Requirements
- Drag and drop files or folders into the app to create a `.intunewin` package
- Drag and drop an existing `.intunewin` file to extract its contents
- Display progress indicator during packaging or extraction
- Log output visible within the app (success, errors, warnings)
- Output files saved to a default or user-selected directory

## User Stories
- As an IT admin, I want to drag and drop an installer into the app so that I can quickly generate a `.intunewin` package.  
- As an IT admin, I want to drag and drop a `.intunewin` file so that I can extract its contents without using the command line.  
- As an IT admin, I want to see a progress bar so that I know how long the operation will take.  
- As an IT admin, I want to see logs in the app so that I can confirm the process completed successfully or troubleshoot errors.

## User Interface
- Minimal single-window application  
- Drag-and-drop area at the center for files/folders  
- Progress bar displayed during operations  
- Log panel below drag-and-drop area showing real-time status and results  
- Clean design using React, Tailwind, shadcn UI components, built with Vite & Tauri for Windows desktop deployment
