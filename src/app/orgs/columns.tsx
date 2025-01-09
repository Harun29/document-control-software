"use client";

import { useEffect, useRef, useState } from "react";
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
  Mail,
  IdCard,
  PlusCircle,
  UserPlus2Icon,
  Search,
  Star,
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CreateUserCard from "@/components/create-user-card";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";

export type Orgs = {
  id: string;
  name: string;
  description: string;
  users: string[];
  docs: string[];
};

const UsersCell = ({ orgUsers }: { orgUsers: string[] }) => {
  const [users, setUsers] = useState<
    {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      org: string;
    }[]
  >([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await Promise.all(
        orgUsers.map(async (userId) => {
          const userDoc = await getDoc(doc(db, "users", userId));
          return { id: userDoc.id, ...userDoc.data() } as {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: string;
            org: string;
          };
        })
      );
      setUsers(usersList);
    };

    fetchUsers();
  }, [orgUsers]);

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <Button variant="ghost">View</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">
              All users in this department
            </DialogTitle>
            <div className="flex items-center mb-3">
              <Input
                placeholder="Search users..."
                className="m-2"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.email}
                    className="hover:bg-secondary px-2 py-3 rounded-md"
                  >
                    <div className="flex mb-3 items-center">
                      <Avatar className="mr-2">
                        <AvatarFallback>
                          <User2 />
                        </AvatarFallback>
                      </Avatar>
                      <strong>
                        {user.firstName} {user.lastName}
                      </strong>
                    </div>
                    <div className="ml-2">
                      <div className="flex mb-2">
                        <Mail />
                        <span className="ml-2">{user.email}</span>
                      </div>
                      <div className="flex">
                        <IdCard />
                        <span className="ml-2">{user.role}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div>No users</div>
              )}
            </div>
          </DialogHeader>
          <DialogFooter className="flex">
            <Dialog>
              <DialogTrigger className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-600 text-white hover:bg-blue-800 h-10 px-4 py-2">
                <UserPlus2Icon />
                Create new user
              </DialogTrigger>
              <DialogContent className="w-auto h-auto">
                <VisuallyHidden.Root>
                  <DialogTitle></DialogTitle>
                </VisuallyHidden.Root>
                <CreateUserCard />
              </DialogContent>
            </Dialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
