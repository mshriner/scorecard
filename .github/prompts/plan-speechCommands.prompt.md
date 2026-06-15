## Plan: Speech Commands for Edit Round

TL;DR - Add a small SpeechRecognitionService that wraps the Web Speech API, implement a deterministic command parser (regex + normalization) to extract hole number and score/putts from spoken phrases (supporting multiple commands per utterance), expose a start/stop control in the `EditRoundComponent` template, and dispatch parsed intents to the component's existing methods (`setStrokes`, `setPutts`, `strokesPlusOne`, etc.). Keep parsing deterministic, unit-test the parser, and degrade gracefully on unsupported browsers.

**Steps**

1. Create `SpeechRecognitionService` (root provider).
   - Expose `startListening()`, `stopListening()`, `isListening(): Signal<boolean>`, `transcript(): Signal<string>`, and `onResult(callback: (text:string) => void)` or a small event emitter.
   - Internally wrap the browser `SpeechRecognition`/`webkitSpeechRecognition` API with permission handling, continuous mode toggles, interim results, and basic retry/backoff.
   - Provide a `parseCommands(text: string): SpeechIntent[]` utility that returns a list of parsed intents (see grammar below).
   - _depends on creating parser in step 2._

2. Implement a deterministic parser for speech text.
   - Use a sequence of regex patterns + normalization to extract intents like:
     - "(par|bogey|birdie|eagle) (on )?hole (\d{1,2})"
     - "(\d+) putts? (on hole (\d{1,2}))?" or "hole (\d{1,2}) (\d+) putts"
     - "hole (\d{1,2}) (is )?(\d+)" -> set strokes
     - "add one stroke on hole 5", "minus one on hole 5" -> strokesPlusOne / strokesMinusOne
     - Combined utterances separated by commas or "and" -> split by `/[\.,]| and |, /i` then parse each segment
   - Return normalized intents: { type: 'setStrokes'|'setPutts'|'plusOneStroke'|'minusOneStroke'|'setCourse'|'save'|... , hole?: number, value?: number }
   - Add unit tests for many phrasings and edge cases. _parallel with step 1._

3. Add UI button & small affordance to `edit-round.component.html`.
   - Small FAB `mat-icon` button that toggles start/stop.
   - Visual feedback: red/green mic, temporary transcript display, and small snackbar confirmations for applied intents. (MAKE SURE TO USE ANGULAR MATERIAL VARIABLE NAMES RATHER THAN HARDCODED COLORS)
   - Make showing this FAB togglable (on by default) in the settings menu (next to "new stroke input UI" and saved on the User object likewise)
   - Place near existing save/import controls so it's discoverable.
   - _depends on step 1._

4. Hook service into `EditRoundComponent`.
   - Inject `SpeechRecognitionService` using the existing `inject()` pattern.s
   - Add `toggleSpeechRecognition()` and `handleTranscript(text: string)` methods.
   - In `handleTranscript`, call `speechService.parseCommands(text)` and for each intent dispatch to appropriate local method (`setStrokes`, `setPutts`, `strokesPlusOne`, `strokesMinusOne`, `updateCurrentCourse` if course spoken, `dateChanged` for dates, `saveRound()` for "save round" intent).
   - Ensure calls respect `editingRound.roundVariety` and `isNineHoleCourse`.
   - After applying changes call `updateUnsavedData()` and show brief snackbars describing actions taken.
   - _depends on steps 1 & 2._

5. Add unit tests for the parser and integration tests (component-level) where possible.
   - Parser tests: many variant utterances, multi-intent strings, ambiguous inputs.
   - Component integration: mock `SpeechRecognitionService` to emit transcripts and verify correct calls to `setStrokes`/`setPutts` and `updateUnsavedData()`.
   - _parallel with step 2 and 4._

6. Browser compatibility and graceful degradation.
   - If `SpeechRecognition` unavailable, disable mic button and show explanatory tooltip/snackbar with link to MDN compatibility.
   - Consider a feature flag behind `appStateService` (or an `environment` flag) to gate rollout.

7. UX polish & safety.
   - Confirm multi-intent actions with an ephemeral snackbar like "Set hole 5 to par; 2 putts" with Undo for a few seconds (call `setStrokes` then allow undo to restore old value).
   - Stop listening automatically when navigating away or when saving.
   - Respect `imported` mode — disable speech when editing an imported, read-only round.

8. Accessibility & Permissions.
   - Ensure appropriate ARIA labels on mic control and visible transcript for screen readers.
   - Handle microphone permission errors with friendly snackbar messages.

9. Deployment & telemetry (optional).
   - Log non-sensitive telemetry events (mic started/stopped, command parsed count, failures) behind a user-consent switch.

**Relevant files**

- [src/app/components/edit-round/edit-round.component.ts](src/app/components/edit-round/edit-round.component.ts) — add injection, handlers, and dispatching of parsed intents.
- [src/app/components/edit-round/edit-round.component.html](src/app/components/edit-round/edit-round.component.html) — add mic toggle UI and small transcript/indicator.
- `src/app/services/speech-recognition.service.ts` — new service to implement.
- [src/app/pipes/round-variety-scores.pipe.ts](src/app/pipes/round-variety-scores.pipe.ts) — awareness when applying scores for 9/18 holes.
- [src/app/util/data-utils.ts](src/app/util/data-utils.ts) — may be used for id generation or comparisons in undo flows.

**Verification**

1. Manual test: start mic, speak "par on hole 5", verify `editingRound.strokes[4]` updated to course par and snackbar shows confirmation.
2. Parser unit tests: run `npm test` with a suite covering 30+ utterances, including multi-intent inputs like "par on hole 5, 2 putts".
3. Component integration: mocked speech service emits "2 putts on hole 8" and assert `setPutts(7,2)` was called and `updateUnsavedData()` set true.
4. Cross-browser check: verify mic button disabled on unsupported browsers and outputs instructive message.

**Decisions**

- Use the built-in Web Speech API (SpeechRecognition / webkitSpeechRecognition) rather than third-party cloud NLP — keeps privacy local and avoids API keys.
- Implement parser via regex-based deterministic rules (fast, testable). If users request more natural phrasing support later, consider a lightweight NLP service or a client-side intent library.

**Further Considerations**

1. Multi-phrase handling: prefer splitting by punctuation and "and"/"then". Option A: immediate apply each parsed intent. Option B: show confirmation summary before applying (safer but slower). Default: immediate apply + short undo.
2. Locale support: default to browser locale; allow `speechRecognition.lang` to be configurable.
3. Security/privacy: do not log raw transcripts in telemetry.
