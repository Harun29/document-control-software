"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useAi } from "@/context/AiContext";
import { db } from "@/config/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

const AddDocument = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { usersOrg } = useAuth();
  const { getAiSummarisation } = useAi();

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    const customEvent = {
      target: { files: [droppedFile] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(customEvent);
  };

  const clearDocSelection = () => {
    setFile(null);
    setTitle("");
    setContent("");
    setLabel("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a file.");
      return;
    }

    try {
      const docRef = await addDoc(
        collection(db, "org", usersOrg, "docRequests"),
        {
          title,
          content,
          label,
          fileName: file.name,
          fileType: file.type,
          createdAt: new Date(),
          status: "pending",
        }
      );

      console.log("Document request submitted with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding document request:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setFile(selectedFile);
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch("http://127.0.0.1:8000/extractContent", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to extract content");
        }

        const data = await response.json();
        const contentSummary = await getAiSummarisation(data.content);
        setContent(
          contentSummary ? contentSummary : "Failed to summarise content"
        );
        setTitle(selectedFile.name);
      } catch (error) {
        console.error("Error extracting content:", error);
      }
    } else {
      alert("Please upload a valid .pdf or .docx file.");
      setFile(null);
    }
  };

  const handleViewDocument = () => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    } else {
      alert("No file selected.");
    }
  };

  return (
    <div className="lg:flex lg:space-x-6 h-full min-h-[100vh-4rem]">
      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="lg:w-2/3 flex flex-col space-y-6 p-6 bg-white shadow-md rounded-lg flex-grow"
      >
        <h1 className="text-3xl mb-1">Add Document</h1>
        <p className="text-[#505050]">Add a document to your organization</p>
        {/* Title Input */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Content Input */}
        <div className="space-y-2">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <textarea
            className="resize-none h-40 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter document content"
          />
        </div>
        {/* Document Type Select */}
        <div className="space-y-2">
          <label
            htmlFor="document-type"
            className="block text-sm font-medium text-gray-700"
          >
            Document Type
          </label>
          <Select onValueChange={(value) => setLabel(value)}>
            <SelectTrigger className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Select Document Type" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
              <SelectItem value="report">Report</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="presentation">Presentation</SelectItem>
              <SelectItem value="memo">Memo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* File Drop Section */}
        <div
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-dashed border-2 border-gray-300 p-4 rounded-md text-center bg-gray-50 hover:bg-gray-100 cursor-pointer"
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer text-gray-500">
            Drag and drop a file here, or click to select a file
          </label>
          {file && (
            <div className="mt-4 text-gray-700">
              {file.type === "application/pdf" && (
                <FaFilePdf size={40} className="text-red-500 mx-auto" />
              )}
              {file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
                <FaFileWord size={40} className="text-blue-500 mx-auto" />
              )}
              <p className="text-sm mt-2">{file.name}</p>
            </div>
          )}
        </div>
        {/* Buttons */}
        <div className="flex justify-between">
          <div className="gap-4 flex">
            <Button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Document
            </Button>
            <Button
              type="button"
              onClick={handleViewDocument}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              View Document
            </Button>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={clearDocSelection}
          >
            Clear Document Selection
          </Button>
        </div>
      </form>

      {/* Preview Section */}
      <div className="lg:w-1/3 bg-gray-50 shadow-md rounded-lg p-4 flex flex-col flex-grow">
        <h2 className="text-lg font-medium text-gray-700">Document Preview</h2>
        {file ? (
          <>
            <p className="mt-2 text-sm text-gray-600">
              <strong>Title:</strong> {title || "Untitled"}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Content:</strong>{" "}
              {content
                ? content.substring(0, 100) + "..."
                : "No content available"}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Label:</strong> {label || "No label selected"}
            </p>
            {/* Scrollable Viewer */}
            <div className="flex-grow h-[400px] overflow-auto border mt-4 rounded-md pt-4 pb-4">
              {file.type === "application/pdf" && (
                <Worker
                  workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
                >
                  <Viewer fileUrl={URL.createObjectURL(file)} />
                </Worker>
              )}
              {file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
                <DocViewer
                  documents={[{ uri: URL.createObjectURL(file) }]}
                  pluginRenderers={DocViewerRenderers}
                />
              )}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-600">No document selected</p>
        )}
      </div>
    </div>
  );
};

export default AddDocument;
