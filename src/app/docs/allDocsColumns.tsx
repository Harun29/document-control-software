import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Copy, LoaderCircle, Pencil, Trash } from "lucide-react";
import { DocRequest } from "./types";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

export const columns = (
  handleDeleteDoc: (doc: DocRequest) => void,
  handleModifyDoc: (doc: DocRequest) => void,
  loadingAction: boolean
): ColumnDef<DocRequest>[] => [
  {
    accessorKey: "fileType",
    header: "File Type",
    cell: ({ row }) => {
      const fileType = row.getValue("fileType");

      if (fileType === "application/pdf") {
        return <FaFilePdf className="w-6 h-6 text-red-500" />;
      }

      return <FaFileWord className="w-6 h-6" />;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string | number | Date;
      const date = (createdAt as any).toDate();
      return (
        <div>
          {isNaN(date.getTime())
            ? "Invalid Date"
            : date.toLocaleString("en-GB")}
        </div>
      );
    },
  },
  {
    accessorKey: "reqBy",
    header: "Requested By",
  },
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    id: "fileName",
    accessorKey: "fileName",
    header: "",
    cell: ({ row }) => {
      const fileName = row.getValue("fileName") as string;
      return (
        <Button variant="ghost" className="text-blue-500">
          <Link href={`/docs/${fileName}`}>View Doc</Link>
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex space-x-4 justify-self-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="transition-transform transform hover:scale-125 duration-300 ease-in-out"
                onClick={() => handleModifyDoc(row.original)}
              >
                <Pencil strokeWidth={1} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Modify</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="transition-transform transform hover:scale-125 duration-300 ease-in-out"
                onClick={() =>
                  navigator.clipboard.writeText(row.original.fileURL)
                }
              >
                <Copy strokeWidth={1} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="transition-transform transform hover:scale-125 duration-300 ease-in-out"
                onClick={() => handleDeleteDoc(row.original)}
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription className="flex flex-col gap-2">
                        Do you want to delete this document?{" "}
                        {row.original?.title}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={loadingAction}
                        onClick={() => handleDeleteDoc(row.original!)}
                      >
                        {loadingAction && (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        )}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];
