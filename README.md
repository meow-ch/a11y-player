# DAISY Player React

A modern, accessible audio player for DAISY (Digital Accessible Information System) format books, built with React and TypeScript.

[![npm version](https://img.shields.io/npm/v/a11y-player.svg)](https://www.npmjs.com/package/a11y-player)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install a11y-player
# or
yarn add a11y-player
```

## Quick Start

```jsx
import { DaisyPlayer } from 'a11y-player';
// No need to import CSS separately - styles are included in the bundle

function App() {
  return (
    <DaisyPlayer
      dirUrl="https://example.com/daisy-books/book1"
      appUrl="https://myapp.com"
    />
  );
}
```

## Features

- **Accessible Audio Playback**: Fully keyboard-navigable player with screen reader support
- **Section Navigation**: Browse and jump to different sections of the audiobook
- **Playback Controls**: Play/pause, skip forward/backward, adjust playback speed
- **Bookmark Sharing**: Generate and share links to specific positions in the audiobook
- **Responsive Design**: Works on various screen sizes and devices
- **React Router Integration**: Built-in component for URL bookmark parameters

## Components

### DaisyPlayer

The core player component.

#### Props

| Prop | Type | Description | Required |
|------|------|-------------|----------|
| `dirUrl` | string | Base URL for the DAISY book files | Yes |
| `appUrl` | string | Application URL for sharing links | Yes |
| `initialBookmark` | string | Initial bookmark position (format: "smilFile:timeInSeconds") | No |
| `onBookmarkChange` | function | Callback when bookmark changes | No |
| `className` | string | Custom class name for the container | No |

### DaisyPlayerWithRouter

A wrapper around DaisyPlayer that automatically reads the initial bookmark from URL parameters.

#### Props

| Prop | Type | Description | Required |
|------|------|-------------|----------|
| `dirUrl` | string | Base URL for the DAISY book files | Yes |
| `appUrl` | string | Application URL for sharing links | Yes |
| `bookmarkParam` | string | URL parameter name to use for the bookmark (default: "bookmark") | No |
| `className` | string | Custom class name for the container | No |
| `onBookmarkChange` | function | Additional callback when bookmark changes | No |

## Usage Examples

### Basic Usage

```jsx
import { DaisyPlayer } from 'a11y-player';

function App() {
  return (
    <DaisyPlayer
      dirUrl="https://example.com/daisy-books/book1"
      appUrl="https://myapp.com"
    />
  );
}
```

### With React Router Integration

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DaisyPlayerWithRouter } from 'a11y-player';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/:bookmark?"
          element={
            <DaisyPlayerWithRouter
              dirUrl="https://example.com/daisy-books/book1"
              appUrl="https://myapp.com"
              bookmarkParam="bookmark"
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### With Custom Bookmark Handling

```jsx
import { useState } from 'react';
import { DaisyPlayer } from 'a11y-player';

function MyPlayer() {
  const [bookmark, setBookmark] = useState(null);

  return (
    <>
      <DaisyPlayer
        dirUrl="https://example.com/daisy-books/book1"
        appUrl="https://myapp.com"
        initialBookmark={bookmark}
        onBookmarkChange={(newBookmark) => setBookmark(newBookmark)}
      />
      <div>
        Current bookmark: {bookmark}
        <button onClick={() => localStorage.setItem('savedBookmark', bookmark)}>
          Save Position
        </button>
        <button onClick={() => setBookmark(localStorage.getItem('savedBookmark'))}>
          Restore Position
        </button>
      </div>
    </>
  );
}
```

## DAISY Format Requirements

The DAISY Player requires a backend server that hosts DAISY format books with the following specifications:

1. **Required Files**:
   - `ncc.html`: The Navigation Control Center file containing the book's structure and metadata
   - SMIL files (`.smil`): Files describing the synchronization between text and audio
   - Audio files (typically MP3): The actual audio content referenced by the SMIL files

2. **File Access**:
   The application directly accesses files using these URL patterns:
   - `${dirUrl}/ncc.html` - For book structure and metadata
   - `${dirUrl}/{smilFile}` - For specific SMIL files
   - `${dirUrl}/{audioFile}` - For audio files

3. **CORS Configuration**:
   The backend must allow cross-origin requests from the frontend application domain.

## Keyboard Shortcuts

- **Space** or **K**: Play/pause
- **J** or **Left Arrow**: Rewind 10 seconds
- **L** or **Right Arrow**: Forward 10 seconds
- **Up Arrow**: Increase playback speed
- **Down Arrow**: Decrease playback speed
- **I**: Toggle section list view
- **Escape**: Close section list view (when open)

## Accessibility

This player is designed with accessibility as a primary concern:
- Fully keyboard navigable
- ARIA attributes for screen reader compatibility
- High contrast visuals
- Keyboard shortcuts for common actions
- Focus management between different views

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Building for Production

```
npm run build
```

## License

[MIT License](LICENSE)
