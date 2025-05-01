import React, { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaPlus, FaMinus } from 'react-icons/fa';
import "./index.scss";
import { TbReload } from 'react-icons/tb';

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
  isDisplayed = true
}) => {
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
    <div className="AudioPlayer" role="region" aria-label="Audio Player">
      <audio ref={audioRef} aria-label={title} preload="metadata" className="AudioPlayer__Audio" />
      <h2 className="AudioPlayer__Title">{title}</h2>
      <div className="AudioPlayer__Controls">
        <div className="AudioPlayer__ControlsRow">
          <button
            className="AudioPlayer__Control"
            onClick={() => moveToPrevNextSection("prev")}
            aria-label="Previous Section"
          >
            <FaStepBackward />
          </button>
          <button
            className="AudioPlayer__Control"
            onClick={() => moveToPrevNextSection("next")}
            aria-label="Next Section"
          >
            <FaStepForward />
          </button>
        </div>
        <div className="AudioPlayer__ControlsRow">
          <button className={`AudioPlayer__Control AudioPlayer__Control--play-pause AudioPlayer__Control--${playing ? 'playing' : 'paused'}`}
            onClick={togglePlayPause}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <FaPause/> : <FaPlay /> }
          </button>
        </div>
        <div className="AudioPlayer__ControlsRow">
          <button
            className="AudioPlayer__Control AudioPlayer__Control--mirrored"
            onClick={() => moveHeadAcrossBy(-30)}
            aria-label="Backward 30 Seconds"
          >
            <TbReload />
          </button>
          <button
            className="AudioPlayer__Control"
            onClick={() => moveHeadAcrossBy(30)}
            aria-label="Forward 30 Seconds"
          >
            <TbReload />
          </button>
        </div>
        <div className="AudioPlayer__ControlsRow AudioPlayer__ControlsRow--speed"
          role="slider"
          aria-valuemin={0.5}
          aria-valuemax={3}
          aria-valuenow={playbackRate}
          aria-valuetext={`Playback speed ${playbackRate} times`}
        >
          <button
            className="AudioPlayer__Control"
            onClick={() => setPlaybackRate(playbackRate - 0.25)}
            aria-label={`Decrease playback rate to ${playbackRate - 0.25} times`}
          >
            <FaMinus />
          </button>
          <div className="AudioPlayer__SpeedText">
            <span>Speed</span>
            <strong>{playbackRate} x</strong>
          </div>
          <button
            className="AudioPlayer__Control"
            onClick={() => setPlaybackRate(playbackRate + 0.25)}
            aria-label={`Increase playback rate to ${playbackRate + 0.25} times`}
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
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
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
