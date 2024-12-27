import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Copy, Pencil, Trash } from "lucide-react";
import { DocRequest } from "./types";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const columns = (
  handleDeleteDocs: (doc: DocRequest) => void,
  handleModifyDoc: (doc: DocRequest) => void
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
          {isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString()}
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
              <Pencil strokeWidth={1}/>
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
              onClick={() => navigator.clipboard.writeText(row.original.fileURL)}
            >
              <Copy strokeWidth={1}/>
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
              onClick={() => handleDeleteDocs(row.original)}
            >
              <Trash color="red" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Document</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      );
    },
  },
];
