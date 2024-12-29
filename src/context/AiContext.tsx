"use client";

import React, { createContext, useContext, useState } from "react";
import { OpenAI } from "openai";
import { useGeneral } from "./GeneralContext";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface AiContextProps {
  getAiSummarisation: (message: string) => Promise<string | undefined>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  handleInputChange: (value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const AiContext = createContext<AiContextProps | null>(null);

export const AiProvider = ({ children }: { children: React.ReactNode }) => {
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { docs } = useGeneral();

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "") return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: input },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getAiResponse(input);
      if (response) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: response },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAiResponse = async (message: string) => {
    if (message.trim() === "") return;

    const filteredDocs = docs.map((doc) => ({
      fileName: doc.fileName,
      label: doc.label,
      summary: doc.summary,
      title: doc.title,
      reqBy: doc.reqBy,
      org: doc.org,
    }));
  
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          ...messages,
          {
            role: "system",
            content: `
            You are a helpful assistant that searches through a JSON array of documents. 
            Your tasks are:
            1. Search for the most relevant document based on the user's query.
            2. Provide a brief summary of the matching document (maximum 10 words).
            3. Always include the FileName field from the JSON document in this format: FileName: <fileName> (Do not add fullstop at the end). The FileName comes specifically from the "fileName" field of the document. Do not use the "title" field for this.
            4. If the query does not match any document, Do not include the FileName at the end.
            5. Documents are sorted from newest to oldest (most recent first).
            Documents are structured as follows:
            - fileName: string
            - label: string
            - summary: string
            - title: string
            - reqBy: string
            - org: string
            `
          },
          {
            role: "system",
            content: `Here is the JSON array of documents:\n${JSON.stringify(filteredDocs)}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      });
  
      if (!response.choices || response.choices.length === 0) {
        throw new Error("Failed to get AI message");
      }
  
      const aiMessage = response.choices[0].message.content;
      console.log(aiMessage);
  
      return aiMessage || undefined;
    } catch (err) {
      console.error("Error fetching AI response:", err);
      return "An error occurred while processing your request. Please try again.";
    }
  };

  const getAiSummarisation = async (message: string) => {
    if (message.trim() === "") return;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that provides summarisation of the document content in maximum of 200 words in bosnian language.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      });

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
        messages,
        setMessages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
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
