import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Copy,
  FileIcon,
  Info,
  LoaderCircle,
  Pencil,
  SquareArrowOutUpRightIcon,
  Star,
  Trash,
} from "lucide-react";
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
  handleAddToFavourites: (doc: DocRequest, isFavourite: boolean) => void,
  loadingAction: boolean,
  usersOrg: string,
  isAdmin: boolean,
  userId: string,
  assignedDocs: { docUrl: string; message: string }[]
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
    cell: ({ row }) => {
      const fileName = row.getValue("fileName") as string;
      const isAssignedToMe = assignedDocs.some(
        (doc) =>
          doc.docUrl ===
          fileName + "?orgName=" + encodeURIComponent(row.original.org)
      );
      return (
        <div className="flex items-center space-x-2">
          <span>
            {row.original.title}
          </span>
          {isAssignedToMe && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-6 h-6 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  This document is assigned to you.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    id: "fileName",
    accessorKey: "fileName",
    header: "",
    cell: ({ row }) => {
      const fileName = row.getValue("fileName") as string;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" className="text-blue-500 hidden-on-row">
            <Link
              className="flex items-center space-x-2"
              href={`/docs/${fileName}?orgName=${encodeURIComponent(
                row.original.org
              )}`}
            >
              <FileIcon className="mr-1" />
              View Doc
            </Link>
          </Button>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isFavourite = row.original.favoritedBy?.includes(userId);

      return (
        <div className="flex space-x-4 justify-self-end hidden-on-row">
          {(usersOrg === row.original.org || isAdmin) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  className="transition-transform transform hover:scale-125 duration-300 ease-in-out"
                  onClick={() => handleModifyDoc(row.original)}
                >
                  <Pencil strokeWidth={1} />
                </TooltipTrigger>
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="transition-transform transform hover:scale-125 duration-300 ease-in-out">
                <a target="_blank" href={row.original.fileURL}>
                  <SquareArrowOutUpRightIcon strokeWidth={1} />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open in new tab</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="transition-transform transform hover:scale-125 duration-300 ease-in-out"
                onClick={() => handleAddToFavourites(row.original, isFavourite)}
              >
                <Star fill={isFavourite ? "gold" : "none"} strokeWidth={1} />
              </TooltipTrigger>
              <TooltipContent>
                {!isFavourite ? (
                  <p>Add to favorites</p>
                ) : (
                  <p>Remove from favorites</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {(usersOrg === row.original.org || isAdmin) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="transition-transform transform hover:scale-125 duration-300 ease-in-out">
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
