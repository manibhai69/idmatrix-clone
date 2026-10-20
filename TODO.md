# IDMatrix Clone ToDo

- [ ] **Responsive converter shell matches the reference experience**
  - Preserve the reference site's public page structure: sticky IDMatrix top bar, theme toggle, Admin link, centered converter content, and copyright footer.
  - Match the reference copy, visual hierarchy, blue accent styling, card layout, responsive behavior, and light/dark theme states.

- [ ] **Front and back image intake works from browse and drag-and-drop**
  - Provide separate Front Side and Back Side upload cards.
  - Accept image files from the visible browse control or by dropping onto either zone.
  - Show clear upload-state feedback and image previews after selection.

- [ ] **Per-image editing actions are available client-side**
  - Provide Crop, Rotate, and Remove actions for each uploaded image.
  - Apply edits to the selected image preview without changing the original file input requirement.

- [ ] **Processing controls preserve the reference options**
  - Provide Auto Edge Crop and Magic Enhance toggles with the reference descriptions.
  - Provide Cross ID Card behavior that affects generated outputs only and does not alter the clean upload preview.
  - Provide preset crossing text choices, Custom text input, size, transparency, and bold controls.
  - Reflect crossing-text settings in the prepared output preview and generated files.

- [ ] **Word, PDF, and Both generation actions are functional**
  - Validate that at least one image is uploaded before generation.
  - Generate a print-ready 4×2 A4 layout from the uploaded front/back content.
  - Provide a Word-compatible download for Word generation, a browser print/PDF flow for PDF generation, and both outputs for Generate Both.
  - Show loading, success, validation, error, and download feedback through visible UI states.

- [ ] **Project is runnable, diagnosable, and ready for GitHub**
  - Serve the complete route manifest at `/manus-routes.json`.
  - Include a reproducible package/build setup and project metadata.
  - Verify the app with a production build and preview smoke check.
  - Push the finished code to a new GitHub repository without committing secrets or generated dependencies.
