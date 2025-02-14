"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus2, Files, FileText, Folder, Star, Terminal, User2 } from "lucide-react";
import AllDocumentsTable from "./allDocsTable";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { AnimatePresence, motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const ManageDocs = () => {
  const [orgs, setOrgs] = useState<string[]>([]);
  const { isAdmin } = useAuth();
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgsRef = collection(db, "org");
        const querySnapshot = await getDocs(orgsRef);
        const orgs = querySnapshot.docs.map((doc) => doc.data().name);
        setOrgs(orgs as string[]);
      } catch (err) {
        console.error("Error fetching departments: ", err);
      }
    };
    fetchOrgs();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "0", opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full p-10"
      >
        <h1 className="text-3xl mb-1 flex">
          <FileText className="w-8 h-8 mr-2" />
          Documents
        </h1>
        <p className="text-[#505050]">View and manage all documents</p>
        <div className="flex items-center py-4">
          <Tabs defaultValue="alldocuments" className="w-full">
            <TabsList className="flex justify-between h-auto">
              <div className="grid grid-cols-8 justify-start space-x-2">
              <TabsTrigger value="alldocuments">
                <Files className="w-4 h-4 mr-2" />
                All Documents
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="w-4 h-4 mr-2" />
                Favorites
              </TabsTrigger>
              {!isAdmin && <TabsTrigger value="mydocuments">
                <User2 className="w-4 h-4 mr-2" />
                My Documents
              </TabsTrigger>}
              {orgs.map((org) => (
                <TabsTrigger key={org} value={org}>
                  <Folder className="w-4 h-4 mr-2" />
                  {org}
                </TabsTrigger>
              ))}
              </div>
              {!isAdmin && <Link href="/docs/create">
                <Button variant="default" className="ml-4">
                  <FilePlus2 className="w-4 h-4 mr-2" />
                  Create Document
                </Button>
              </Link>}
            </TabsList>
            <TabsContent value="alldocuments">
              <AllDocumentsTable org="" />
            </TabsContent>
            <TabsContent value="mydocuments">
              <AllDocumentsTable org="mydocuments" />
            </TabsContent>
            <TabsContent value="favorites">
              <AllDocumentsTable org="favorites" />
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  You will recieve a notification when a document from favorites is modified, deleted or sent to another department.
                </AlertDescription>
              </Alert>
          
            </TabsContent>
            {orgs.map((org) => (
              <TabsContent key={org} value={org}>
                <AllDocumentsTable org={org} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ManageDocs;
