# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a file named `.env.local` in the project root and add your API keys. Replace the placeholder values with your actual keys:
   `API_KEY="your_gemini_api_key_here"`
3. Run the app:
   `npm run dev`

When deploying to a service like Vercel, make sure to set an environment variable for `API_KEY`.