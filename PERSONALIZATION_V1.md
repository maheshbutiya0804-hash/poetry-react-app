# Card Personalization v1

Implemented for ready-made PDF cards.

## User experience
- Card detail page has a premium personalization panel.
- Recipient appears bottom-left as `For: Name`.
- Sender appears bottom-right as `With Love: Name`.
- Live on-page preview updates as names are typed.
- Active subscribers can download a personalized PDF on demand.
- Physical-card checkout carries personalization into the order.

## PDF safety
- `master.pdf` is never modified.
- Personalized PDFs are generated on demand from the original.
- A subtle footer band is added to the personalized copy only so names remain readable and separate from the poem/logo.

## Physical orders
- `personalizationRecipient` and `personalizationSender` are stored on `cardorder`.
- Admin Order Detail shows both names.
- Admin can download a print-ready personalized PDF for the order.

## Database
Migration: `20260816100000_card_personalization`

Railway pre-deploy remains:
`npx prisma migrate deploy`
