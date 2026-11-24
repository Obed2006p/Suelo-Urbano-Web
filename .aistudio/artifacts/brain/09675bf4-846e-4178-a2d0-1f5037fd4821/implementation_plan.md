# Implementation Plan - Fix Speech Recognition Loop & Context Repetition

## Goal
Resolve the bug where the voice assistant loops or repeats canned responses by refining speech recognition state management, preventing echo pickup, and improving backend prompt context passing in `LiveConsultaModal.tsx`.

## Proposed Changes

### 1. Robust Speech State & Echo Guard (`components/LiveConsultaModal.tsx`)
- Implement a strict locking mechanism (`isProcessingRef`) during API calls so speech recognition results are completely ignored while waiting for the model or while `speechSynthesis` is active.
- Add a timeout window after speech synthesis ends before restarting recognition.
- Filter out empty or hallucinated transcripts.

### 2. Enhanced Chat Prompt (`server.ts` / `LiveConsultaModal.tsx`)
- Ensure the chat request passes the specific user message correctly and includes clear persona instructions.

## Verification Plan
- Compile the applet using `compile_applet`.
- Verify that voice input accurately triggers distinct model answers without looping.
