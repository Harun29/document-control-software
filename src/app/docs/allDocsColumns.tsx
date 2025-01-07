import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Copy, LoaderCircle, Pencil, Trash } from "lucide-react";
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
  loadingAction: boolean,
  usersOrg: string
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string | number | Date;
      const date = (createdAt as any).toDate();
      return (
        <div>
          {isNaN(date.getTime())
            ? "Invalid Date"
            : date.toLocaleString("en-GB", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
        </div>
      );
    },
  },
  {
    accessorKey: "reqBy",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submited By
          <ArrowUpDown />
        </Button>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "label",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Label
          <ArrowUpDown />
        </Button>
      );
    },
    enableSorting: true,
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
          <Link
            href={`/docs/${fileName}?orgName=${encodeURIComponent(
              row.original.org
            )}`}
          >
            View Doc
          </Link>
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      console.log(row.original.orgID, usersOrg);
      return (
        <div className="flex space-x-4 justify-self-end">
          {usersOrg === row.original.org && (
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
          )}
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
          {usersOrg === row.original.org && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  className="transition-transform transform hover:scale-125 duration-300 ease-in-out"
                  
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
          )}
        </div>
      );
    },
  },
];
