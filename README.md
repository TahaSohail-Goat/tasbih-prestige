
# Tasbih Counter

This app is a digital tasbih counter with AI dhikr suggestions.

## Run Locally

**You need:** Node.js and a Gemini API key.

1. Install the packages:

   ```bash
   npm install
   ```

2. Add your API key:

   Create a file named `.env.local` in the main project folder.

   Add this line inside it:

   ```env
   GEMINI_API_KEY="your_api_key_here"
   ```

   You can copy `.env.example` and rename the copy to `.env.local`.

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open the local URL shown in the terminal.

Keep `.env.local` private. Do not upload it or share it.
