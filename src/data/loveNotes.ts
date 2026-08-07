import type { LoveNoteCard, LoveNoteCollection } from '../types/loveNote'

/*
  The specification confirms there are 9 approved Love Note collections, but it does
  not provide their names. Keep these placeholders until the client supplies the
  approved collection names/assets; do not invent production names here.
*/
export const loveNoteCollections: LoveNoteCollection[] = Array.from({ length: 9 }, (_, index) => ({
  id: `collection-${index + 1}`,
  name: `Love Note Collection ${index + 1}`,
  description: 'Approved collection name and description to be supplied by the client.',
}))

export const loveNoteCards: LoveNoteCard[] = [
  {
    id: 'sample-love-note',
    collectionId: 'collection-1',
    title: 'Sample Love Note',
    message: 'Your approved Love Note copy will appear here.',
    designImageUrl: '',
    textColor: '#3d2d31',
    textAlign: 'center',
    textXPercent: 50,
    textYPercent: 52,
    textWidthPercent: 68,
    published: true,
  },
]
