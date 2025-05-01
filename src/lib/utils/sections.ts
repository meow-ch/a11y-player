export interface Section {
  title: string;
  level: number;
  smilFile: string;
  children?: Section[];
}

export interface FlatSection {
  title: string;
  level: number;
  smilFile: string;
  parent: string | null;
}

export type SectionsHolder = {
  tree: Section[];
  flat: FlatSection[];
}

type Exploration = { found: Section | null; previous: Section | null; };
type Flattening = { flattened: FlatSection[], parentSmil: string | null };

export const flatten = (tree: Section[]): FlatSection[] => {
  const reducer = (flattening: Flattening, s: Section): Flattening => {
    const meFlat: FlatSection = { ...s, parent: flattening.parentSmil || null };
    if (s.children) {
      const childrenFlattening = s.children.reduce(reducer, {
        flattened: [...flattening.flattened, meFlat],
        parentSmil: meFlat.smilFile
      });
      return {
        ...flattening,
        flattened: childrenFlattening.flattened,
      };
    }
    return { ...flattening, flattened: [...flattening.flattened, meFlat] };
  };
  return tree.reduce(reducer, { flattened: [], parentSmil: null }).flattened;
}

export const getFirst = (sectionsHolder: SectionsHolder): FlatSection | null => {
  if (!sectionsHolder || sectionsHolder.flat.length <= 0) return null;
  return sectionsHolder.flat[0];
}

export const getFirstSmil = (sectionsHolder: SectionsHolder): string | null => {
  const section = getFirst(sectionsHolder);
  return section && section.smilFile;
}

export const treeFindBySmil = (haystack: Section[], needle: string): Exploration => {
  const reducer = (exploration: Exploration, s: Section): Exploration => {
    if (exploration.found) return exploration;
    if (s.smilFile === needle) return { ...exploration, found: s };
    if (s.children) {
      const inChildren = s.children.reduce(reducer, { found: null, previous: s });
      if (inChildren.found) return inChildren;
    }
    return { found: null, previous: s };
  };
  return haystack.reduce(reducer, { found: null, previous: null });
}

export const flatGetNext = (flat: FlatSection[], currentSection: FlatSection): FlatSection | null => {
  const nextIndex = flat.findIndex((s) => s === currentSection) + 1;
  return nextIndex <= (flat.length - 1) ? flat[nextIndex] : null;
};

export const flatGetPrev = (flat: FlatSection[], currentSection: FlatSection): FlatSection | null => {
  const nextIndex = flat.findIndex((s) => s === currentSection) - 1;
  return nextIndex >= 0 ? flat[nextIndex] : null;
};

export const flatFindBySmil = (flat: FlatSection[], needle: string) => {
  return flat.find(s => s.smilFile === needle) || null;
}
