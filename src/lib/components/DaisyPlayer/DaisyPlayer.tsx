import React, { useState, useEffect, useCallback, useRef } from 'react';
import useSectionsAudioPlayer from '../../hooks/useSectionsAudioPlayer';
import SectionList from '../SectionList/SectionList';
import useSectionData from '../../hooks/useSectionData';
import { FlatSection } from '../../utils/sections';
import ShareLinkButton from '../ShareLinkButton/ShareLinkButton';
import AccessibleAudioPlayer from '../AccessibleAudioPlayer/AccessibleAudioPlayer';
import { createTranslator } from '../../utils/i18n';
import "./index.scss";
import { FaList } from 'react-icons/fa';

export type ComponentProps = {
  dirUrl: string;
  appUrl: string;
  pathPrefix?: string;
  initialBookmark?: string;
  className?: string;
  language?: string;
};

const DaisyPlayer: React.FC<ComponentProps> = ({
  dirUrl,
  appUrl,
  pathPrefix,
  initialBookmark,
  className = '',
  language = 'en'
}) => {
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

  // initial bookmark handled inside useSectionsAudioPlayer

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
};

export default DaisyPlayer;
