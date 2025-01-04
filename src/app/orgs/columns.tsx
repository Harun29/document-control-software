"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Copy,
  MoreHorizontal,
  User2,
  FileText,
  Pencil,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export type Orgs = {
  id: string;
  name: string;
  description: string;
  users: string[];
  docs: string[];
};

// Separate component for rendering Users cell
const UsersCell = ({ orgUsers }: { orgUsers: string[] }) => {
  const [users, setUsers] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await Promise.all(
        orgUsers.map(async (userId) => {
          const userDoc = await getDoc(doc(db, "users", userId));
          return { id: userDoc.id, ...userDoc.data() } as {
            id: string;
            firstName: string;
            lastName: string;
          };
        })
      );
      setUsers(usersList);
    };

    fetchUsers();
  }, [orgUsers]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Users</DropdownMenuLabel>
        {users.length > 0 ? (
          users.map((user) => (
            <DropdownMenuItem key={user.id}>
              <User2 />
              {user.firstName} {user.lastName}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No users</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Separate component for rendering Documents cell
const DocumentsCell = ({ orgDocs }: { orgDocs: string[] }) => {
  const [docs, setDocs] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      const docsList = await Promise.all(
        orgDocs.map(async (docId) => {
          const docDoc = await getDoc(doc(db, "documents", docId));
          return { id: docDoc.id, ...docDoc.data() } as {
            id: string;
            name: string;
          };
        })
      );
      setDocs(docsList);
    };

    fetchDocs();
  }, [orgDocs]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Documents</DropdownMenuLabel>
        {docs.length > 0 ? (
          docs.map((doc) => (
            <DropdownMenuItem key={doc.id}>
              <FileText />
              {doc.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No documents</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const orgsColumns = (
  handleModifyOrg: (org: Orgs) => void,
  handleSelectOrgToDelete: (org: Orgs) => void
): ColumnDef<Orgs>[] => [
  {
    accessorKey: "id",
    header: "Org ID",
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "users",
    header: "Users",
    cell: ({ row }) => (
      <UsersCell orgUsers={row.getValue("users") as string[]} />
    ),
  },
  {
    accessorKey: "docs",
    header: "Documents",
    cell: ({ row }) => (
      <DocumentsCell orgDocs={row.getValue("docs") as string[]} />
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const org = row.original;

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
              onClick={() => navigator.clipboard.writeText(org.id)}
            >
              <Copy />
              Copy org ID
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText />
              View documents
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelectOrgToDelete(org)}>
              <Trash />
              Delete Department
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleModifyOrg(org)}>
              <Pencil />
              Modify Department
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
