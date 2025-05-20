import { useRef, useState, useEffect, useCallback } from "react";
import { FlatSection, SectionsHolder, flatGetNext, flatGetPrev, getFirst, getFirstSmil } from "../utils/sections";

const useSectionsAudioPlayer = (
  dirUrl: string,
  sectionsHolder: SectionsHolder,
  initialBookmark?: string
) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [currentSection, setCurrentSection] = useState<FlatSection | null>(null);
  const [requestedCurrentTime, setRequestedCurrentTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0); // Progress of the audio
  const lastKnownSmil = currentSection?.smilFile || getFirstSmil(sectionsHolder);
  const [loading, setLoading] = useState<boolean>(false);
  const audio = audioRef.current;

  const setAudioFor = (section: FlatSection | null, playImmediately: boolean, jumpToSecond: number = 0) => {
    if (!section) return;
    const setReactStateForWhenAudioWillBeLoaded = () => {
      setRequestedCurrentTime(jumpToSecond)
      setCurrentSection(section);
      if (playImmediately && !isPlaying) {
        setIsPlaying(true);
      }
    }
    if (section === currentSection) {
      setReactStateForWhenAudioWillBeLoaded();
      return;
    }

    setLoading(true);

    fetch(`${dirUrl}/${section.smilFile}`)
      .then(response => response.text())
      .then(smil => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(smil, 'application/xml');
        const audioSrc = doc.querySelector('audio')?.getAttribute('src');

        if (!audioRef.current || !audioSrc) return;
        const audio = audioRef.current;
        audio.src = `${dirUrl}/${audioSrc}`;
        setReactStateForWhenAudioWillBeLoaded();
      })
      .catch(error => {
        console.error('Failed to fetch SMIL file:', error)
        setLoading(false);
      });
  };

  useEffect(() => { // initialize
    const first = getFirst(sectionsHolder);
    if (!first) return;
    if (initialBookmark) {
      const [smilFile, pos] = initialBookmark.split(":");
      const section = sectionsHolder.flat.find(s => s.smilFile === smilFile);
      if (section) {
        setAudioFor(section, false, parseFloat(pos));
        return;
      }
    }
    setAudioFor(first, false, 0);
  }, [sectionsHolder, initialBookmark]);

  const moveToPrevNextSection = useCallback((prevNext: "prev" | "next", startAt: number = 0) => {
    if (currentSection === null) return;
    const nextSection = prevNext === "prev"
      ? flatGetPrev(sectionsHolder.flat, currentSection)
      : flatGetNext(sectionsHolder.flat, currentSection);
    if (nextSection) {
      setAudioFor(nextSection, isPlaying, startAt);
    } else {
      prevNext === "prev"
        ? setAudioFor(currentSection, isPlaying, 0)
        // we don't know duration yet so keep startAt
        // it will get adjusted after loading the audio
        : setAudioFor(currentSection, isPlaying, startAt);
    }
  }, [flatGetNext, flatGetPrev, setAudioFor, sectionsHolder, currentSection, isPlaying]);

  const moveHeadAcrossBy = useCallback((by: number) => {
    if (currentSection === null || !audio) return;
    const to = audio.currentTime + by;
    const toIfCurrent = to;
    const toIfPrev = to;
    const toIfNext = to - audio.duration;
    const isNext = toIfCurrent > audio.duration;
    const isPrev = toIfCurrent < 0;
    if (isNext) {
      moveToPrevNextSection("next", toIfNext);
      return;
    } else if (isPrev) {
      moveToPrevNextSection("prev", toIfPrev);
      return;
    }
    setRequestedCurrentTime(toIfCurrent);
  }, [currentSection, audio]);

  const adjustPlaybackRate = useCallback(() => {
    if (!audio) return;
    if (playbackRate === null) {
      setPlaybackRate(audio.playbackRate);
      return;
    }
    if (audio.playbackRate !== playbackRate) {
      audio.playbackRate = playbackRate;
    }
  }, [audio, playbackRate]);

  const onLoadedMetadataSetHead = useCallback(() => {
    if (requestedCurrentTime === null) return;
    if (currentSection === null || !audio) return;
    if (loading) {
      setLoading(false);
    }
    if (requestedCurrentTime > audio.duration) {
      if (null === flatGetNext(sectionsHolder.flat, currentSection)) { // no next section (last section)
        audio.currentTime = audio.duration;
        return;
      }
      moveToPrevNextSection("next", requestedCurrentTime - audio.duration);
      return;
    } else if (requestedCurrentTime < 0) {
      if ((audio.duration + requestedCurrentTime) < 0) {
        if (null === flatGetPrev(sectionsHolder.flat, currentSection)) { // no prev section (first section)
          audio.currentTime = 0;
          return;
        }
        moveToPrevNextSection("prev", audio.duration + requestedCurrentTime);
        return;
      } else {
        audio.currentTime = audio.duration + requestedCurrentTime
        setRequestedCurrentTime(null);
        return;
      }
    }
    audio.currentTime = requestedCurrentTime;
    adjustPlaybackRate();
    setRequestedCurrentTime(null);
  }, [audio, requestedCurrentTime, setLoading]);

  // when section remains the same, loadedmetadata won't be triggered
  // again because it was already loaded before, so we handle it here
  useEffect(() => {
    if (requestedCurrentTime === null || loading) return;
    onLoadedMetadataSetHead();
  }, [requestedCurrentTime, loading]);

  useEffect(() => {
    adjustPlaybackRate();
  }, [audio, playbackRate]);

  useEffect(() => { // play if supposed to be playing
    if (currentSection === null || !audio) return;
    if (isPlaying && audio.paused) audio.play();
    if (!isPlaying && !audio.paused) audio.pause();
  }, [audio, currentSection, isPlaying]);

  useEffect(() => {
    if (currentSection === null || !audioRef.current) return;
    const audio = audioRef.current;
    const moveToNextAtZero = () => moveToPrevNextSection("next", 0);
    const updateProgress = () => setCurrentTime(audio.currentTime || 0);
    audio.addEventListener("loadedmetadata", onLoadedMetadataSetHead);
    audio.addEventListener('ended', moveToNextAtZero);
    audio.addEventListener('timeupdate', updateProgress);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadataSetHead);
      audio.removeEventListener('ended', moveToNextAtZero);
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, [currentSection, sectionsHolder]);

  return {
    audioRef,
    setAudioFor,
    currentSection,
    lastKnownBookmark: `${lastKnownSmil}:${Math.floor(currentTime)}`,
    isPlaying,
    togglePlayPause: () => setIsPlaying(!isPlaying),
    currentTime,
    moveHeadAcrossBy,
    moveToPrevNextSection,
    playbackRate: playbackRate || 1,
    setPlaybackRate,
  };
};

export default useSectionsAudioPlayer;
