import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { BookCheck } from "lucide-react";

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
  handleReviewDoc: (doc: DocRequest) => void
): ColumnDef<DocRequest>[] => [
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>,
  },
  {
    accessorKey: "reqBy",
    header: "Requested By",
  },
  {
    accessorKey: "fileURL",
    header: "File URL",
    cell: ({ row }) => (
      <a href={row.getValue("fileURL")} target="_blank" rel="noopener noreferrer">
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
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button variant="outline" onClick={() => handleReviewDoc(row.original)}>
        <BookCheck className="w-4 h-4" />
          Review
        </Button>
      </div>
    ),
  },
];
