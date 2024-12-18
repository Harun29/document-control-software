"use client";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { FaFilePdf } from "react-icons/fa";
import { Dot, FileInput, FilePlus2, FileText } from "lucide-react";

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
  const [docs, setDocs] = useState<Doc[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    try {
      const fetchDocs = async () => {
        if (user) {
          if (user?.userInfo?.org) {
            // Fetch Recent Docs
            const docsQuery = query(
              collection(db, "org", user.userInfo.org, "docs"),
              limit(6)
            );
            const docsSnapshot = await getDocs(docsQuery);
            const docsList = docsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Fetch History
            const historyQuery = query(collection(db, "history"), limit(5));
            const historySnapshot = await getDocs(historyQuery);
            const historyList = historySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setDocs(docsList as Doc[]);
            setHistory(historyList as History[]);
          }
        }
      };

      const fetchNotifications = async () => {
        // Mock notifications (replace with actual logic to fetch notifications)
        setNotifications([
          "New document request received.",
          "Your recent document submission was approved.",
          "New document request received.",
          "Document #1209 requires your attention.",
          "Document #4927 requires your attention.",
        ]);
      };

      fetchDocs();
      fetchNotifications();
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }, []);

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
      {/* User Info */}
      <div className="flex items-center justify-between mb-12 ">
        <div className="flex items-center border-2 rounded-xl p-7">
          <div>
            <Image
              src="/default-user.png"
              alt="profile"
              width={200}
              height={200}
              className="me-10"
            />
          </div>
          <div className="flex flex-col text-xl space-y-1">
            <span className="font-bold">
              <Dot className="inline-block" />
              {user?.userInfo?.email}
            </span>
            <span>
              <Dot className="inline-block" />
              {user?.userInfo?.firstName} {user?.userInfo?.lastName}
            </span>
            <span>
            <Dot className="inline-block" />
              {user?.userInfo?.role}</span>
            <Link className="font-bold" href={`/orgs/${user?.userInfo?.org}`}>
            <Dot className="inline-block" />
              <span>{user?.userInfo?.orgName}</span>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-10 m-auto">
          <Link href="/docs" className="pointer hover:scale-105 transition-all">
          <div className="flex flex-col justify-center items-center">
            <FileText className="w-32 h-32 mr-2" strokeWidth={1}/>
            <span className="text-2xl">Documents</span>
          </div>
          </Link>
          <Link href="/docs/create" className="pointer hover:scale-105 transition-all">
          <div className="flex flex-col justify-center items-center">
            <FilePlus2 className="w-32 h-32 mr-2" strokeWidth={1}/>
            <span className="text-2xl">Add Documents</span>
          </div>
          </Link>
          <Link href="/docs/requests" className="pointer hover:scale-105 transition-all">
          <div className="flex flex-col justify-center items-center">
            <FileInput className="w-32 h-32 mr-2" strokeWidth={1}/>
            <span className="text-2xl">Document Requests</span>
          </div>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex justify-start space-x-10 border-2 rounded-xl p-10">
        {/* Recent Documents */}
        <div className="flex flex-col">
          <span className="text-xl font-bold mb-6">Recent</span>
          <div className="border-l-2 p-5 grid grid-cols-2 gap-x-20 gap-y-5">
            {docs.map((doc) => (
              <div
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
              </div>
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
          <div className="border-l-2 p-5 space-y-3">
            {notifications.map((note, index) => (
              <div
                key={index}
                className="text-muted-foreground hover:text-secondary-foreground flex items-center space-x-2 cursor-pointer hover:scale-105 transform transition-all"
              >
                <div className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full">
                  <span className="font-bold">!</span>
                </div>
                <div className="flex flex-col m-2">
                  <span>{note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
