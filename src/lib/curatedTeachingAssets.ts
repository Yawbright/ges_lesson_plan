import type { TeachingNoteVisual } from '@/types/teachingNotes';

type CuratedAsset = {
  subjects: string[];
  keywords: string[];
  visual: TeachingNoteVisual;
};

const browserAssets: CuratedAsset[] = [
  {
    subjects: ['computing', 'ict', 'information technology'],
    keywords: ['browser', 'web browser', 'chrome', 'firefox', 'edge', 'internet'],
    visual: {
      id: 'curated-web-browsers',
      kind: 'curated_image',
      source: 'curated',
      title: 'Examples of Web Browsers',
      caption: 'Chrome, Firefox, Edge and Safari are common web browsers learners may recognise.',
      altText: 'Logos representing common web browsers.',
      imageUrl: 'https://cdn.simpleicons.org/googlechrome',
      attribution: 'Browser logos are trademarks of their respective owners; icons supplied via Simple Icons CDN.',
      labels: [
        { label: 'Chrome', description: 'A common browser from Google.' },
        { label: 'Firefox', description: 'A common browser from Mozilla.' },
        { label: 'Edge', description: 'A common browser from Microsoft.' },
        { label: 'Safari', description: 'A common browser from Apple.' },
      ],
    },
  },
];

export const curatedTeachingAssets = [...browserAssets];

export function findCuratedTeachingVisuals(subject: string, text: string): TeachingNoteVisual[] {
  const normalizedSubject = subject.toLowerCase();
  const normalized = text.toLowerCase();
  const matches = curatedTeachingAssets.filter((asset) =>
    asset.subjects.some((candidate) => normalizedSubject.includes(candidate)) &&
    asset.keywords.some((keyword) => normalized.includes(keyword)),
  );
  return matches.map((asset) => ({ ...asset.visual }));
}
