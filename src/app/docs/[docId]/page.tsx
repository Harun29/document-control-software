"use client";

import { Label } from "@/components/ui/label";
import { useGeneral } from "@/context/GeneralContext";
import {
  ChevronLeft,
  Copy,
  FileSymlink,
  HistoryIcon,
  LoaderCircle,
  Pencil,
  SquareArrowOutUpRight,
  Trash,
  UserRoundPlus,
} from "lucide-react";
import { useState, useEffect, useRef, use } from "react";
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
import DocumentReviewDrawer from "../modifyDoc";
import {
  collection,
  query,
  where,
  doc,
  getDocs,
  updateDoc,
  Timestamp,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
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

const ManageDocs = ({ params }: { params: Promise<{ docId: string }> }) => {
  const { docs } = useGeneral();
  const { deleteDocument } = useGeneral();
  const { user } = useAuth();
  const [docId, setDocId] = useState<string | null>(null);
  const [document, setDocument] = useState<DocRequest>();
  const [loading, setLoading] = useState(false);
  const [newDocVersion, setNewDocVersion] = useState<DocRequest | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const closeDrawerRef = useRef<HTMLButtonElement>(null);

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
      setDocument(doc);
    }
    setLoading(false);
  }, [docs, docId]);

  const handleModifyDoc = () => {
    if (drawerTriggerRef.current) {
      drawerTriggerRef.current.click();
      setNewDocVersion(document as DocRequest);
    }
    console.log("Modify document:", doc);
  };

  const handleDeleteDoc = async (document: DocRequest) => {
    try {
      setLoadingAction(true);
      const docsRef = collection(db, "org", document.orgID, "docs");
      const q = query(docsRef, where("fileName", "==", document.fileName));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      await deleteDocument(document.fileName);

      const historyRef = collection(db, "history");
      await addDoc(historyRef, {
        author: user?.userInfo?.email || "Unknown",
        action: "Modified a document",
        result: document?.title || document.title,
        timestamp: serverTimestamp(),
      });

      window.history.back();
      toast.success("Document deleted successfully");
      setLoadingAction(false);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

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
              {document?.fileType === "application/pdf" ? (
                <FaFilePdf className="w-8 h-8 mr-2 text-red-500" />
              ) : (
                <FaFileWord className="w-8 h-8 mr-2" />
              )}
              Document - {document?.title}
            </h1>
            <p className="text-muted-foreground">
              View and manage document details
            </p>
            <div className="flex space-x-4 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">{document?.title}</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Document Title</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">
                      {document?.createdAt
                        ? (document.createdAt as any)
                            .toDate()
                            .toLocaleDateString("en-GB")
                        : "Date not available"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Date Added</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">
                      {document?.org || "Unknown"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Document Department</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">{document?.label}</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Document Type</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Summary</Label>
              <p>{document?.summary}</p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={handleModifyDoc}
                className="group flex items-center"
              >
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
              <Button
                onClick={() =>
                  document?.fileURL &&
                  navigator.clipboard.writeText(document.fileURL)
                }
                className="group flex items-center"
              >
                <Copy className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  Copy URL
                </span>
              </Button>
              <a target="_blank" href={document?.fileURL}>
                <Button className="group flex items-center">
                  <SquareArrowOutUpRight className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                  <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                    Open In New Tab
                  </span>
                </Button>
              </a>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="group flex items-center"
                  >
                    <Trash className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                    <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                      Delete
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="flex flex-col gap-2">
                      Do you want to delete this document? {document?.title}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={loadingAction}
                      onClick={() => handleDeleteDoc(document!)}
                    >
                      {loadingAction && (
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                      )}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="lg:w-1/3 bg-background shadow-md p-4 flex flex-col flex-grow">
            <h2 className="text-lg font-medium text-primary">
              Document Preview
            </h2>
            <>
              {/* Scrollable Viewer */}
              <div className="flex-grow h-[400px] overflow-auto border mt-4 rounded-md pt-4 pb-4">
                {document?.fileType === "application/pdf" && (
                  <Worker
                    workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
                  >
                    <Viewer fileUrl={document?.fileURL} />
                  </Worker>
                )}
                {document?.fileType ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
                  <DocViewer
                    documents={[{ uri: document?.fileURL }] as any}
                    pluginRenderers={DocViewerRenderers}
                  />
                )}
              </div>
            </>
            <DocumentReviewDrawer
              drawerTriggerRef={drawerTriggerRef}
              closeDrawerRef={closeDrawerRef}
              selectedDoc={document as DocRequest}
              newDocVersion={newDocVersion}
              setNewDocVersion={setNewDocVersion}
              handleDeleteDoc={handleDeleteDoc}
              loadingAction={loadingAction}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
};

export default ManageDocs;
