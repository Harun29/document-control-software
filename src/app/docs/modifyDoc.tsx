"use client";

import React from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileTextIcon } from "lucide-react";

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
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { DocRequest } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

interface DocumentReviewDrawerProps {
  drawerTriggerRef: React.RefObject<HTMLButtonElement>;
  closeDrawerRef: React.RefObject<HTMLButtonElement>;
  selectedDoc: DocRequest | null;
  setNewDocVersion: (docVersion: DocRequest) => void;
  newDocVersion: any;
  handleConfirmModifyDoc: (
    selectedDoc: DocRequest,
    newDocVersion: DocRequest
  ) => void;
}

const DocumentReviewDrawer: React.FC<DocumentReviewDrawerProps> = ({
  drawerTriggerRef,
  closeDrawerRef,
  selectedDoc,
  setNewDocVersion,
  newDocVersion,
  handleConfirmModifyDoc,
}) => {
  return (
    <Drawer>
      <DrawerTrigger>
        <Button
          ref={drawerTriggerRef}
          variant="outline"
          className="hidden"
        ></Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerClose ref={closeDrawerRef} />
        <DrawerHeader>
          <DrawerTitle>Modify Document</DrawerTitle>
          <DrawerDescription>
            Modify the document details and save the changes.
          </DrawerDescription>
          <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
            <strong>Title:</strong>
            <Input
              defaultValue={selectedDoc?.title || "Untitled"}
              onChange={(e) =>
                setNewDocVersion(
                  newDocVersion
                    ? { ...newDocVersion, title: e.target.value }
                    : null
                )
              }
            />
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <strong>File Name:</strong>{" "}
            {selectedDoc?.fileName || "No file name available"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <strong>Requested At:</strong> {"29. 03. 2001."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <strong>Author:</strong> {selectedDoc?.reqBy || "Unknown"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
            <strong>Label:</strong>
            <Select
              onValueChange={(value: any) =>
                setNewDocVersion(
                  newDocVersion ? { ...newDocVersion, label: value } : null
                )
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={selectedDoc?.label || "No label available"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="memo">Memo</SelectItem>
              </SelectContent>
            </Select>
          </p>
          <strong className="text-muted-foreground">Summary:</strong>
          <Textarea
            onChange={(e) =>
              setNewDocVersion(
                newDocVersion
                  ? { ...newDocVersion, summary: e.target.value }
                  : null
              )
            }
            className="h-32 mt-1 text-sm text-muted-foreground"
            value={
              selectedDoc?.summary
                ? selectedDoc.summary
                : "No content available"
            }
          />
          <div className="flex-grow h-[400px] overflow-auto border my-4 rounded-md pt-4 pb-4">
            {selectedDoc?.fileType === "application/pdf" && (
              <Worker
                workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
              >
                <Viewer fileUrl={selectedDoc?.fileURL} />
              </Worker>
            )}
            {selectedDoc?.fileType ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
              <DocViewer
                documents={[{ uri: selectedDoc?.fileURL }]}
                pluginRenderers={DocViewerRenderers}
              />
            )}
          </div>
          <div className="flex justify-between">
            <div className="gap-4 flex">
              <AlertDialog>
                <AlertDialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-600 text-white hover:bg-blue-800 h-10 px-4 py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Save
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="flex flex-col gap-2">
                      Do you want to save these changes?
                      <span>Title:{selectedDoc?.title}</span>
                      <span>By: {selectedDoc?.reqBy}</span>
                      <span>Label: {selectedDoc?.label}</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        handleConfirmModifyDoc(selectedDoc!, newDocVersion)
                      }
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <a
                href={selectedDoc?.fileURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="default">
                  <FileTextIcon className="w-4 h-4" />
                  View
                </Button>
              </a>
            </div>
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default DocumentReviewDrawer;