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
- **Real-time Callbacks**: Time updates, bookmark changes, and playback state monitoring
- **Programmatic Control**: Full API access via ref interface
- **Event Handling**: Play, pause, and seek event callbacks
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
| `className` | string | Custom class name for the container | No |
| `language` | string | UI language code (default: 'en') | No |
| `pathPrefix` | string | Path prefix for bookmark URLs | No |

#### Callback Props

| Prop | Type | Description | Required |
|------|------|-------------|----------|
| `onTimeUpdate` | `(currentTime: number, bookmark: string, isPlaying: boolean) => void` | Called at regular intervals during playback | No |
| `timeUpdateInterval` | number | Time update interval in milliseconds (default: 1000) | No |
| `onBookmarkChange` | `(bookmark: string) => void` | Called when bookmark position changes | No |
| `onPlaybackStateChange` | `(state: PlaybackState) => void` | Called when playback state changes | No |
| `onPlay` | `() => void` | Called when playback starts | No |
| `onPause` | `() => void` | Called when playback pauses | No |
| `onSeek` | `(bookmark: string) => void` | Called when seeking to a new position | No |

#### PlaybackState Interface

```typescript
interface PlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  currentBookmark: string;
  playbackRate: number;
}
```

### DaisyPlayerWithRouter

A wrapper around DaisyPlayer that automatically reads the initial bookmark from URL parameters.

#### Props

Inherits all props from `DaisyPlayer` plus:

| Prop | Type | Description | Required |
|------|------|-------------|----------|
| `bookmarkParam` | string | URL parameter name to use for the bookmark (default: "bookmark") | No |

### DaisyPlayerRef Interface

For programmatic control, use a ref to access these methods:

```typescript
interface DaisyPlayerRef {
  getCurrentTime(): number;
  getDuration(): number;
  isPlaying(): boolean;
  getCurrentBookmark(): string;
  getPlaybackRate(): number;
  togglePlayPause(): void;
  seek(bookmark: string): void;
}
```

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

### With Time Updates and Auto-Save

```jsx
import { useState, useCallback } from 'react';
import { DaisyPlayer } from 'a11y-player';

function AutoSavePlayer() {
  const [lastSaved, setLastSaved] = useState(null);

  const handleTimeUpdate = useCallback((currentTime, bookmark, isPlaying) => {
    // Auto-save every 30 seconds during playback
    if (isPlaying && currentTime % 30 === 0) {
      localStorage.setItem('autoSaveBookmark', bookmark);
      setLastSaved(new Date().toLocaleTimeString());
    }
  }, []);

  return (
    <>
      <DaisyPlayer
        dirUrl="https://example.com/daisy-books/book1"
        appUrl="https://myapp.com"
        onTimeUpdate={handleTimeUpdate}
        timeUpdateInterval={1000} // Check every second
        onPlaybackStateChange={(state) => {
          console.log('Playback state:', state);
        }}
      />
      {lastSaved && <p>Last auto-saved: {lastSaved}</p>}
    </>
  );
}
```

### With Programmatic Control

```jsx
import { useRef } from 'react';
import { DaisyPlayer, DaisyPlayerRef } from 'a11y-player';

function ControlledPlayer() {
  const playerRef = useRef<DaisyPlayerRef>(null);

  const handleJumpToChapter = (chapterBookmark) => {
    playerRef.current?.seek(chapterBookmark);
  };

  const handleTogglePlayback = () => {
    playerRef.current?.togglePlayPause();
  };

  const getCurrentInfo = () => {
    const currentTime = playerRef.current?.getCurrentTime();
    const bookmark = playerRef.current?.getCurrentBookmark();
    console.log(`Current time: ${currentTime}, Bookmark: ${bookmark}`);
  };

  return (
    <>
      <DaisyPlayer
        ref={playerRef}
        dirUrl="https://example.com/daisy-books/book1"
        appUrl="https://myapp.com"
      />
      <div>
        <button onClick={handleTogglePlayback}>Toggle Play/Pause</button>
        <button onClick={getCurrentInfo}>Get Current Info</button>
        <button onClick={() => handleJumpToChapter('chapter1.smil:0')}>Jump to Chapter 1</button>
      </div>
    </>
  );
}
```

### With Event Callbacks

```jsx
import { DaisyPlayer } from 'a11y-player';

function EventAwarePlayer() {
  return (
    <DaisyPlayer
      dirUrl="https://example.com/daisy-books/book1"
      appUrl="https://myapp.com"
      onPlay={() => console.log('Playback started')}
      onPause={() => console.log('Playback paused')}
      onSeek={(bookmark) => console.log('Seeked to:', bookmark)}
      onBookmarkChange={(bookmark) => {
        // Send to analytics or save to database
        fetch('/api/progress', {
          method: 'POST',
          body: JSON.stringify({ bookmark }),
          headers: { 'Content-Type': 'application/json' }
        });
      }}
    />
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

Keyboard shortcuts are only active when the player container (or any of its
controls) has keyboard focus. Use the **Tab** key or click on the player to
focus it before using these shortcuts.

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

## API Reference

### Types

```typescript
// Main component props
export interface DaisyPlayerProps {
  dirUrl: string;
  appUrl: string;
  pathPrefix?: string;
  initialBookmark?: string;
  className?: string;
  language?: string;
  onTimeUpdate?: (currentTime: number, bookmark: string, isPlaying: boolean) => void;
  timeUpdateInterval?: number;
  onBookmarkChange?: (bookmark: string) => void;
  onPlaybackStateChange?: (state: PlaybackState) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (bookmark: string) => void;
}

// Router component props
export interface DaisyPlayerWithRouterProps extends DaisyPlayerProps {
  bookmarkParam?: string;
}

// Ref interface for programmatic control
export interface DaisyPlayerRef {
  getCurrentTime(): number;
  getDuration(): number;
  isPlaying(): boolean;
  getCurrentBookmark(): string;
  getPlaybackRate(): number;
  togglePlayPause(): void;
  seek(bookmark: string): void;
}

// Playback state structure
interface PlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  currentBookmark: string; // Format: "smilFile:timeInSeconds"
  playbackRate: number;
}
```

## Changelog

### v0.2.0
- Added `onTimeUpdate` callback with configurable interval
- Added `onPlaybackStateChange` callback for comprehensive state monitoring
- Added `DaisyPlayerRef` interface for programmatic control
- Added individual event callbacks: `onPlay`, `onPause`, `onSeek`
- Enhanced `onBookmarkChange` callback (now properly typed)
- Added `ref` support to both `DaisyPlayer` and `DaisyPlayerWithRouter`
- Improved TypeScript definitions and exports

## License

[MIT License](LICENSE)
