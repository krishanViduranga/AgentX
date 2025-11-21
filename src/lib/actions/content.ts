"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function generateAIContent(
  mainTopic: string,
  sectionTitle: string,
  subtopicTitle: string,
  academicLevel: string
): Promise<string> {  
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-lite", {
        // useSearchGrounding: true,
      }),
      system:
        "You are a professional financial advisor based in Japan, specializing in life insurance and financial planning. Your responses must be polite, accurate, and culturally appropriate for Japanese clients. Use a formal yet easy-to-understand tone, and respect Japan’s financial norms and client expectations.",
      prompt: [
        `Write a personalized, well-structured explanation (100-120 words) for the subtopic "${subtopicTitle}" under the section "${sectionTitle}" of a smart insurance and life planning guide on "${mainTopic}".`,
        `Client profile:`,
        `- Financial experience level: ${academicLevel}`,
        `- Focus on relevance to the Japanese market and systems.`,
        `- Use language that is respectful, concise, and informative.`,
        `- Where appropriate, include references to Japanese concepts (e.g., NISA, iDeCo, national insurance).`,
        `- Avoid technical jargon unless suitable for the financial level.`,
        `- Do NOT use markdown formatting, bullet points, or any headings.`,
        `- Respond with a clean, single paragraph only.`,
      ].join("\n"),
    });

    return text.trim();
  } catch (error) {
    console.error("Error generating AI content:", error);
    return `An error occurred while generating content for "${subtopicTitle}". Please try again later.`;
  }
}
 