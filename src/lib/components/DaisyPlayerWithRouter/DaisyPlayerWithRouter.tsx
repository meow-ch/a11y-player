import React from 'react';
import { useParams } from 'react-router-dom';
import DaisyPlayer from '../DaisyPlayer/DaisyPlayer';

export interface ComponentProps {
  /** Base URL for the DAISY book files */
  dirUrl: string;
  /** Application URL for sharing links (used for bookmark generation) */
  appUrl: string;
  /** URL parameter name to use for the bookmark (default: "bookmark") */
  bookmarkParam?: string;
  /** Language code (2 letters) for UI translations (default: "en") */
  language?: string;
  /** Custom class name for the container */
  className?: string;
}

const DaisyPlayerWithRouter: React.FC<ComponentProps> = ({
  bookmarkParam = 'bookmark',
  language = 'en',
  className = '',
  ...forwarded
}) => {
  // Get the bookmark from URL parameters
  const params = useParams<Record<string, string>>();
  const urlBookmark = params[bookmarkParam];

  return (
    <DaisyPlayer
      initialBookmark={urlBookmark}
      language={language}
      className={className}
      {...forwarded}
    />
  );
};

export default DaisyPlayerWithRouter;
