# Challenge participation admin + return flow

- Admin Challenges now has a Participants action for every challenge.
- Participant detail page shows Joined, In Progress, Completed, Completion Rate, subscriber, selected Love Note, selected Where to Leave It location, start date, and completion date.
- Admin API: GET /admin/challenges/:challengeId/participants with search/status/page/pageSize.
- Opening a Love Note from /challenges now carries challenge context in the URL.
- Love Note detail displays “Back to Challenge” when opened from a challenge.
- No new database migration in this version; it uses ChallengeParticipation introduced in v1.40.
