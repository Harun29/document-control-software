"use client";

import React, { createContext, useContext } from "react";
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface AiContextProps {
  getAiSummarisation: (message: string) => Promise<string | undefined>;
}

const AiContext = createContext<AiContextProps | null>(null);

export const AiProvider = ({ children }: { children: React.ReactNode }) => {

  const getAiSummarisation = async (message: string) => {
    if (message.trim() === "") return;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides summarisation of the document content in maximum of 100 words.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      })

      if (!response.choices || response.choices.length === 0) {
        throw new Error("Failed to get AI message");
      }

      const aiMessage = response.choices[0].message.content;
      return aiMessage || undefined;

    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <AiContext.Provider
      value={{
        getAiSummarisation,
      }}
    >
      {children}
    </AiContext.Provider>
  );
};

export const useAi = () => {
  const context = useContext(AiContext);
  if (!context) {
    throw new Error("useAi must be used within an AiProvider");
  }
  return context;
};
