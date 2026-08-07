export type LoveNoteCollection = {
  id: string
  name: string
  description: string
}

export type LoveNoteCard = {
  id: string
  collectionId: string
  title: string
  message: string
  designImageUrl: string
  textColor?: string
  textAlign?: 'left' | 'center' | 'right'
  textXPercent?: number
  textYPercent?: number
  textWidthPercent?: number
  published?: boolean
}
