import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaPlus, FaMinus } from 'react-icons/fa';
import { TbReload } from 'react-icons/tb';
import { createTranslator } from '../../utils/i18n';
import { CustomLabels } from '../DaisyPlayer/DaisyPlayer';
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
  labels?: CustomLabels;
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
  language = 'en',
  labels
}) => {
  const t = createTranslator(language);
  const playerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress((currentTime / audio.duration) * 100 || 0);
  }, [currentTime, audioRef]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
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
  }, [isDisplayed, setPlaybackRate, moveHeadAcrossBy, togglePlayPause, playbackRate]);


  useEffect(() => {
    if (!isDisplayed) return;
    const els = document.getElementsByClassName("AudioPlayer__Control--play-pause");
    const button = els[0] as HTMLButtonElement;
    if (button) button.focus();
  }, [isDisplayed]);

  return (
    <div
      className="AudioPlayer"
      role="region"
      aria-label={t('audioPlayer')}
      ref={playerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <audio ref={audioRef} aria-label={title} preload="metadata" className="AudioPlayer__Audio" />
      <h2 className="AudioPlayer__Title">{title}</h2>
      <div className="AudioPlayer__Controls">
        <div className="AudioPlayer__ControlColumns">
          <div className="AudioPlayer__ControlsColumn">
            <button
              className="AudioPlayer__Control"
              onClick={() => moveToPrevNextSection("prev")}
              aria-label={labels?.previousSection || t('previousSection')}
            >
              <FaStepBackward />
            </button>
            <button
              className="AudioPlayer__Control AudioPlayer__Control--mirrored"
              onClick={() => moveHeadAcrossBy(-30)}
              aria-label={labels?.backward30Seconds || t('backward30Seconds')}
            >
              <TbReload />
            </button>
          </div>
          <div className="AudioPlayer__ControlsColumn AudioPlayer__ControlsColumn--play">
            <button
              className={`AudioPlayer__Control AudioPlayer__Control--play-pause AudioPlayer__Control--${playing ? 'playing' : 'paused'}`}
              onClick={togglePlayPause}
              aria-label={playing ? (labels?.pauseButton || t('pause')) : (labels?.playButton || t('play'))}
            >
              {playing ? <FaPause/> : <FaPlay /> }
            </button>
          </div>
          <div className="AudioPlayer__ControlsColumn AudioPlayer__ControlsColumn--reverse">
            <button
              className="AudioPlayer__Control"
              onClick={() => moveHeadAcrossBy(30)}
              aria-label={labels?.forward30Seconds || t('forward30Seconds')}
            >
              <TbReload />
            </button>
            <button
              className="AudioPlayer__Control"
              onClick={() => moveToPrevNextSection("next")}
              aria-label={labels?.nextSection || t('nextSection')}
            >
              <FaStepForward />
            </button>
          </div>
        </div>
        <div
          className="AudioPlayer__ControlsRow AudioPlayer__ControlsRow--speed"
          role="group"
          aria-label={labels?.speed || t('speed')}
        >
          <button
            className="AudioPlayer__Control"
            onClick={() => setPlaybackRate(playbackRate - 0.25)}
            aria-label={`${labels?.decreasePlaybackRate || t('decreasePlaybackRate')} ${playbackRate - 0.25}`}
          >
            <FaMinus />
          </button>
          <div className="AudioPlayer__SpeedText" aria-live="polite">
            <span>{labels?.speed || t('speed')}</span>
            <strong>{playbackRate} x</strong>
          </div>
          <button
            className="AudioPlayer__Control"
            onClick={() => setPlaybackRate(playbackRate + 0.25)}
            aria-label={`${labels?.increasePlaybackRate || t('increasePlaybackRate')} ${playbackRate + 0.25}`}
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
