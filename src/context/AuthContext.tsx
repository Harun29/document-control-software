"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig"; // Ensure Firestore and Auth are configured
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

interface AuthContextProps {
  user: (User & { userInfo?: any }) | null; // Include optional userInfo
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createUser: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
    org: string,
    orgName: string
  ) => Promise<void>; // Add createUser function
  deleteUser: (userId: string, email: string) => Promise<void>; // Add deleteUser function
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & { userInfo?: any }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const functions = getFunctions(); // Initialize Cloud Functions

  const fetchUserInfo = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log("User document data:", userDoc.data());
        return userDoc.data();
      } else {
        console.log("No such user document in Firestore");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  };

  const createUser = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
    org: string,
    orgName: string
  ) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No user is currently logged in.");
      }
  
      if (!isAdmin) {
        throw new Error("User does not have admin privileges to create another user.");
      }
  
      const createUserFunction = httpsCallable(functions, "createUser");
      await createUserFunction({
        email,
        password,
        firstName,
        lastName,
        role,
        org,
        orgName
      });

      try {
        await addDoc(collection(db, "history"), {
          author: user?.userInfo?.email || "Unknown",
          action: "created user",
          result: email,
          timestamp: serverTimestamp(),
        });
        console.log("History record added to Firestore");
      } catch (historyError) {
        console.error("Error adding history record: ", historyError);
      }
  
      console.log("User created successfully via Cloud Function");
    } catch (error) {
      console.error("Error creating user: ", error);
      throw error;
    }
  };
  

  const deleteUser = async (userId: string, email: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No user is currently logged in.");
      }

      const deleteUserFunction = httpsCallable(functions, "deleteUser");
      await deleteUserFunction({ userId });

      try {
        await addDoc(collection(db, "history"), {
          author: user?.userInfo?.email || "Unknown",
          action: "deleted user",
          result: email,
          timestamp: serverTimestamp(),
        });
        console.log("History record added to Firestore");
      } catch (historyError) {
        console.error("Error adding history record: ", historyError);
      }

      console.log("User deleted successfully via Cloud Function");
    } catch (error) {
      console.error("Error deleting user: ", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userInfo = await fetchUserInfo(currentUser.uid);
          const idTokenResult = await currentUser.getIdTokenResult();
          setIsAdmin(!!idTokenResult.claims.admin);
          console.log("isAdmin in context: ", !!idTokenResult.claims.admin);
          setUser({ ...currentUser, userInfo });
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          setUser(currentUser);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        createUser,
        deleteUser,
        loading,
        isAdmin,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
