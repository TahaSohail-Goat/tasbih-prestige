import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { feeling, language } = await request.json();
    const responseLanguage = language === 'ur' ? 'Urdu' : 'English';

    if (!feeling || typeof feeling !== 'string' || feeling.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feeling or circumstance is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY in environment variables');
      return NextResponse.json(
        { error: 'AI is not ready. Add GEMINI_API_KEY in .env.local and restart the app.' },
        { status: 500 }
      );
    }

    // Initialize the official @google/genai SDK
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a wise, supportive, and compassionate Islamic spiritual mentor. 
A user has shared their current emotional state, situation, or spiritual need: "${feeling}".
Provide a beautiful, highly relevant, and authentic Islamic Dhikr, Dua, or Tasbih from Quran or authentic Sunnah that directly helps them find peace, strength, or express gratitude for their specific situation.

Return a JSON object in this exact schema, and do NOT include any markdown code block formatting (such as \`\`\`json ... \`\`\`) in your output. Just output the raw JSON string:
{
  "arabic": "The exact Arabic text of the Dhikr/Dua, including full diacritics (harakat/tashkeel) for elegant rendering",
  "transliteration": "Clear English phonetic spelling/transliteration",
  "translation": "A highly accurate, rich, and comforting ${responseLanguage} translation",
  "description": "A personalized, gentle 1-2 sentence explanation in ${responseLanguage} of why this specific remembrance perfectly aligns with their feeling",
  "benefit": "The authentic spiritual benefit or wisdom in ${responseLanguage} behind this prayer (e.g. from Sahih Al-Bukhari, Quranic verse references, or spiritual scholars)",
  "defaultTarget": A recommended integer count for reciting (e.g. 7, 33, 99, 100, or 70 depending on the nature of the Dhikr)"
}

Ensure the response is completely safe, peaceful, and respectful. Choose well-known, authentic prayers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Emotional/Spiritual State: "${feeling}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini API');
    }

    // Parse the JSON safely
    const dhikrData = JSON.parse(responseText.trim());

    // Validate the schema fields
    if (!dhikrData.arabic || !dhikrData.transliteration || !dhikrData.translation) {
      throw new Error('Invalid JSON structure returned from AI model');
    }

    return NextResponse.json(dhikrData);
  } catch (error: any) {
    console.error('Error generating AI Dhikr:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate custom devotion.',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
