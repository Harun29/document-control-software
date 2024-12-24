"use client";

import { useEffect, useState } from "react";
import { columns } from "./allDocsColumns";
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
import { ChevronDown, Grid, TableIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeneral } from "@/context/GeneralContext";
import { DocRequest } from "./types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

const AllDocumentsTable = ({ org }: { org: string }) => {
  const { docs } = useGeneral();
  const {docsByOrg} = useGeneral();
  const [data, setData] = useState<DocRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [viewType, setViewType] = useState<"table" | "grid">("grid");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        if(org === ""){
          setData(docs);
        }else{
          setData(docsByOrg.find((doc) => doc.org === org)?.docs ?? []);
        }
      } catch (error) {
        console.error("Error fetching documents: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [docs, org]);

  const handleDeleteDocs = async (doc: DocRequest) => {
    console.log("Deleting doc: ", doc);
  };

  const handleModifyDoc = async (doc: DocRequest) => {
    console.log("Modifying doc: ", doc);
  };

  useEffect(() => {
    console.log(viewType);
  }, [viewType]);

  const table = useReactTable({
    data,
    columns: columns(handleDeleteDocs, handleModifyDoc),
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
      <div>
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
    <div>
      <div className="flex justify-between py-4">
        <Input
          placeholder="Search files..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <ToggleGroup
          variant="outline"
          type="single"
          value={viewType}
          onValueChange={(value) =>
            setViewType(value as unknown as "table" | "grid")
          }
        >
          <ToggleGroupItem value="table">
            <TableIcon className="w-5 h-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid">
            <Grid className="w-5 h-5" />
          </ToggleGroupItem>
        </ToggleGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
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
      {viewType === "table" && (
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
                      <TableCell className="px-4 py-2" key={cell.id}>
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
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {viewType === "table" && (
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
      )}
      {viewType === "grid" && (
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-4 py-4">
          {data.map((doc) => (
            <div
              key={doc.fileName}
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              {doc.fileType === "application/pdf" ? (
                <FaFilePdf className="text-red-500 w-16 h-16" />
              ) : (
                <FaFileWord className="text-blue-500 w-16 h-16" />
              )}

              <div className="mt-2 text-center text-sm font-medium truncate">
                {doc.title.substring(0, 15)}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllDocumentsTable;
