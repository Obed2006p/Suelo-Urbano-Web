# Implementation Plan - Push-to-Talk Voice Interaction

## Goal
Replace continuous speech recognition with a reliable Push-to-Talk ("Presionar para hablar") button in `LiveConsultaModal.tsx` so the user controls when recording occurs, completely eliminating loops, echo triggers, and abrupt disconnections.

## Proposed Changes

### 1. Push-to-Talk Voice Interface (`components/LiveConsultaModal.tsx`)
- Remove continuous background speech recognition listening loop.
- Add a prominent microphone button: "Mantén presionado o toca para hablar con Dr. Planta".
- When pressed/touched, starts speech recognition and listens for the user's explicit query. When released or utterance ends, sends the query to `/api/gemini/chat` and speaks the response.

## Verification Plan
- Compile the applet using `compile_applet`.
- Verify that voice interaction requires a deliberate button press and responds accurately to the user's question.
