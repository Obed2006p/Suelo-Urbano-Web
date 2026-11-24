# Implementation Plan - Performance Optimization & Bug Fixes for Suelo Urbano Tu Hogar

## User Requirements & Context
1. **Mobile Menu & Backdrop Bugs**: Fix the dark backdrop overlay issue where the shadow covers content improperly and stretches awkwardly, and ensure the sidebar navigation behaves correctly on mobile without sticking or requiring full page reloads.
2. **Performance on Low-End Devices**: Automatically detect low-end devices or low hardware concurrency, reducing or disabling heavy CSS/JS animations (such as `FallingLeaves` and complex particle effects) to guarantee smooth frame rates.
3. **Dr. Plant Reliability**: Add automatic reconnection and a lightweight fallback mechanism for Dr. Plant / plant diagnosis on slow connections.

## Proposed Changes

### 1. Mobile Menu & Backdrop Fixes (`/components/Header.tsx` & Sidebar component)
- Adjust the mobile menu backdrop and overlay container styling to prevent full-screen darkening or visual clipping bugs (as seen in user screenshots).
- Ensure smooth closing/opening without leaving behind residual blur or incorrect background stacking.

### 2. Performance Manager Hook & Low-End Optimization (`/components/FallingLeaves.tsx`, `/components/BioluminescentEcosystem.tsx`, new `/components/PerformanceContext.tsx`)
- Implement a performance detection utility (`navigator.hardwareConcurrency`, memory estimation, or manual toggle).
- Conditionally render or simplify heavy animations (`FallingLeaves`, heavy glow effects) when running on low-end devices or when user preference dictates.

### 3. Dr. Plant Resilience & Reconnection (`/components/PlantDoctorPage.tsx`, `/components/Chatbot.tsx`, `/server.ts`)
- Add robust timeout handling, automatic retry with exponential backoff, and clear user-friendly offline/slow-connection fallback prompts for Dr. Plant diagnosis and chat endpoints.

## Verification Plan
- Compile applet with `compile_applet`.
- Verify mobile menu layout and backdrop in responsive mode.
- Verify smooth performance and graceful fallback for heavy animations.
