"use client";

import { Label } from "@/components/ui/label";
import { useGeneral } from "@/context/GeneralContext";
import {
  ChevronLeft,
  Copy,
  FileSymlink,
  HistoryIcon,
  Pencil,
  SquareArrowOutUpRight,
  Trash,
  UserRoundPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { DocRequest } from "../types";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

const ManageDocs = ({ params }: { params: Promise<{ docId: string }> }) => {
  const { docs } = useGeneral();
  const [docId, setDocId] = useState<string | null>(null);
  const [doc, setDoc] = useState<DocRequest>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setDocId(resolvedParams.docId);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    setLoading(true);
    if (docs && docId) {
      const doc = docs.find((doc) => doc.fileName === docId);
      setDoc(doc);
    }
    setLoading(false);
  }, [docs, docId]);

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: "0", opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:flex lg:space-x-6 h-full min-h-[100vh-4rem]"
        >
          <div className="lg:w-2/3 flex flex-col space-y-6 p-6 bg-background shadow-md flex-grow">
            <h1 className="text-3xl mb-0 flex">
              <ChevronLeft
                onClick={() => window.history.back()}
                className="cursor-pointer w-8 h-8 mr-2 hover:scale-125 transition-all"
              />
              {doc?.fileType === "application/pdf" ? (
                <FaFilePdf className="w-8 h-8 mr-2 text-red-500" />
              ) : (
                <FaFileWord className="w-8 h-8 mr-2" />
              )}
              Document - {doc?.title}
            </h1>
            <p className="text-muted-foreground">
              View and manage document details
            </p>
            <div className="flex space-x-4 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">{doc?.title}</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Document Title</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">{doc?.org || "Unknown"}</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Document Department</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">{doc?.label}</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Document Type</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Summary</Label>
              <p>{doc?.summary}</p>
            </div>
            <div className="flex space-x-4">
              <Button className="group flex items-center">
                <Pencil className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-1000 ease-in-out">
                  Modify
                </span>
              </Button>
              <Button className="group flex items-center">
                <HistoryIcon className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  History
                </span>
              </Button>
              <Button className="group flex items-center">
                <Copy className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  Copy URL
                </span>
              </Button>
              <Button className="group flex items-center">
                <SquareArrowOutUpRight className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  Open In New Tab
                </span>
              </Button>
              <Button className="group flex items-center">
                <FileSymlink className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  Send to other Department
                </span>
              </Button>
              <Button className="group flex items-center">
                <UserRoundPlus className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  Assign to user
                </span>
              </Button>
              <Button variant="destructive" className="group flex items-center">
                <Trash className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  Delete Document
                </span>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/3 bg-background shadow-md p-4 flex flex-col flex-grow">
            <h2 className="text-lg font-medium text-primary">
              Document Preview
            </h2>
            <>
              {/* Scrollable Viewer */}
              <div className="flex-grow h-[400px] overflow-auto border mt-4 rounded-md pt-4 pb-4">
                {doc?.fileType === "application/pdf" && (
                  <Worker
                    workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
                  >
                    <Viewer fileUrl={doc?.fileURL} />
                  </Worker>
                )}
                {doc?.fileType ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
                  <DocViewer
                    documents={[{ uri: doc?.fileURL }] as any}
                    pluginRenderers={DocViewerRenderers}
                  />
                )}
              </div>
            </>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
};

export default ManageDocs;
