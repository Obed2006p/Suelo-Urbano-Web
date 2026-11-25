# Implementation Plan - Fix Chatbot Plant Expert Chat

## Goal
Fix `Chatbot.tsx` so that user messages and image attachments are correctly packaged into `messagePayload` and `validHistory`, sent to `/api/gemini/chat`, and any connection errors are displayed with their real technical details in the chat window.

## Proposed Changes

### 1. Fix Chatbot.tsx Message Handling (`components/Chatbot.tsx`)
- Define `validHistory` from existing messages.
- Construct `messagePayload` correctly (handling text and optional image file via `fileToGenerativePart`).
- Update `catch` block to display `Error técnico: ${error.message || error}` directly in the chat window instead of hiding it.

## Verification Plan
- Compile applet with `compile_applet`.
- Test chat messaging in browser.
