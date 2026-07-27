import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({apiKey: `${process.env.GEMINI_API_KEY}`});

export async function chatGemini (input: string) {
    try {
        const interaction = await ai.interactions.create({
            model: "gemini-3.5-flash",
            input: input,
        });
        return interaction.output_text

    } catch (error: any) {
        console.log("GEMINI ERROR: " +  error)
        if (error.status === 429) {
            return "no tokens"
        } 
        return "connection error" 
        
    } 
}
    