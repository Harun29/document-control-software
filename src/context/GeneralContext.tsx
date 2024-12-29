"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

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
  reqByID: string;
  org: string;
  orgID: string;
};

interface GeneralContextProps {
  docRequests: DocRequest[];
  numberOfRequests: number;
  docs: DocRequest[];
  createDoc: (doc: DocRequest) => Promise<void>;
  updateDocument: (
    fileName: string,
    updatedDoc: Partial<DocRequest>
  ) => Promise<void>;
  deleteDoc: (fileName: string) => Promise<void>;
  docsByOrg: DocsByOrg[];
}

export type DocsByOrg = {
  org: string;
  docs: DocRequest[];
}

const GeneralContext = createContext<GeneralContextProps | null>(null);

export const GeneralProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isEditor, usersOrg } = useAuth();
  const [docRequests, setDocRequests] = useState<DocRequest[]>([]);
  const [numberOfRequests, setNumberOfRequests] = useState(0);
  const [docs, setDocs] = useState<DocRequest[]>([]);
  const [docsByOrg, setDocsByOrg] = useState<DocsByOrg[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "org", usersOrg, "docRequests"),
      (snapshot) => {
        const newDocRequests = snapshot.docs.map(
          (doc) => doc.data() as DocRequest
        );
        setDocRequests(newDocRequests);
        setNumberOfRequests(newDocRequests.length);
      },
      (error) => {
        console.error("Error fetching doc requests: ", error);
      }
    );
    console.log("is editor: ", isEditor);
    return () => unsubscribe();
  }, [isEditor, usersOrg]);

  useEffect(() => {
    docRequests && console.log(docRequests);
  }, [docRequests]);

  useEffect(() => {
    const docRef = doc(db, "docs", "alldocs");
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Sorting documents based on createdAt field (latest to oldest)
        const sortedDocs = (data.docs || []).sort((a: DocRequest, b: DocRequest) => {
          const dateA = (a.createdAt as any).toDate();
          const dateB = (b.createdAt as any).toDate();
          return dateB.getTime() - dateA.getTime();
        });
  
        setDocs(sortedDocs);
        console.log("Sorted docs: ", sortedDocs);
  
        const orgs = await getDocs(collection(db, "org"));
        const docsByOrgPromises = orgs.docs.map(async (org) => {
          const q = query(collection(db, "org", org.id, "docs"), orderBy("createdAt", "desc"));
          const docsByOrg = await getDocs(q);
          const docs = docsByOrg.docs.map((doc) => doc.data() as DocRequest);
          return { org: org.data().name, docs };
        });
  
        const docsByOrgArray = await Promise.all(docsByOrgPromises);
        setDocsByOrg(docsByOrgArray);
  
        docsByOrgArray.forEach((docFromOrg) => {
          console.log("Docs by org: ", docFromOrg.org, docFromOrg.docs);
        });
      } else {
        console.error("No such document!");
      }
    }, (error) => {
      console.error("Error fetching docs: ", error);
    });
  
    return () => unsubscribe();
  }, []);
  

  const createDoc = async (newDoc: DocRequest) => {
    try {
      const docRef = doc(db, "docs", "alldocs");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(data);
        const updatedDocs = [...data.docs, newDoc];
        await updateDoc(docRef, { docs: updatedDocs });
        setDocs(updatedDocs);
      }
    } catch (error) {
      console.error("Error creating document: ", error);
    }
  };

  const updateDocument = async (
    fileName: string,
    updatedDoc: Partial<DocRequest>
  ) => {
    try {
      const docRef = doc(db, "docs", "alldocs");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const updatedDocs = data.docs.map((doc: DocRequest) =>
          doc.fileName === fileName ? { ...doc, ...updatedDoc } : doc
        );
        await updateDoc(docRef, { docs: updatedDocs });
        setDocs(updatedDocs);
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const deleteDoc = async (fileName: string) => {
    try {
      const docRef = doc(db, "docs", "alldocs");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const updatedDocs = data.docs.filter(
          (doc: DocRequest) => doc.fileName !== fileName
        );
        await updateDoc(docRef, { docs: updatedDocs });
        setDocs(updatedDocs);
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  return (
    <GeneralContext.Provider
      value={{
        docRequests,
        numberOfRequests,
        docs,
        createDoc,
        updateDocument,
        deleteDoc,
        docsByOrg
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export const useGeneral = () => {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error("useGeneral must be used within an GeneralProvider");
  }
  return context;
};

export default GeneralContext;
