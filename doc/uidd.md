# User Interface Design Document – IntunePack

## Layout Structure
- **Header area**: Minimal top bar with app name ("IntunePack").
- **Central workspace**: Large, centered drag-and-drop zone for files/folders.
- **Action cards beneath workspace**:
  - *Create Package* card
  - *Extract Package* card
- **Bottom area**: Collapsible slide-up panel for logs and operation history.

## Core Components
- **Drag-and-drop zone**: Prominent area in the center, accepting either installers/folders or `.intunewin` files.
- **Action cards**: Rounded, shadowed panels with icons for clarity. Clicking them also triggers file selection dialog.
- **Progress bar**: Inline with the active action card, showing task status.
- **Logs panel**: Real-time log output with success, warning, and error states. Expandable/collapsible for clarity.

## Interaction Patterns
- **Primary interaction**: Dragging files/folders into the drop zone.
- **Secondary interaction**: Clicking on an action card to manually select files.
- **Feedback**:
  - Hover state highlights drop zone.
  - Progress bar animates during operations.
  - Logs automatically open when tasks start.
- **Completion state**: Success or error messages appear above logs.

## Visual Design Elements & Color Scheme
- **Background**: Neutral dark mode by default, soft gradient (dark gray/black).
- **Accent colors**:
  - Blue for *Create Package*
  - Green for *Extract Package*
- **Cards**: Rounded corners (2xl), subtle shadow for depth.
- **Icons**: Clear, modern line icons (upload, unzip, file).
- **Logs panel**: Black background with syntax-highlight style colors (green = success, yellow = warning, red = error).

## Mobile, Web App, Desktop Considerations
- **Desktop only**: Optimized for Windows desktop via Tauri.
- **Responsive behavior**: Window resizes gracefully, maintaining central drop zone and stacked layout.
- **No mobile/web version**: Design strictly focused on desktop use.

## Typography
- **Primary font**: Sans-serif (e.g., Inter or Segoe UI for Windows familiarity).
- **Weights**: Medium for labels, Bold for headings.
- **Sizes**:
  - App name: xl
  - Card labels: lg
  - Logs: sm monospace for readability

## Accessibility
- **High contrast** between text and background for readability.
- **Keyboard navigation**: Full support for tabbing between drop zone, cards, and logs.
- **Screen reader support**: Drop zone and cards labeled with ARIA roles.
- **Color-blind friendly**: Status colors supplemented with icons and text labels.
