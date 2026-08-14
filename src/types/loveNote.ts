export type LoveNoteCollection = {
  id: string
  slug?: string
  name: string
  description: string
  cardCount?: number
  isActive?: boolean
  sortOrder?: number
}

export type LoveNoteCard = {
  id: string
  slug?: string
  collectionId: string
  categoryId?: string | null
  categoryName?: string | null
  title: string
  excerpt: string
  previewImageUrl: string
  pdfUrl: string | null
  published: boolean
  poemText?: string
  adminNotes?: string
  isFeatured?: boolean
  templateKey?: string
  frontLayout?: unknown
  backLayout?: unknown
  widthInches?: number
  heightInches?: number
  orientation?: string
  sideCount?: number
  pageCount?: number
}
