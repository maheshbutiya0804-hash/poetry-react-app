# Admin Cards reference UI update

- Rebuilt Admin > Cards against the supplied Heartstring `<main>` structure.
- Preserves Laurentine database/API functionality.
- Uses Collection in place of the legacy Category column/filter.
- Adds database-backed status, collection, featured-only and search filters.
- Keeps 10 records per page with server-side pagination.
- Uses real preview thumbnails, updated timestamps, create/edit/delete and bulk upload routes.
- Adds backend collection/featured filters and returns `updatedAt` in card DTOs.
