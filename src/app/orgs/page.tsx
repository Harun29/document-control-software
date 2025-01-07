"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Orgs, orgsColumns } from "./columns";
import UpdateOrgCard from "../../components/update-org-card";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, PlusCircle, UsersRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteOrgDialog from "@/components/delete-org-alert";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import CreateOrgCard from "@/components/create-org-card";

const ManageOrgs = () => {
  const [data, setData] = useState<Orgs[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedOrg, setSelectedOrg] = useState<Orgs | null>(null);
  const [orgToDelete, setOrgToDelete] = useState<Orgs | null>(null);

  const handleSelectOrgToDelete = (org: Orgs) => {
    setOrgToDelete(org);
  };

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "org"));
        const orgsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Orgs[];
        setData(orgsList);
      } catch (error) {
        console.error("Error fetching departments: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  const handleModifyOrg = (org: Orgs) => {
    setSelectedOrg(org);
  };

  // const handleDeleteOrg = async (org: Orgs) => {
  //   try {
  //     if (!org.users[0]) {
  //       await deleteDoc(doc(db, "org", org.id));
  //       setData((prevData) => prevData.filter((data) => data.id !== org.id));
  //     } else {
  //       alert(
  //         "There are users in this organization. Please remove them before deleting the organization."
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error deleting organization: ", error);
  //   }
  // };

  const handleClose = () => {
    setSelectedOrg(null);
    setOrgToDelete(null);
  };

  const table = useReactTable({
    data,
    columns: orgsColumns(handleModifyOrg, handleSelectOrgToDelete),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (loading) {
    return (
      <div className="w-full p-10">
        <h1 className="text-3xl mb-1 flex">
          <UsersRound className="w-8 h-8 mr-2" />
          Manage Users
        </h1>
        <p className="text-[#505050]">View, modify and delete users.</p>
        <div className="flex items-center py-4">
          <Skeleton className="max-w-sm h-10" />
          <Skeleton className="w-32 h-10" />
          <Skeleton className="ml-5 w-32 h-10" />
        </div>
        <Skeleton className="mb-5 w-full h-24" />
        <Skeleton className="mb-5 w-full h-24" />
        <Skeleton className="mb-5 w-full h-24" />
        <Skeleton className="w-full h-24" />
      </div>
    );
  }

  return (
    <div className="w-full p-10">
      <h1 className="text-3xl mb-1 flex">
        <UsersRound className="w-8 h-8 mr-2" />
        Manage Departments
      </h1>
      <p className="text-[#505050]">View, modify and delete departments.</p>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter names..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mb-0"
        />
        <Dialog>
          <DialogTrigger className="ml-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-600 text-white hover:bg-blue-800 h-10 px-4 py-2">
            <PlusCircle />
            Create new department
          </DialogTrigger>
          <DialogContent className="w-auto h-auto">
            <VisuallyHidden>
              <DialogTitle></DialogTitle>
            </VisuallyHidden>
            <CreateOrgCard />
          </DialogContent>
        </Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={orgsColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s) found.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      {orgToDelete && (
        <DeleteOrgDialog orgToDelete={orgToDelete} onClose={handleClose} />
      )}
      {selectedOrg && <UpdateOrgCard org={selectedOrg} onClose={handleClose} />}
    </div>
  );
};

export default ManageOrgs;
