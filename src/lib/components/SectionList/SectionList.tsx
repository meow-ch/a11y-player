import React, { useEffect, useState } from 'react';
import "./index.scss";
import { FlatSection, Section, SectionsHolder, flatFindBySmil } from '../../utils/sections';

interface SectionListProps {
  sectionsHolder: SectionsHolder;
  onSectionClick: (section: FlatSection | null, playImmediately: boolean, currentTime: number) => void;
  currentSection: FlatSection | null;
  isDisplayed?: boolean;
  toggleDisplay: () => void;
}

const renderSections = (
  onSectionClick:  (section: FlatSection | null, playImmediately: boolean, currentTime: number) => void,
  paramSmilFile: string | null,
  sectionsHolder: SectionsHolder,
  sections: Section[],
  level: number,
) => (
  <ul className={`Sections__List Sections__List--level${level}`}>{
    sections.map((section) => (
      <li  key={section.smilFile}>
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
          renderSections(onSectionClick, paramSmilFile, sectionsHolder, section.children, level + 1)
        )) || null}
      </li>
    ))}
  </ul>
);

const SectionList: React.FC<SectionListProps> = ({
  sectionsHolder,
  onSectionClick,
  currentSection,
  toggleDisplay,
  isDisplayed = false
}) => {
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

  return (
    <div className={`Sections__Container Sections__Container--${isDisplayed ? "visible" : "hidden"}`}>
      <div className="Sections__BackArrow" onClick={toggleDisplay}>←</div>
      <h2>Table des matières :</h2>
      {renderSections(onSectionClick, paramSmilFile, sectionsHolder, sectionsHolder.tree, 0)}
    </div>
  );
};

export default SectionList;
