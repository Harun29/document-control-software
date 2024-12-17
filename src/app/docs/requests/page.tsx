"use client";

import { useGeneral } from "@/context/GeneralContext";
import { useState, useEffect, useRef } from "react";
import { columns, DocRequest } from "./columns";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircleIcon, CheckCircle2, ChevronDown, FileTextIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DocRequests = () => {
  const { docRequests } = useGeneral();
  const [data, setData] = useState<DocRequest[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocRequest | null>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchDocRequests = async () => {
      try {
        setData(docRequests);
      } catch (error) {
        console.error("Error fetching doc requests: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocRequests();
  }, [docRequests]);

  const handleReviewDoc = (doc: DocRequest) => {
    setSelectedDoc(doc);
    if (drawerTriggerRef.current) {
      drawerTriggerRef.current.click();
    }
    console.log("Review document:", doc);
  };

  const table = useReactTable({
    data,
    columns: columns(handleReviewDoc),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (loading) {
    return (
      <div className="w-full p-10">
        <h1 className="text-3xl mb-1">Document Requests</h1>
        <p className="text-[#505050]">
          View, modify and accept document requests.
        </p>
        <div className="flex items-center py-4">
          <Skeleton className="max-w-sm h-10" />
          <Skeleton className="w-32 h-10" />
          <Skeleton className="ml-5 w-32 h-10" />
        </div>
        <Skeleton className="mb-5 w-full h-24" />
        <Skeleton className="mb-5 w-full h-24" />
        <Skeleton className="mb-5 w-full h-24" />
        <Skeleton className="w-full h-24" />
      </div>
    );
  }

  return (
    <div className="w-full p-10">
      <h1 className="text-3xl mb-1">Document Requests</h1>
      <p className="text-[#505050]">
        View, modify and accept document requests.
      </p>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter documents by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s) found.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      <Drawer>
        <DrawerTrigger>
          <Button ref={drawerTriggerRef} variant="outline" className="hidden">
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerClose />
          <DrawerHeader>
            <DrawerTitle>Document Review</DrawerTitle>
            <DrawerDescription>
              Review and accept the document request.
            </DrawerDescription>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>Title:</strong> {selectedDoc?.title || "Untitled"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <strong>Requested At:</strong> {"29. 03. 2001."}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <strong>Author:</strong> {selectedDoc?.reqBy || "Unknown"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <strong>Label:</strong>{" "}
              {selectedDoc?.label || "No label available"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <strong>File Name:</strong>{" "}
              {selectedDoc?.fileName || "No file name available"}
            </p>
            <strong className="text-muted-foreground">Summary:</strong>{" "}
            <Textarea className="h-48 mt-1 text-sm text-muted-foreground">
              {selectedDoc?.summary
                ? selectedDoc.summary
                : "No content available"}
            </Textarea>
            {/* Scrollable Viewer */}
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
                    Accept
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription className="flex flex-col gap-2">
                        Do you want to accept this document?
                        <span>Title:{selectedDoc?.title}</span>
                        <span>By: {selectedDoc?.reqBy}</span>
                        <span>Label: {selectedDoc?.label}</span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {}}>
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <ArrowLeftCircleIcon className="w-4 h-4" />
                    Return Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      Return the document to the requester {selectedDoc?.reqBy} with a note:
                    </DialogDescription>
                    <Textarea></Textarea>
                  </DialogHeader>
                  <DialogFooter className="sm:justify-start">
                    <Button>
                      Confirm
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default DocRequests;
