export type PoetryCard = {
  title: string
  text: string
  category: string
  theme: string
  inverse?: boolean
}

export type Category = {
  name: string
  description: string
  cards: PoetryCard[]
}

export const categories: Category[] = [
  {
    name: 'Happy Birthday',
    description: 'Warm reflections for celebration, joy and another year unfolding.',
    cards: [
      { title: 'A Year More You', text: 'Another year unfolding softly into who you are.', category: 'Happy Birthday', theme: 'gold' },
      { title: 'Quiet Celebration', text: 'May this year arrive with grace, depth, and light.', category: 'Happy Birthday', theme: 'cream' },
      { title: 'Held in Light', text: 'A soft beginning for another beautiful turn around the sun.', category: 'Happy Birthday', theme: 'stone' },
      { title: 'Still Becoming', text: "There's beauty in becoming more yourself.", category: 'Happy Birthday', theme: 'plum', inverse: true },
    ],
  },
  {
    name: 'Love',
    description: 'Still, soft, and deeply felt words for romance and belonging.',
    cards: [
      { title: 'You Mean Home', text: "You walked in and quietly became the safest part of me.", category: 'Love', theme: 'amber' },
      { title: 'Still Choosing You', text: 'Every day, I choose you all over again.', category: 'Love', theme: 'forest', inverse: true },
      { title: 'In Your Light', text: 'Even ordinary days carry more softness with you in them.', category: 'Love', theme: 'violet', inverse: true },
      { title: 'Softly Kept', text: 'Some love stays quiet and still changes everything.', category: 'Love', theme: 'sand' },
    ],
  },
  {
    name: 'Anniversary',
    description: 'Poetry for devotion, memory, and choosing each other again.',
    cards: [
      { title: 'Still Choosing You', text: 'Every day, I’d choose you all over again.', category: 'Anniversary', theme: 'forest', inverse: true },
      { title: 'Years In Bloom', text: 'The years kept opening, and so did we, softly.', category: 'Anniversary', theme: 'mist' },
      { title: 'What Stayed Gold', text: 'Time kept moving. It kept us.', category: 'Anniversary', theme: 'linen' },
      { title: 'After All This Time', text: 'Love learned the shape of staying and called it us.', category: 'Anniversary', theme: 'plum', inverse: true },
    ],
  },
  {
    name: 'Fathers Day',
    description: 'Grounded words for gratitude, guidance, and quiet strength.',
    cards: [
      { title: 'For All You Carried', text: 'Strength was in the small faithful things you never missed.', category: 'Fathers Day', theme: 'sage' },
      { title: 'A Steady Kind of Love', text: 'Not loud, but always there when it mattered.', category: 'Fathers Day', theme: 'forest', inverse: true },
      { title: 'What You Taught Me', text: 'Some lessons were spoken. The deepest ones were lived.', category: 'Fathers Day', theme: 'taupe' },
      { title: 'With Gratitude', text: 'For the care, the steadiness, the way you stayed.', category: 'Fathers Day', theme: 'gold' },
    ],
  },
  {
    name: 'Mothers Day',
    description: 'Tender cards for nurture, memory, and lasting closeness.',
    cards: [
      { title: 'What Tenderness Looks Like', text: 'You made softness feel strong enough to live by.', category: 'Mothers Day', theme: 'lavender', inverse: true },
      { title: 'For All the Ways You Knew', text: 'Love was in the way you noticed what needed holding.', category: 'Mothers Day', theme: 'linen' },
      { title: 'A Quiet Kind of Grace', text: 'The days were gentler because you moved through them first.', category: 'Mothers Day', theme: 'gold' },
      { title: 'Held By You', text: 'Some love becomes the ground beneath everything.', category: 'Mothers Day', theme: 'plum', inverse: true },
    ],
  },
]
