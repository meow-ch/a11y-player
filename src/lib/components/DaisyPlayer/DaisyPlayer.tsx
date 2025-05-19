import React, { useState, useEffect, useCallback } from 'react';
import useSectionsAudioPlayer from '../../hooks/useSectionsAudioPlayer';
import SectionList from '../SectionList/SectionList';
import useSectionData from '../../hooks/useSectionData';
import { FlatSection, flatFindBySmil } from '../../utils/sections';
import ShareLinkButton from '../ShareLinkButton/ShareLinkButton';
import AccessibleAudioPlayer from '../AccessibleAudioPlayer/AccessibleAudioPlayer';
import { createTranslator } from '../../utils/i18n';
import "./index.scss";
import { FaList } from 'react-icons/fa';

export type ComponentProps = {
  dirUrl: string;
  appUrl: string;
  initialBookmark?: string;
  className?: string;
  language?: string;
};

const DaisyPlayer: React.FC<ComponentProps> = ({
  dirUrl,
  appUrl,
  initialBookmark,
  className = '',
  language = 'en'
}) => {
  const t = createTranslator(language);
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
  } = useSectionsAudioPlayer(dirUrl, sectionsHolder);

  const [currentView, setCurrentView] = useState<'playerView' | 'sectionsView'>('playerView');
  const [wasPlayingBeforeSwitch, setWasPlayingBeforeSwitch] = useState(false);

  useEffect(() => {
    if (!sectionsHolder || sectionsHolder.flat.length <= 0) return;
    if (initialBookmark) {
      const [smilFile, position] = initialBookmark.split(':');
      const section = flatFindBySmil(sectionsHolder.flat, smilFile);
      if (section !== null) {
        setAudioFor(section, false, parseFloat(position));
      }
    }
  }, [sectionsHolder, initialBookmark, setAudioFor]);

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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
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

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className={`DaisyPlayer__Container ${className}`}>
      <div className="DaisyPlayer__OtherButtons">
        <ShareLinkButton
          dirUrl={appUrl}
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
