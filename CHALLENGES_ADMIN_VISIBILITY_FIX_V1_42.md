# Challenges Admin Visibility Fix v1.42

- Challenge thumbnails now use explicit inline dimensions (82x64 desktop, 92x72 mobile) so global/Tailwind image rules cannot override the size.
- Desktop challenge table minimum width increased to keep the Actions column usable.
- Actions column is explicitly 330px wide.
- Publish/Unpublish is now a visible text button instead of a font-dependent symbol.
- Delete uses an inline SVG trash icon instead of a font-dependent glyph.
- No database migration required.
