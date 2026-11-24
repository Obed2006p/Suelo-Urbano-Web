# Implementation Plan - Fix Dr. Plant Voice Assistant Response Relevance

## Goal
Ensure Dr. Planta directly answers the user's exact spoken question in voice consultations instead of repeating fallback default phrases (like "mantener el sustrato y la corona visible").

## Proposed Changes

### 1. Backend Chat Prompt (`server.ts`)
- Update the system instruction and prompt for `/api/gemini/chat` to strictly enforce direct answering:
  - "Responde ÚNICAMENTE a la pregunta específica que acaba de hacer el usuario. No repitas frases predeterminadas ni consejos genéricos a menos que se relacionen directamente con la pregunta."

### 2. Frontend Assistant (`components/LiveConsultaModal.tsx`)
- Refine the instruction sent with each message in `LiveConsultaModal.tsx` to emphasize immediate, direct, conversational relevance to the user's exact input.

## Verification Plan
- Compile the applet using `compile_applet`.
- Verify that asking specific questions (e.g., watering frequency, plant name) receives precise, relevant answers.
