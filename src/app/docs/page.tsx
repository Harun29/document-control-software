"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import AllDocumentsTable from "./allDocsTable";

const ManageDocs = () => {
  return (
    <div className="w-full p-10">
      <h1 className="text-3xl mb-1 flex">
        <FileText className="w-8 h-8 mr-2" />
        Documents
      </h1>
      <p className="text-[#505050]">View and manage all documents</p>
      <div className="flex items-center py-4">
        <Tabs defaultValue="alldocuments" className="w-full">
          <TabsList className="flex justify-evenly">
            <TabsTrigger value="alldocuments">All Documents</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="it">IT</TabsTrigger>
          </TabsList>
          <TabsContent value="alldocuments">
            <AllDocumentsTable />
          </TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManageDocs;
