import type { LoveNoteCard, LoveNoteCollection } from '../types/loveNote'

/*
  The specification confirms nine approved Love Note collections, but it does not
  provide their approved names. Keep the collection labels neutral until the
  client supplies the production names.
*/
export const loveNoteCollections: LoveNoteCollection[] = Array.from({ length: 9 }, (_, index) => ({
  id: `collection-${index + 1}`,
  name: `Love Note Collection ${index + 1}`,
  description: index === 0
    ? 'Initial client-supplied Love Note designs.'
    : 'Approved collection name and description to be supplied by the client.',
}))

/*
  These first four products use the exact client-supplied one-page 7 × 5 inch
  landscape PDFs as their downloadable masters. Titles are neutral catalog IDs;
  no official product titles were supplied in the source files.
*/
export const loveNoteCards: LoveNoteCard[] = [
  {
    id: 'love-note-001',
    collectionId: 'collection-1',
    title: 'Love Note 001',
    excerpt: 'A playful relationship note about snoring, blankets, and sharing the bed.',
    previewImageUrl: '/assets/love-notes/previews/love-note-001.png',
    pdfUrl: '/assets/love-notes/pdfs/love-note-001.pdf',
    published: true,
  },
  {
    id: 'love-note-002',
    collectionId: 'collection-1',
    title: 'Love Note 002',
    excerpt: 'A romantic note celebrating a woman as one of one and one of a kind.',
    previewImageUrl: '/assets/love-notes/previews/love-note-002.png',
    pdfUrl: '/assets/love-notes/pdfs/love-note-002.pdf',
    published: true,
  },
  {
    id: 'love-note-003',
    collectionId: 'collection-1',
    title: 'Love Note 003',
    excerpt: 'A long-term love note using the image of running a steady marathon together.',
    previewImageUrl: '/assets/love-notes/previews/love-note-003.png',
    pdfUrl: '/assets/love-notes/pdfs/love-note-003.pdf',
    published: true,
  },
  {
    id: 'love-note-004',
    collectionId: 'collection-1',
    title: 'Love Note 004',
    excerpt: 'A short note built around the idea of forever and everlasting love.',
    previewImageUrl: '/assets/love-notes/previews/love-note-004.png',
    pdfUrl: '/assets/love-notes/pdfs/love-note-004.pdf',
    published: true,
  },
]
