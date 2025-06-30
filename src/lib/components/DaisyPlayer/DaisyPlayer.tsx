import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import useSectionsAudioPlayer from '../../hooks/useSectionsAudioPlayer';
import SectionList from '../SectionList/SectionList';
import useSectionData from '../../hooks/useSectionData';
import { FlatSection } from '../../utils/sections';
import ShareLinkButton from '../ShareLinkButton/ShareLinkButton';
import AccessibleAudioPlayer from '../AccessibleAudioPlayer/AccessibleAudioPlayer';
import { createTranslator } from '../../utils/i18n';
import "./index.scss";
import { FaList } from 'react-icons/fa';

export interface DaisyPlayerRef {
  getCurrentTime(): number;
  getDuration(): number;
  isPlaying(): boolean;
  getCurrentBookmark(): string;
  getPlaybackRate(): number;
  togglePlayPause(): void;
  seek(bookmark: string): void;
}

export type ComponentProps = {
  dirUrl: string;
  appUrl: string;
  pathPrefix?: string;
  initialBookmark?: string;
  className?: string;
  language?: string;
  onTimeUpdate?: (currentTime: number, bookmark: string, isPlaying: boolean) => void;
  timeUpdateInterval?: number;
  onBookmarkChange?: (bookmark: string) => void;
  onPlaybackStateChange?: (state: {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    currentBookmark: string;
    playbackRate: number;
  }) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (bookmark: string) => void;
};

