"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useAi } from "@/context/AiContext";
import { db } from "@/config/firebaseConfig";
import { storage } from "@/config/firebaseConfig";
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
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

    const randomWords = uuidv4();
    const extendedFileName = `${
      file.name.split(".")[0]
    }-${randomWords}.${file.name.split(".").pop()}`;
    const storageRef = ref(storage, `documents/${extendedFileName}`);

    try {
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);

      const docRef = await addDoc(
        collection(db, "org", usersOrg, "docRequests"),
        {
          title,
          summary: content,
          label,
          fileName: extendedFileName,
          fileType: file.type,
          fileURL,
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
      <div className="lg:w-2/3 flex flex-col space-y-6 p-6 bg-background shadow-md rounded-lg flex-grow">
        <h1 className="text-3xl mb-1">Add Document</h1>
        <p className="text-muted-foreground">
          Add a document to your organization
        </p>
        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
          />
        </div>
        {/* Content Input */}
        <div className="space-y-2">
          <Label htmlFor="content">Summary</Label>
          <Textarea
            className="h-32"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter document content"
          />
        </div>
        {/* Document Type Select */}
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type</Label>
          <Select onValueChange={(value) => setLabel(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Document Type" />
            </SelectTrigger>
            <SelectContent>
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
          className="border-dashed border-2 p-4 rounded-md text-center bg-background cursor-pointer"
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer text-primary">
            Drag and drop a file here, or click to select a file
          </label>
          {file && (
            <div className="mt-4 text-muted-foreground">
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
            {/* <Button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Document
            </Button> */}
            <AlertDialog>
              <AlertDialogTrigger
                disabled={title === "" || content === "" || label === ""}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-600 text-white hover:bg-primary/90 h-10 px-4 py-2"
              >
                Add Document
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="flex flex-col gap-2">
                    Do you want to add this document?
                    <span>Title:{title}</span>
                    <span>Summary: {content.substring(0, 50) + "..."}</span>
                    <span>Label: {label}</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              type="button"
              onClick={handleViewDocument}
              variant="default"
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
      </div>

      {/* Preview Section */}
      <div className="lg:w-1/3 bg-background shadow-md rounded-lg p-4 flex flex-col flex-grow">
        <h2 className="text-lg font-medium text-primary">Document Preview</h2>
        {file ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>Title:</strong> {title || "Untitled"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <strong>Summary:</strong>{" "}
              {content
                ? content.substring(0, 100) + "..."
                : "No content available"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
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
