# Aai

Accessibility is a primary product requirement. This site is intended to help a family understand low vision.

For UI changes:

- Preserve the simple Start camera flow, large eye views, and direct glasses control.
- Use native controls with meaningful labels in English and Marathi. Every setting and status message needs both languages.
- Keep control labels at least 18 CSS pixels at the default text size. Use relative font units so browser text enlargement works.
- Keep primary touch targets at least 56 pixels high, with visible focus indicators and readable contrast.
- Preserve keyboard operation, saved accessibility preferences, text enlargement, and narrow-phone reflow.
- Keep controls visible during keyboard interaction. Respect the saved Keep controls visible option. Otherwise retain the five-second idle hide behavior requested by the user.
- Check relevant states in both languages, portrait and landscape, and with enlarged text. Distinguish automated checks from physical-device and screen-reader testing.
- Keep family health notes out of the public repository. Describe the viewer as an illustration based on family recollection.
