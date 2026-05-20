# TrueServe QA Accessibility Scenarios

Use these scenarios for WCAG-minded regression testing on desktop and mobile. Focus first on checkout, order tracking, driver signup, login, and merchant onboarding.

## Baseline Setup

- Test with keyboard only: Tab, Shift+Tab, Enter, Space, Escape.
- Test mobile at 390px wide and desktop at 1440px wide.
- Test browser zoom at 200%.
- Test reduced motion enabled in OS/browser settings.
- Test with a screen reader if available: VoiceOver on macOS/iOS, NVDA on Windows, or TalkBack on Android.

## Global Navigation

1. Open the homepage.
2. Press Tab from the top of the page.
3. Confirm a visible focus ring appears on each focused link or button.
4. Confirm the focused item can be activated with Enter or Space where appropriate.
5. Confirm focus order matches the visual order.

Expected result: Users can navigate without a mouse and never lose sight of focus.

## Login

1. Open `/login`.
2. Tab through every field and button.
3. Submit the form empty.
4. Confirm the error is visible and understandable.
5. Use a screen reader to confirm fields have meaningful names.

Expected result: The form is usable by keyboard and announces meaningful field context.

## Driver Signup

1. Open `/drive`.
2. Start the driver application form.
3. Tab through every field, checkbox, and submit button.
4. Leave required fields blank and submit.
5. Confirm each error explains what to fix.
6. Confirm SMS consent language is visible near the phone opt-in.

Expected result: A driver can complete the form without a mouse, and consent/error language is clear.

## Restaurant Checkout

1. Open a restaurant page.
2. Add an item to cart using keyboard only.
3. Select Express, Standard, and Schedule delivery options.
4. Select Schedule without choosing a time and attempt checkout.
5. Confirm checkout blocks the attempt with clear messaging.
6. Fill saved delivery preferences: drop-off type, apt/suite, gate code, driver notes.
7. Use the N/W/E/S pin buttons instead of dragging the map.

Expected result: Checkout is possible without dragging a map, and all required blockers are clear.

## Order Tracking

1. Open an active order detail page.
2. Confirm the order status section has a clear heading.
3. Tab to Contact Support and open chat.
4. Confirm focus moves into the chat dialog.
5. Press Escape.
6. Confirm the chat closes and focus returns to the support button.
7. Open chat again and Tab through the modal.
8. Confirm focus stays inside the modal until closed.

Expected result: Status updates are understandable, support is keyboard accessible, and focus does not escape the dialog.

## Reduced Motion

1. Enable reduced motion in system/browser settings.
2. Reload homepage, checkout, order tracking, and rewards pages.
3. Confirm animations are stopped or dramatically reduced.
4. Confirm no essential information depends on motion.

Expected result: The site remains calm and fully usable for users with motion sensitivity.

## Color And Contrast

1. Inspect dark cards, orange labels, gray helper text, and disabled states.
2. Confirm important text is readable on mobile brightness.
3. Confirm form errors are not communicated by color alone.

Expected result: Key content remains readable and errors include text, not color-only cues.

## Mobile Touch Targets

1. Test mobile checkout and order tracking at 390px.
2. Confirm buttons are at least 40px tall.
3. Confirm controls are not hidden behind bottom nav or chat.
4. Confirm text does not overlap inside cards or buttons.

Expected result: Mobile users can tap controls comfortably, including users with motor limitations.

## Merchant Onboarding

1. Open merchant dashboard.
2. Tab through checklist items and setup buttons.
3. Confirm each incomplete setup step has a clear label and destination.
4. Confirm dialogs and panels can be closed with keyboard where available.

Expected result: A merchant can understand launch blockers and reach each setup area without a mouse.

## Report Results

For each issue, capture:

- Page URL
- Device/browser
- Steps to reproduce
- Expected result
- Actual result
- Screenshot or short screen recording
- Severity: Blocker, High, Medium, Low
