"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

interface GeneralContextProps {
  docRequests: any[];
  numberOfRequests: number;
}

const GeneralContext = createContext<GeneralContextProps | null>(null);

export const GeneralProvider = ({ children }: { children: React.ReactNode }) => {
  const { isEditor } = useAuth();
  const { usersOrg } = useAuth();
  const [docRequests, setDocRequests] = useState<any[]>([]);
  const [numberOfRequests, setNumberOfRequests] = useState(0)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "org", usersOrg, "docRequests"),
      (snapshot) => {
        const newDocRequests = snapshot.docs.map((doc) => doc.data());
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

  return (
    <GeneralContext.Provider
      value={{
        docRequests,
        numberOfRequests
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
