import { FC, useEffect, useState } from 'react';
import { FaShareAlt } from 'react-icons/fa';
import "./index.scss";

interface ShareLinkButtonProps {
  dirUrl: string;
  path: string | null;
}

const ShareLinkButton: FC<ShareLinkButtonProps> = ({ dirUrl, path }) => {
  const [copySuccess, setCopySuccess] = useState<boolean | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      const urlToCopy = `${dirUrl}/${path}`;
      await navigator.clipboard.writeText(urlToCopy);
      setCopySuccess(true);
      setCopiedPath(path);
    } catch (error) {
      setCopySuccess(false);
      console.error('Failed to copy text: ', error);
    }
  };

  useEffect(() => {
    if (copiedPath !== null && copiedPath !== path) {
      setCopiedPath(null);
      setCopySuccess(null);
    }
  }, [path]);

  return (
    <button
      onClick={handleClick}
      disabled={path === null}
      className="ShareButton"
    >
      <span>{
        copySuccess === true
          ? 'Link copied!'
          : copySuccess === false
            ? 'Failed to copy the link.'
            : <FaShareAlt />
        }
      </span>
    </button>
  );
};

export default ShareLinkButton;
