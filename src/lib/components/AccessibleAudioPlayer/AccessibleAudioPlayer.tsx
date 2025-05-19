import React, { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaPlus, FaMinus } from 'react-icons/fa';
import { TbReload } from 'react-icons/tb';
import { createTranslator } from '../../utils/i18n';
import "./index.scss";

interface ComponentProps {
  title: string;
  audioRef: React.MutableRefObject<HTMLAudioElement>;
  playing: boolean;
  moveHeadAcrossBy: (by: number) => void;
  moveToPrevNextSection: (prevNext: "prev" | "next", startAt?: number) => void;
  currentTime: number;
  setPlaybackRate: (rate: number) => void;
  playbackRate: number;
  togglePlayPause: () => void;
  isDisplayed?: boolean;
  language?: string;
}

const AccessibleAudioPlayer: React.FC<ComponentProps> = ({
  audioRef,
  title,
  playing,
  moveHeadAcrossBy,
  moveToPrevNextSection,
  currentTime,
  togglePlayPause,
  playbackRate,
  setPlaybackRate,
  isDisplayed = true,
  language = 'en'
}) => {
  const t = createTranslator(language);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress((currentTime / audio.duration) * 100 || 0);
  }, [currentTime, audioRef]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isDisplayed) return;
    switch (event.key) {
      case 'k':
      case ' ':
        event.preventDefault(); // Prevent the default action to avoid scrolling on space press
        togglePlayPause();
        break;
      case 'j':
      case 'ArrowLeft':
        event.preventDefault();
        moveHeadAcrossBy(-10);
        break;
      case 'l':
      case 'ArrowRight':
        event.preventDefault();
        moveHeadAcrossBy(10);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setPlaybackRate(playbackRate + 0.1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setPlaybackRate(playbackRate - 0.1);
        break;
    }
  }, [isDisplayed, setPlaybackRate, moveHeadAcrossBy, togglePlayPause]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isDisplayed) return;
    const els = document.getElementsByClassName("AudioPlayer__Control--play-pause");
    const button = els[0] as HTMLButtonElement;
    if (button) button.focus();
  }, [isDisplayed]);

  return (
    <div className="AudioPlayer" role="region" aria-label={t('audioPlayer')}>
      <audio ref={audioRef} aria-label={title} preload="metadata" className="AudioPlayer__Audio" />
      <h2 className="AudioPlayer__Title">{title}</h2>
      <div className="AudioPlayer__Controls">
        <div className="AudioPlayer__ControlsRow">
          <button
            className="AudioPlayer__Control"
            onClick={() => moveToPrevNextSection("prev")}
            aria-label={t('previousSection')}
          >
            <FaStepBackward />
          </button>
          <button
            className="AudioPlayer__Control"
            onClick={() => moveToPrevNextSection("next")}
            aria-label={t('nextSection')}
          >
            <FaStepForward />
          </button>
        </div>
        <div className="AudioPlayer__ControlsRow">
          <button 
            className={`AudioPlayer__Control AudioPlayer__Control--play-pause AudioPlayer__Control--${playing ? 'playing' : 'paused'}`}
            onClick={togglePlayPause}
            aria-label={playing ? t('pause') : t('play')}
          >
            {playing ? <FaPause/> : <FaPlay /> }
          </button>
        </div>
        <div className="AudioPlayer__ControlsRow">
          <button
            className="AudioPlayer__Control AudioPlayer__Control--mirrored"
            onClick={() => moveHeadAcrossBy(-30)}
            aria-label={t('backward30Seconds')}
          >
            <TbReload />
          </button>
          <button
            className="AudioPlayer__Control"
            onClick={() => moveHeadAcrossBy(30)}
            aria-label={t('forward30Seconds')}
          >
            <TbReload />
          </button>
        </div>
        <div
          className="AudioPlayer__ControlsRow AudioPlayer__ControlsRow--speed"
          role="group"
          aria-label={t('speed')}
        >
          <button
            className="AudioPlayer__Control"
            onClick={() => setPlaybackRate(playbackRate - 0.25)}
            aria-label={`${t('decreasePlaybackRate')} ${playbackRate - 0.25}`}
          >
            <FaMinus />
          </button>
          <div className="AudioPlayer__SpeedText" aria-live="polite">
            <span>{t('speed')}</span>
            <strong>{playbackRate} x</strong>
          </div>
          <button
            className="AudioPlayer__Control"
            onClick={() => setPlaybackRate(playbackRate + 0.25)}
            aria-label={`${t('increasePlaybackRate')} ${playbackRate + 0.25}`}
          >
            <FaPlus />
          </button>
        </div>
      </div>
      <div className="AudioPlayer__ProgressContainer">
        <progress
          className="AudioPlayer__Progress"
          value={progress}
          max="100"
          aria-hidden="true"
        >
          {progress}%
        </progress>
        <span className="AudioPlayer__Time" aria-live="off">
          {Math.trunc(currentTime)} / {Math.round(audioRef.current.duration)} s
        </span>
      </div>
    </div>
  );
};

export default AccessibleAudioPlayer;
