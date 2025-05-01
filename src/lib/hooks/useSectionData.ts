import { useState, useEffect } from 'react';
import { Section, SectionsHolder, flatten } from '../utils/sections';

const parseSections = (html: string): SectionsHolder => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headers = Array.from(doc.querySelectorAll('h1, h2, h3'));
  const sectionStack: Section[] = [];
  const result: Section[] = [];

  headers.forEach(header => {
    const level = parseInt(header.tagName[1]);
    const smilFile = header.querySelector('a')?.getAttribute('href')?.split('#')[0] ?? '';
    const title = header.textContent ?? 'Unknown Title';
    const section: Section = { title, level, smilFile };

    while (sectionStack.length && sectionStack[sectionStack.length - 1].level >= level) {
      sectionStack.pop();
    }

    if (sectionStack.length) {
      const parent = sectionStack[sectionStack.length - 1];
      parent.children = parent.children ?? [];
      parent.children.push(section);
    } else {
      result.push(section);
    }

    sectionStack.push(section);
  });

  return { tree: result, flat: flatten(result), };
};

const extractBookInfo = (html: string): { title: string; author: string } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const title = doc.querySelector('meta[name="dc:title"]')?.getAttribute('content') ?? 'Unknown Title';
  const author = doc.querySelector('meta[name="dc:creator"]')?.getAttribute('content') ?? 'Unknown Author';
  return { title, author };
};

type BookInfo = {
  title: string;
  author: string;
}

const useSectionData = (dirUrl: string) => {
  const [sections, setSections] = useState<SectionsHolder>({
    tree: [],
    flat: []
  });

  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);

  useEffect(() => {
    fetch(`${dirUrl}/ncc.html`)
      .then(response => response.text())
      .then(html => {
        setBookInfo(extractBookInfo(html));
        return html;
      })
      .then(html => {
        extractBookInfo
        setSections(parseSections(html))
      })
      .catch(error => console.error('Failed to fetch book sections:', error));
  }, [dirUrl]);

  return {
    sectionsHolder: sections,
    bookInfo,
  };
};

export default useSectionData;
