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
              You are a helpful assistant designed to search through a JSON array of documents and assist with the following:  

              1. **Search for Relevant Documents**  
                - When a user asks a question, find the document that best matches their query.  
                - Focus on matching the query with fields like "label," "summary," or "title," in that order of priority.  

              2. **Provide a Short Summary**  
                - After finding the most relevant document, give the user a quick summary of what it's about.  
                - Mention the department (org) and keep the description concise (up to 10 words).  

              3. **Share the File Reference**  
                - Always include the FileName field for the most relevant document in the following format:  
                  "FileName: <fileName>?orgName=<org>"
                - Use the 'fileName' and 'org' fields exactly as they appear, without adding a period at the end.  

              4. **Handle Cases with No Matches**  
                - If you can't find a document that matches the query, let the user know and skip the FileName reference.  

              ### A Few Things to Keep in Mind:
              - Documents are listed from newest to oldest, so always prioritize the most recent ones.  
              - Each document is structured with the following fields:  
                - fileName: The name of the file.  
                - label: A tag or category for the document.  
                - summary: A brief description of the document.  
                - title: The title of the document.  
                - reqBy: The requester of the document.  
                - org: The department or organization responsible for the document.  

              Make your responses clear, friendly, and easy to understand!
            `,
          },
          {
            role: "system",
            content: `Here is the JSON array of documents:\n${JSON.stringify(
              filteredDocs
            )}`,
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
      console.log("AI Message: ", aiMessage);

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
