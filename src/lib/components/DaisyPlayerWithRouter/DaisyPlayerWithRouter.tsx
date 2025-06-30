import { forwardRef } from 'react';
import { useParams } from 'react-router-dom';
import DaisyPlayer, { DaisyPlayerRef } from '../DaisyPlayer/DaisyPlayer';

export interface ComponentProps {
  /** Base URL for the DAISY book files */
  dirUrl: string;
  /** Application URL for sharing links (used for bookmark generation) */
  appUrl: string;
  /** URL Path to be appended to appUrl (used for final bookmark url) */
  pathPrefix?: string;
  /** URL parameter name to use for the bookmark (default: "bookmark") */
  bookmarkParam?: string;
  /** Language code (2 letters) for UI translations (default: "en") */
  language?: string;
  /** Custom class name for the container */
  className?: string;
  /** Callback for time updates */
  onTimeUpdate?: (currentTime: number, bookmark: string, isPlaying: boolean) => void;
  /** Time update interval in milliseconds (default: 1000) */
  timeUpdateInterval?: number;
  /** Callback when bookmark changes */
  onBookmarkChange?: (bookmark: string) => void;
  /** Callback for playback state changes */
  onPlaybackStateChange?: (state: {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    currentBookmark: string;
    playbackRate: number;
  }) => void;
  /** Callback when playback starts */
  onPlay?: () => void;
  /** Callback when playback pauses */
  onPause?: () => void;
  /** Callback when seeking to a new position */
  onSeek?: (bookmark: string) => void;
}

const DaisyPlayerWithRouter = forwardRef<DaisyPlayerRef, ComponentProps>((
  {
    pathPrefix,
    bookmarkParam = 'bookmark',
    language = 'en',
    className = '',
    ...forwarded
  },
  ref
) => {
  // Get the bookmark from URL parameters
  const params = useParams<Record<string, string>>();
  const urlBookmark = params[bookmarkParam];


  return (
    <DaisyPlayer
      ref={ref}
      initialBookmark={urlBookmark}
      pathPrefix={pathPrefix}
      language={language}
      className={className}
      {...forwarded}
    />
  );
});

DaisyPlayerWithRouter.displayName = 'DaisyPlayerWithRouter';

export default DaisyPlayerWithRouter;