const DaisyPlayer = forwardRef<DaisyPlayerRef, ComponentProps>((
  {
    dirUrl,
    appUrl,
    pathPrefix,
    initialBookmark,
    className = '',
    language = 'en',
    onTimeUpdate,
    timeUpdateInterval = 1000,
    onBookmarkChange,
    onPlaybackStateChange,
    onPlay,
    onPause,
    onSeek
  },
  ref
) => {
  const t = createTranslator(language);
  const containerRef = useRef<HTMLDivElement>(null);
  const { sectionsHolder, bookInfo } = useSectionData(dirUrl);
  const {
    audioRef,
    setAudioFor,
    lastKnownBookmark,
    currentSection,
    isPlaying: playing,
    togglePlayPause,
    moveHeadAcrossBy,
    moveToPrevNextSection,
    playbackRate,
    setPlaybackRate,
    currentTime
  } = useSectionsAudioPlayer(dirUrl, sectionsHolder, initialBookmark);

  const [currentView, setCurrentView] = useState<'playerView' | 'sectionsView'>('playerView');
  const [wasPlayingBeforeSwitch, setWasPlayingBeforeSwitch] = useState(false);
  const [lastBookmark, setLastBookmark] = useState<string>('');
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // initial bookmark handled inside useSectionsAudioPlayer

  // Handle time update callbacks
  useEffect(() => {
    if (!onTimeUpdate) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(currentTime, lastKnownBookmark, playing);
    };

    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }

    timeUpdateIntervalRef.current = setInterval(handleTimeUpdate, timeUpdateInterval);

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [onTimeUpdate, currentTime, lastKnownBookmark, playing, timeUpdateInterval]);

  // Handle bookmark change callbacks
  useEffect(() => {
    if (lastKnownBookmark !== lastBookmark) {
      setLastBookmark(lastKnownBookmark);
      if (onBookmarkChange && lastKnownBookmark) {
        onBookmarkChange(lastKnownBookmark);
      }
    }
  }, [lastKnownBookmark, lastBookmark, onBookmarkChange]);

  // Handle playback state change callbacks
  useEffect(() => {
    if (!onPlaybackStateChange || !audioRef.current || !currentSection) return;

    const audio = audioRef.current;
    onPlaybackStateChange({
      currentTime,
      duration: audio.duration || 0,
      isPlaying: playing,
      currentBookmark: lastKnownBookmark,
      playbackRate
    });
  }, [onPlaybackStateChange, currentTime, playing, lastKnownBookmark, playbackRate, currentSection]);

  // Handle play/pause callbacks
  useEffect(() => {
    if (playing && onPlay) {
      onPlay();
    } else if (!playing && onPause) {
      onPause();
    }
  }, [playing, onPlay, onPause]);

  // Implement ref interface
  useImperativeHandle(ref, () => ({
    getCurrentTime: () => currentTime,
    getDuration: () => audioRef.current?.duration || 0,
    isPlaying: () => playing,
    getCurrentBookmark: () => lastKnownBookmark,
    getPlaybackRate: () => playbackRate,
    togglePlayPause: () => togglePlayPause(),
    seek: (bookmark: string) => {
      const [smilFile, pos] = bookmark.split(':');
      const section = sectionsHolder.flat.find(s => s.smilFile === smilFile);
      if (section) {
        setAudioFor(section, playing, parseFloat(pos) || 0);
        if (onSeek) {
          onSeek(bookmark);
        }
      }
    }
  }), [currentTime, playing, lastKnownBookmark, playbackRate, togglePlayPause, sectionsHolder, setAudioFor, onSeek]);

  useEffect(() => {
    if (currentView === "sectionsView") {
      if (playing) {
        setWasPlayingBeforeSwitch(true);
        togglePlayPause();
      }
    } else if (currentView === "playerView" && wasPlayingBeforeSwitch && !playing) {
      togglePlayPause();
      setWasPlayingBeforeSwitch(false);
    }
  }, [currentView, playing, togglePlayPause, wasPlayingBeforeSwitch]);

  const handleSectionClick = (section: FlatSection | null, shouldAutoPlay: boolean, currentTime: number) => {
    setAudioFor(section, shouldAutoPlay, currentTime);
    setCurrentView('playerView');
    if (onSeek && section) {
      const bookmark = `${section.smilFile}:${Math.floor(currentTime)}`;
      onSeek(bookmark);
    }
  };

  const toggleView = () => {
    setCurrentView(prevView => prevView === "sectionsView" ? "playerView" : "sectionsView");
  };

  const playerKeyBindingsPrevented = currentView !== "playerView";

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'i':
        event.preventDefault();
        toggleView();
        break;
    }
    if (!playerKeyBindingsPrevented) return;
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        toggleView();
        break;
    }
  }, [toggleView, playerKeyBindingsPrevented]);

  return (
    <div
      className={`DaisyPlayer__Container ${className}`}
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="DaisyPlayer__OtherButtons">
        <ShareLinkButton
          appUrl={appUrl}
          pathPrefix={pathPrefix}
          path={lastKnownBookmark}
          language={language}
        />
        <button
          className="DaisyPlayer__ToggleSectionsViewButton"
          onClick={toggleView}
          aria-label={t('toggleSectionsView')}
          title={t('toggleSectionsView')}
        >
          <FaList />
        </button>
      </div>
      <h1>{bookInfo?.title || t('defaultBookTitle')}</h1>
      <h3>{bookInfo?.author || t('unknownAuthor')}</h3>
      <div className="DaisyPlayer__PlayerContainer">
        <AccessibleAudioPlayer
          setPlaybackRate={setPlaybackRate}
          playbackRate={playbackRate}
          moveToPrevNextSection={moveToPrevNextSection}
          audioRef={audioRef}
          title={currentSection?.title || t('noTitle')}
          playing={playing}
          moveHeadAcrossBy={moveHeadAcrossBy}
          currentTime={currentTime}
          togglePlayPause={togglePlayPause}
          isDisplayed={!playerKeyBindingsPrevented}
          language={language}
        />
      </div>
      <SectionList
        isDisplayed={currentView === 'sectionsView'}
        toggleDisplay={toggleView}
        sectionsHolder={sectionsHolder}
        onSectionClick={handleSectionClick}
        currentSection={currentSection}
        language={language}
      />
    </div>
  );
});

DaisyPlayer.displayName = 'DaisyPlayer';

export default DaisyPlayer;
