import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({apiKey: `${process.env.GEMINI_API_KEY}`});

export async function chatGemini (input: string) {
    const interaction = await ai.interactions.create({
        model: "gemini-3.5-flash",
        input: input,
        });
    console.log(interaction.output_text);
}
    