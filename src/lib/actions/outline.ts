"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { DocumentOutline, Section } from "@/lib/types";
import { nanoid } from "nanoid";

const aiSectionSchema = z.object({
  title: z.string(),
  subtopics: z.array(z.string()),
});

const aiOutlineSchema = z.object({
  sections: z.array(aiSectionSchema),
});

export async function generateAIOutline(
  topic: string,
  academicLevel: string,
  documentLength: number
): Promise<DocumentOutline> {
  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash", {
        useSearchGrounding: true,
      }),
      system:
        "You are a professional financial advisor based in Japan that specializes in specializing in personalized financial planning",
      prompt: [ 
        `Generate a personalized financial planning outline for the topic: "${topic}".`,
        `Requirements:`,
        `- Client profile level: ${academicLevel}`,
        `- Target depth: ~${documentLength} pages`,
        `- Structure: Use clear, practical financial planning categories (e.g., Income, Expenses, Savings, Investments, Insurance, Retirement, Tax Planning).`,
        `- Each category should have 2–4 unique, client-relevant subtopics.`,
        `- Avoid repetition and ensure the flow reflects typical financial planning order.`,
        `- Output only the outline structure, no narrative content.`,
        `Format your response as a JSON object matching the provided schema.`,
      ].join("\n"),
      schemaName: "DocumentOutline",
      schemaDescription:
        "A research document outline with sections and subtopics.",
      schema: aiOutlineSchema,
    });

    const sections = object.sections.map((section) => ({
      id: nanoid(5),
      title: section.title,
      isSelected: true,
      subtopics: section.subtopics.map((subtopicTitle) => ({
        id: nanoid(5),
        title: subtopicTitle,
        isSelected: true,
        content: "",
      })),
    }));

    return {
      mainTopic: topic,
      sections: sections,
    };
  } catch (error) {
    console.error("Error generating AI outline:", error);

    return generateStaticOutline(topic);
  }
}

function generateStaticOutline(topic: string): DocumentOutline {
  const sections: Section[] = [
    {
      id: "1",
      title: "Income Assessment",
      isSelected: true,
      subtopics: [
        {
          id: "1-1",
          title: "Current Income Sources",
          isSelected: true,
          content: `This section outlines the client’s existing income sources related to ${topic}.`,
        },
        {
          id: "1-2",
          title: "Income Stability & Growth",
          isSelected: true,
          content: `Evaluates the stability and potential for income growth for ${topic}.`,
        },
      ],
    },
    // ...other sections like in the original generateOutline
  ];

  return {
    mainTopic: topic,
    sections,
  };
}
