"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { collection, getDocs } from "firebase/firestore";
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
    const fetchRequests = async () => {
      const requests = await getDocs(collection(db, "org", usersOrg, "docRequests"));
      const newDocRequests = requests.docs.map((doc) => doc.data());
      setDocRequests(newDocRequests);
      setNumberOfRequests(newDocRequests.length)
    };

    if (isEditor) {
      fetchRequests();
    }
    console.log("is editor: ", isEditor);
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
