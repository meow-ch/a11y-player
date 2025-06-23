import { FC, useEffect, useState } from 'react';
import { FaShareAlt } from 'react-icons/fa';
import { createTranslator } from '../../utils/i18n';
import "./index.scss";

interface ShareLinkButtonProps {
  appUrl: string;
  /** URL Path to be appended to appUrl (used for final bookmark url) */
  pathPrefix?: string;
  path: string | null;
  language?: string;
}

const ShareLinkButton: FC<ShareLinkButtonProps> = ({
  appUrl,
  pathPrefix,
  path,
  language = 'en'
}) => {
  const t = createTranslator(language);
  const [copySuccess, setCopySuccess] = useState<boolean | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  console.log(appUrl, pathPrefix, path);
  const handleClick = async () => {
    try {
      const urlToCopy = `${appUrl}/${pathPrefix}/${path}`;
      await navigator.clipboard.writeText(urlToCopy);
      setCopySuccess(true);
      setCopiedPath(path);

      // Reset after 3 seconds
      setTimeout(() => {
        setCopySuccess(null);
      }, 3000);
    } catch (error) {
      setCopySuccess(false);
      console.error('Failed to copy text: ', error);

      // Reset after 3 seconds
      setTimeout(() => {
        setCopySuccess(null);
      }, 3000);
    }
  };

  useEffect(() => {
    if (copiedPath !== null && copiedPath !== path) {
      setCopiedPath(null);
      setCopySuccess(null);
    }
  }, [path]);

  const buttonClassName = `ShareButton ${
    copySuccess === true
      ? 'ShareButton--success'
      : copySuccess === false
        ? 'ShareButton--error'
        : ''
  }`;

  return (
    <button
      onClick={handleClick}
      disabled={path === null}
      className={buttonClassName}
      aria-label={t('shareLink')}
      title={t('shareLink')}
    >
      <span>{
        copySuccess === true
          ? t('linkCopied')
          : copySuccess === false
            ? t('failedToCopy')
            : <FaShareAlt />
        }
      </span>
    </button>
  );
};

export default ShareLinkButton;
