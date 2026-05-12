import type { TeachingNoteVisual } from '@/types/teachingNotes';

type CuratedAsset = {
  keywords: string[];
  visual: TeachingNoteVisual;
};

const browserAssets: CuratedAsset[] = [
  {
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

export function findCuratedTeachingVisuals(text: string): TeachingNoteVisual[] {
  const normalized = text.toLowerCase();
  const matches = curatedTeachingAssets.filter((asset) =>
    asset.keywords.some((keyword) => normalized.includes(keyword)),
  );
  return matches.map((asset) => ({ ...asset.visual }));
}
