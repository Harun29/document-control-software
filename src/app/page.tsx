"use client";
import { useRef, useState, useEffect } from "react";
import { Notifs, useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { FaFilePdf } from "react-icons/fa";
import {
  FileInput,
  FilePlus2,
  FileText,
  IdCard,
  Info,
  Mail,
  Users2,
} from "lucide-react";
import Notifications from "@/components/notifications";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Doc = {
  id: string;
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
};

export type History = {
  id: string;
  author: string;
  action: string;
  result: string;
  timestamp: { seconds: number };
};

export default function Home() {
  const [createUser, setCreateUser] = useState(false);
  const [createOrg, setCreateOrg] = useState(false);
  const createOrgRef = useRef<HTMLDivElement | null>(null);
  const createUserRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const { usersNotifs } = useAuth();
  const { usersUnreadNotifs } = useAuth();
  const { viewNotifications } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [notifications, setNotifications] = useState<Notifs[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    try {
      const fetchDocs = async () => {
        if (user) {
          if (user?.userInfo?.org) {
            // Fetch Recent Docs
            const docsQuery = query(
              collection(db, "org", user.userInfo.org, "docs"),
              limit(6),
              orderBy("createdAt", "desc")
            );
            const docsSnapshot = await getDocs(docsQuery);
            const docsList = docsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Fetch History
            const historyQuery = query(
              collection(db, "history"),
              limit(4),
              orderBy("timestamp", "desc")
            );
            const historySnapshot = await getDocs(historyQuery);
            const historyList = historySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setDocs(docsList as Doc[]);
            setHistory(historyList as History[]);
            console.log("Notifications: ", usersNotifs);
            setNotifications(usersNotifs.slice(0, 5) as Notifs[]);
          }
        }
      };

      fetchDocs();
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }, [user, usersNotifs]);

  const handleClickOutside = (event: MouseEvent) => {
    const clickedOutsideUser =
      createUserRef.current &&
      !createUserRef.current.contains(event.target as Node);
    const clickedOutsideOrg =
      createOrgRef.current &&
      !createOrgRef.current.contains(event.target as Node);

    if (clickedOutsideUser) setCreateUser(false);
    if (clickedOutsideOrg) setCreateOrg(false);
  };

  useEffect(() => {
    if (createUser || createOrg) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [createUser, createOrg]);

  return (
    <div className="p-16 pb-0 h-full">
      <div className="flex items-center justify-between mb-12 ">
        <div className="flex items-center border-2 rounded-xl p-7">
          <div className="mr-10">
            <Avatar className="w-24 h-24">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col text-xl space-y-1">
            <span className="font-bold">
              {/* <Dot className="inline-block" /> */}
              {user?.userInfo?.firstName} {user?.userInfo?.lastName}
            </span>
            <span>
              <Mail className="inline-block mr-3" />
              {user?.userInfo?.email}
            </span>
            <span>
              <IdCard className="inline-block mr-3" />
              {user?.userInfo?.role}
            </span>
            {user?.userInfo?.org && (
              <span>
                <Users2 className="inline-block mr-3" />
                {user?.userInfo?.orgName}
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-10 m-auto">
          <Link href="/docs" className="pointer hover:scale-105 transition-all">
            <div className="flex flex-col justify-center items-center">
              <FileText className="w-32 h-32 mr-2" strokeWidth={1} />
              <span className="text-2xl">Documents</span>
            </div>
          </Link>
          <Link
            href="/docs/create"
            className="pointer hover:scale-105 transition-all"
          >
            <div className="flex flex-col justify-center items-center">
              <FilePlus2 className="w-32 h-32 mr-2" strokeWidth={1} />
              <span className="text-2xl">Add Documents</span>
            </div>
          </Link>
          <Link
            href="/docs/requests"
            className="pointer hover:scale-105 transition-all"
          >
            <div className="flex flex-col justify-center items-center">
              <FileInput className="w-32 h-32 mr-2" strokeWidth={1} />
              <span className="text-2xl">Document Requests</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div
        className="grid space-x-10 border-2 rounded-xl p-10"
        style={{ gridTemplateColumns: "2fr 3fr 2fr" }}
      >
        {/* Recent Documents */}
        <div className="flex flex-col">
          <span className="text-xl font-bold mb-6">Recent</span>
          <div className="border-l-2 p-5 grid grid-cols-2 gap-x-20 gap-y-5">
            {docs.map((doc) => (
              <Link
                href={`/docs/${doc.fileName}?orgName=${doc.org}`}
                key={doc.id}
                className="flex flex-col items-center cursor-pointer hover:scale-105 transform transition-all"
              >
                {doc.fileType === "application/pdf" && (
                  <FaFilePdf className="text-red-500 w-10 h-10 me-2" />
                )}
                <div className="flex flex-col text-center">
                  <span className="truncate w-32">
                    {doc.title.substring(0, 15)}...
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {doc.reqBy}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* History Section */}
        <div className="flex flex-col">
          <span className="text-xl font-bold mb-6">History</span>
          <div className="border-l-2 p-5 space-y-2">
            {history.map((item) => (
              <div key={item.id} className="p-3 rounded-md shadow-sm">
                <span>
                  <span className="font-semibold">{item.author}</span>{" "}
                  <span>{item.action}</span>{" "}
                  {item.result && (
                    <>
                      -{" "}
                      <span className="text-green-400 font-bold">
                        {item.result}
                      </span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="flex flex-col">
          <span className="text-xl font-bold mb-6">Notifications</span>
          <div className="border-l-2 p-5 space-y-3 flex flex-col items-center">
            {notifications.map(
              (notif, index) =>
                !notif.read && (
                  <div
                    key={index}
                    className="text-muted-foreground place-self-start hover:text-secondary-foreground grid grid-cols-[auto_1fr] items-center space-x-2 cursor-pointer hover:scale-105 transform transition-all"
                  >
                    <Info className="w-6 h-6 text-blue-500" />
                    <div className="flex flex-col m-2">
                      <span>
                        {notif.title}
                        {": "}
                        {notif.documentName?.substring(0, 15)}...
                      </span>
                    </div>
                  </div>
                )
            )}
            {usersUnreadNotifs === 0 && (
              <span className="text-muted-foreground">
                You don&apos;t have any new notifications!
              </span>
            )}
            <Button onClick={() => setShowNotifs(true)} variant="secondary">
              {usersUnreadNotifs > 0 ? "View All" : "View"}
            </Button>
          </div>
          {(showNotifs || viewNotifications) && (
            <Notifications closeNotifs={() => setShowNotifs(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
