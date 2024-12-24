import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Copy, MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocRequest } from "./types";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import Link from "next/link";

export const columns = (
  handleModifyDoc: (doc: DocRequest) => void,
  handleDeleteDocs: (doc: DocRequest) => void
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
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string | number | Date;
      const date = (createdAt as any).toDate();
      return <div>{isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString()}</div>;
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
        </Button>)
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const doc = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(doc.fileURL)}
            >
              <Copy />
              Copy File URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteDocs(doc)}>
              <Trash />
              Delete Document
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleModifyDoc(doc)}>
              <Pencil />
              Modify Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
