"use client";

import { Check, Dot } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useAuth } from "@/context/AuthContext";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Notifs } from "@/context/AuthContext";
import "../app/globals.css";
import Link from "next/link";
import { db } from "@/config/firebaseConfig";
import { doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";

interface NotificationsProps {
  closeNotifs: () => void;
}

const Notifications = forwardRef<HTMLDivElement, NotificationsProps>(({ closeNotifs }, ref) => {
  const { usersNotifs } = useAuth();
  const { usersUnreadNotifs } = useAuth();
  const { user } = useAuth();
  const [data, setData] = useState<Notifs[]>([]);
  const { handleViewNotifications } = useAuth();
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log("usersNotifs: ", usersNotifs);
    setData(usersNotifs);
  }, [usersNotifs]);

  useEffect(() => {
    data && console.log(data);
  }, [data]);

  const handleClickOutside = (event: MouseEvent) => {
    const clickedOutsideNotifications =
      (notifRef && 'current' in notifRef && notifRef.current) &&
      !notifRef.current.contains(event.target as Node);

    if (clickedOutsideNotifications) {
      closeNotifs();
      handleViewNotifications(false);
    };
  };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  const handleViewNotif = async (notif: Notifs) => {
    try {
      if (user) {
        const notifRef = doc(db, "users", user.uid, "notifications", notif.id);
        const notifData = await getDoc(notifRef);
        const notifDetails = notifData.data();
        if (notifDetails) {
          await updateDoc(notifRef, { read: true });
        }
        setData(data.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
        closeNotifs();
        handleViewNotifications(false);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (user) {
        const batch = writeBatch(db);
        data.forEach((notif) => {
          const notifRef = doc(
            db,
            "users",
            user.uid,
            "notifications",
            notif.id
          );
          batch.update(notifRef, { read: true });
        });
        await batch.commit();
        setData(data.map((n) => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <AnimatePresence>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10">
      <Card className="w-[600px] shadow-lg rounded-lg" ref={notifRef}>
        <CardHeader className="p-4">
          <CardTitle className="leading-8 text-xl font-semibold">
            Notifications
          </CardTitle>
          <CardDescription className="text-sm">
            You have {usersUnreadNotifs} unread notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 max-h-80 overflow-y-auto custom-scrollbar">
          {data.map((notif, index) => (
            <div
              key={index}
              className={`${
                !notif.read ? "bg-secondary" : ""
              } rounded-lg mb-2 text-muted-foreground hover:text-secondary-foreground flex items-center space-x-2 cursor-pointer hover:scale-105 transform transition-all`}
            >
              {!notif.read ? (
                <Dot className="w-14 h-14 text-blue-600" />
              ) : (
                <Dot className="w-14 h-14 text-gray-400" />
              )}
              <Link
                href={`/docs/${notif.documentURL ? notif.documentURL : ""}`}
                onClick={() => handleViewNotif(notif)}
                className="flex flex-col m-2 w-4/5"
              >
                <span>
                  {notif.title}
                  {": "}
                  {notif.message}
                </span>
                <span className="text-xs">
                  {new Date(notif.createdAt).toLocaleDateString("en-GB")}{" "}
                  {new Date(notif.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Link>
            </div>
          ))}
        </CardContent>
        <Button onClick={markAllAsRead} className="w-[calc(100%-1rem)] m-2" variant="secondary">
          <Check className="w-4 h-4 mr-2" />
          Mark All as Read
        </Button>
      </Card>
    </motion.div>
    </AnimatePresence>
  );
});

Notifications.displayName = "Notifications";
export default Notifications;
