"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import AllDocumentsTable from "./allDocsTable";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

const ManageDocs = () => {
  const [orgs, setOrgs] = useState<string[]>([]);
  useEffect(() => {
    const fetchOrgs = async() => {
      try{
        const orgsRef = collection(db, "org")
        const querySnapshot = await getDocs(orgsRef);
        const orgs = querySnapshot.docs.map(doc => doc.data().name);
        setOrgs(orgs as string[]);
      }catch(err){
        console.error("Error fetching organizations: ", err)
      }
    }  
    fetchOrgs();
  }, [])

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
            {orgs.map(org => <TabsTrigger value={org}>{org}</TabsTrigger>)}
          </TabsList>
          <TabsContent value="alldocuments">
            <AllDocumentsTable org=""/>
          </TabsContent>
            {orgs.map(org => <TabsContent value={org}>
            <AllDocumentsTable org={org} />
          </TabsContent>)}
        </Tabs>
      </div>
    </div>
  );
};

export default ManageDocs;
