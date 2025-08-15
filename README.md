# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a file named `.env.local` in the project root and add your Gemini API key. Replace `your_api_key_here` with your actual key:
   `API_KEY="your_api_key_here"`
3. Run the app:
   `npm run dev`

When deploying to a service like Vercel, make sure to set an environment variable named `API_KEY` with your Gemini API key.
