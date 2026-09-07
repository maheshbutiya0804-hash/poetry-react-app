# Love in Action — Scavenger / Where to Leave It

Implemented from client requirement:
- Subscriber-only current monthly challenge includes an optional “Where to Leave It” section.
- Admin Create Challenge can choose up to 12 placement suggestions.
- 13 supplied client ideas are available; first 12 are selected by default and admin can swap selections.
- No completion/progress tracking was added.
- Subscriber UI explicitly says challenges and placement ideas are optional but strongly encouraged and challenges are intended to stay simple/affordable.
- Featured love-note detail pages show the 12 placement suggestions only to active subscribers.

## Production database migration
Run from the server service before/with deployment:
`npx prisma migrate deploy`

Migration only ADDS nullable JSON column `challenge.scavengerLocations`; it does not delete or recreate existing challenge/card data.
