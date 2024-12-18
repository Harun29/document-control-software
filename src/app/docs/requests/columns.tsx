import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { BookCheck, CheckCircle2, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type DocRequest = {
  createdAt: string;
  fileName: string;
  fileType: string;
  fileURL: string;
  label: string;
  status: string;
  summary: string;
  title: string;
  reqBy: string;
};

export const columns = (
  handleReviewDoc: (doc: DocRequest) => void,
  handleAcceptDoc: (selectedDoc: DocRequest, newDoc: DocRequest | null) => Promise<void>,
  handleReturnDoc: (doc: DocRequest) => void
): ColumnDef<DocRequest>[] => [
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "reqBy",
    header: "Requested By",
  },
  {
    accessorKey: "fileURL",
    header: "File URL",
    cell: ({ row }) => (
      <a
        href={row.getValue("fileURL")}
        target="_blank"
        rel="noopener noreferrer"
      >
        View File
      </a>
    ),
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
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-4 justify-self-end">
        <Button variant="outline" onClick={() => handleReviewDoc(row.original)}>
          <BookCheck className="w-4 h-4" />
          Review
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="transition-transform transform hover:scale-125 duration-300 ease-in-out"
              onClick={() => handleAcceptDoc(row.original, null)}
            >
              <CheckCircle2 color="green" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Quick Accept</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="transition-transform transform hover:scale-125 duration-300 ease-in-out"
              onClick={() => handleReturnDoc(row.original)}
            >
              <XCircle color="red" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Quick Return</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
  },
];
