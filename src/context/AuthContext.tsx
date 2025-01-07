"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig"; // Ensure Firestore and Auth are configured
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "sonner";

export interface Notifs {
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  documentURL?: string;
  documentName?: string;
  id: string; 
}

interface UserInfo {
  email: string;
  role: string;
  org: string;
  orgName: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextProps {
  user: (User & { userInfo?: UserInfo }) | null;
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
  isEditor: boolean;
  usersOrg: string;
  usersNotifs: Notifs[];
  usersNotifsNumber: number;
  usersUnreadNotifs: number;
  viewNotifications: boolean;
  handleViewNotifications: (bool: boolean) => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & { userInfo?: UserInfo }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [usersOrg, setUsersOrg] = useState("");
  const [usersNotifs, setUsersNotifs] = useState<Notifs[]>([]);
  const [usersNotifsNumber, setUsersNotifsNumber] = useState(0);
  const [usersUnreadNotifs, setUsersUnreadNotifs] = useState(0);
  const [viewNotifications, setViewNotifications] = useState(false);

  const functions = getFunctions();

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
          const q = query(collection(db, "users", currentUser.uid, "notifications"), orderBy("read", "asc"), orderBy("createdAt", "desc"));
          const usersNotifsData = await getDocs(q);
          
          if (!usersNotifsData.empty) {
            console.log("usersNotifsData: ", usersNotifsData.docs);
            const usersNotifsArray = usersNotifsData.docs.map(doc => ({
              title: doc.data().title,
              message: doc.data().message,
              createdAt: doc.data().createdAt,
              read: doc.data().read,
              documentURL: doc.data().documentURL,
              documentName: doc.data().documentName,
              id: doc.id,
            }));
            setUsersNotifs(usersNotifsArray);
            setUsersNotifsNumber(usersNotifsArray.length);
            setUsersUnreadNotifs(usersNotifsArray.filter(notif => !notif.read).length);
          } else {
            console.log("No notifications found for the user.");
            setUsersNotifs([]);
          }

          setIsAdmin(!!idTokenResult.claims.admin);
          setIsEditor(!!userInfo?.role && userInfo.role === "Editor");
          setUsersOrg(userInfo?.org);
          console.log("isAdmin in context: ", !!idTokenResult.claims.admin);
          setUser({ ...currentUser, userInfo: userInfo as UserInfo || undefined });
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          setUser(currentUser);
        }
      } else {
        console.log("No user is currently logged in.");
        setUser(null);
        setIsAdmin(false);
        setIsEditor(false);
        setUsersNotifs([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleViewNotifications = (bool: boolean) => {
    setViewNotifications(bool);
  }

  useEffect(() => {
    if (user?.uid) {
      const notifQuery = query(
        collection(db, "users", user.uid, "notifications"),
        orderBy("read", "asc"),
        orderBy("createdAt", "desc"),
      );

      const unsubscribeNotifs = onSnapshot(notifQuery, (snapshot) => {
        if (!snapshot.empty) {
          const notifications = snapshot.docs.map((doc) => ({
            ...(doc.data() as Notifs),
            id: doc.id,
          }));
          if(notifications.length !== usersNotifs.length && notifications.length > usersNotifs.length) {
            toast("You received new notification!", {
              action: {
                label: "View",
                onClick: () => handleViewNotifications(true),
              },
            })
          }
          setUsersNotifs(notifications as Notifs[]);
          setUsersNotifsNumber(notifications.length);
          setUsersUnreadNotifs(
            notifications.filter((notif) => !notif.read).length
          );
        } else {
          setUsersNotifs([]);
          setUsersNotifsNumber(0);
          setUsersUnreadNotifs(0);
        }
      });

      return () => unsubscribeNotifs();
    } else {
      setUsersNotifs([]);
      setUsersNotifsNumber(0);
      setUsersUnreadNotifs(0);
    }
  }, [user, usersNotifs.length]);

  useEffect(() => {
    console.log("Users notifications: ", usersNotifs);
  }, [usersNotifs]);

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
        isEditor,
        usersOrg,
        usersNotifs,
        usersNotifsNumber,
        usersUnreadNotifs,
        viewNotifications,
        handleViewNotifications,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
