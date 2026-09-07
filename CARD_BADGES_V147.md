# Card Badges v1.47

- NEW: automatically true for published cards created within the last 7 days.
- MOST BOUGHT: top 3 cards by summed quantity on DELIVERED CardOrder records created in the last 90 days.
- Cancelled/other order statuses do not count.
- Badges are calculated server-side and exposed on public card DTOs; purchaseCount90d is included for transparency/future admin use.
- Card order index added for the 90-day status/card grouping query.
