import React, { useEffect, useState } from 'react';
import { FlatSection, Section, SectionsHolder, flatFindBySmil } from '../../utils/sections';
import { createTranslator } from '../../utils/i18n';
import "./index.scss";

interface SectionListProps {
  sectionsHolder: SectionsHolder;
  onSectionClick: (section: FlatSection | null, playImmediately: boolean, currentTime: number) => void;
  currentSection: FlatSection | null;
  isDisplayed?: boolean;
  toggleDisplay: () => void;
  language?: string;
}

const SectionList: React.FC<SectionListProps> = ({
  sectionsHolder,
  onSectionClick,
  currentSection,
  toggleDisplay,
  isDisplayed = false,
  language = 'en'
}) => {
  const t = createTranslator(language);
  const [focusedSection, setFocusedSection] = useState<FlatSection | null>(null);
  const paramSmilFile = currentSection?.smilFile || null;

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

  const renderSections = (
    sections: Section[],
    level: number,
  ) => (
    <ul className={`Sections__List Sections__List--level${level}`}>{
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
            renderSections(section.children, level + 1)
          )) || null}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`Sections__Container Sections__Container--${isDisplayed ? "visible" : "hidden"}`}>
      <div
        className="Sections__BackArrow"
        onClick={toggleDisplay}
        role="button"
        aria-label="Close sections view"
        tabIndex={isDisplayed ? 0 : -1}
      >
        ←
      </div>
      <h2>{t('tableOfContents')}</h2>
      {renderSections(sectionsHolder.tree, 0)}
    </div>
  );
};

export default SectionList;
