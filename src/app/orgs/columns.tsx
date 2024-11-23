"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Copy, MoreHorizontal, Pencil, Trash, User2, Users2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export type Orgs = {
  id: string;
  name: string;
  description: string;
  users: string[]; // Array of user IDs or names
  docs: string[]; // Array of document names or IDs
};

export const orgsColumns: ColumnDef<Orgs>[] = [
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
    cell: ({ row }) => {
      const users = row.getValue("users") as string[];
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
              users.map((user, index) => (
                <DropdownMenuItem key={index}>
                  <User2 />
                  {user}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No users</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "docs",
    header: "Documents",
    cell: ({ row }) => {
      const docs = row.getValue("docs") as string[];
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
              docs.map((doc, index) => (
                <DropdownMenuItem key={index}>
                  <Copy />
                  {doc}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No docs</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
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
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Users2 />
              View org details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash />
              Delete org
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil />
              Modify org
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];