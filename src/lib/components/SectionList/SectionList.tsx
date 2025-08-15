import React, { useEffect, useState, useRef } from 'react';
import { FlatSection, Section, SectionsHolder, flatFindBySmil } from '../../utils/sections';
import { createTranslator } from '../../utils/i18n';
import { CustomLabels } from '../DaisyPlayer/DaisyPlayer';
import "./index.scss";

interface SectionListProps {
  sectionsHolder: SectionsHolder;
  onSectionClick: (section: FlatSection | null, playImmediately: boolean, currentTime: number) => void;
  currentSection: FlatSection | null;
  isDisplayed?: boolean;
  toggleDisplay: () => void;
  language?: string;
  listStyle?: 'disc' | 'none';
  labels?: CustomLabels;
}

const SectionList: React.FC<SectionListProps> = ({
  sectionsHolder,
  onSectionClick,
  currentSection,
  toggleDisplay,
  isDisplayed = false,
  language = 'en',
  listStyle = 'disc',
  labels
}) => {
  const t = createTranslator(language);
  const [focusedSection, setFocusedSection] = useState<FlatSection | null>(null);
  const paramSmilFile = currentSection?.smilFile || null;
  const tocHeadingRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDisplayed || focusedSection === currentSection) return;
    setFocusedSection(currentSection);
    const els = document.getElementsByClassName("Sections__Button--selected");
    const button = els[0] as HTMLButtonElement;
    if (button) {
      button.focus();
      setTimeout(() => button.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [currentSection, isDisplayed]);

  // Focus on TOC heading when opened
  useEffect(() => {
    if (isDisplayed && tocHeadingRef.current) {
      setTimeout(() => {
        tocHeadingRef.current?.focus();
      }, 100);
    }
  }, [isDisplayed]);

  const renderSections = (
    sections: Section[],
    level: number,
    display: boolean = false
  ) => (
    <ul className={`Sections__List Sections__List--level${level} Sections__List--${listStyle}`}
      aria-hidden={!display}
      hidden={!display}
    >{
      sections.map((section) => (
        <li key={section.smilFile}>
          <button
            className={
              `Sections__Button${
                paramSmilFile === section.smilFile
                  ? ' Sections__Button--selected'
                  : ''
              }`
            }
            onClick={() => onSectionClick(
              flatFindBySmil(sectionsHolder.flat, section.smilFile),
              true,
              0
            )}
          >
            {section.title}
          </button>
          {(section.children && (
            renderSections(section.children, level + 1, display)
          )) || null}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={containerRef}
      className={`Sections__Container Sections__Container--${isDisplayed ? "visible" : "hidden"}`}
      aria-hidden={!isDisplayed}
      hidden={!isDisplayed}
      role="dialog"
      aria-labelledby="toc-heading"
    >
      <div
        className="Sections__BackArrow"
        onClick={toggleDisplay}
        role="button"
        aria-label={labels?.tocCloseButton || t('closeSectionsView')}
        tabIndex={isDisplayed ? 0 : undefined}
      >
        ←
      </div>
      <h2 id="toc-heading" ref={tocHeadingRef} tabIndex={-1}>{labels?.tableOfContents || t('tableOfContents')}</h2>
      {renderSections(sectionsHolder.tree, 0, isDisplayed)}
    </div>
  );
};

export default SectionList;
