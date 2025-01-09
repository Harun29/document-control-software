"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Files, FileText, Star, Terminal } from "lucide-react";
import AllDocumentsTable from "./allDocsTable";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { AnimatePresence, motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ManageDocs = () => {
  const [orgs, setOrgs] = useState<string[]>([]);
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
            <TabsList className="flex justify-start space-x-4">
              <TabsTrigger value="alldocuments">
                <Files className="w-4 h-4 mr-2" />
                All Documents
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="w-4 h-4 mr-2" />
                Favorites
              </TabsTrigger>
              {orgs.map((org) => (
                <TabsTrigger key={org} value={org}>
                  {org}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="alldocuments">
              <AllDocumentsTable org="" />
            </TabsContent>
            <TabsContent value="favorites">
              <AllDocumentsTable org="favorites" />
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  You will recieve a notification when from favorites is modified, deletet or sent to another department.
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
