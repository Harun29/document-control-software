"use client";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { FaFilePdf } from "react-icons/fa";
import {
  Calendar,
  FileInput,
  FilePlus2,
  FileText,
  IdCard,
  Mail,
  User2,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGeneral } from "@/context/GeneralContext";
import { DocRequest } from "./docs/types";
import { Input } from "@/components/ui/input";

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
  // const { usersUnreadNotifs } = useAuth();
  // const { viewNotifications } = useAuth();
  const { isAdmin } = useAuth();
  const { docs: allDocs } = useGeneral();
  const [docs, setDocs] = useState<DocRequest[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  // const [notifications, setNotifications] = useState<Notifs[]>([]);
  // const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDocs, setFilteredDocs] = useState(docs); // Assuming `docs` is the initial list of documents

  useEffect(() => {
    setFilteredDocs(
      docs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          searchQuery !== ""
      )
    );
  }, [searchQuery, docs]);

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
            const docsList = docsSnapshot.docs.map((doc) => doc.data());
            setDocs(docsList as DocRequest[]);
            // setNotifications(usersNotifs.slice(0, 5) as Notifs[]);
          } else {
            console.log("All Docs: ", allDocs);
            setDocs(allDocs.slice(0, 6) as DocRequest[]);
          }
          // Fetch History
          const historyQuery = query(
            collection(db, "history"),
            limit(6),
            orderBy("timestamp", "desc")
          );
          const historySnapshot = await getDocs(historyQuery);
          const historyList = historySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setHistory(historyList as History[]);
        }
      };

      fetchDocs();
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }, [user, usersNotifs, allDocs]);

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
    <div className="p-16 overflow-auto h-full grid grid-cols-[2fr_3fr] gap-10">
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
      <div className="grid grid-cols-3 gap-10 border-2 rounded-xl p-7">
        <Link href="/docs" className="pointer hover:scale-105 transition-all">
          <div className="flex flex-col justify-center items-center">
            <FileText className="w-32 h-32 mr-2" strokeWidth={1} />
            <span className="text-2xl">Documents</span>
          </div>
        </Link>
        {!isAdmin ? (
          <Link
            href="/docs/create"
            className="pointer hover:scale-105 transition-all"
          >
            <div className="flex flex-col justify-center items-center">
              <FilePlus2 className="w-32 h-32 mr-2" strokeWidth={1} />
              <span className="text-2xl">Add Documents</span>
            </div>
          </Link>
        ) : (
          <Link
            href="/users"
            className="pointer hover:scale-105 transition-all"
          >
            <div className="flex flex-col justify-center items-center">
              <User2 className="w-32 h-32 mr-2" strokeWidth={1} />
              <span className="text-2xl">Manage Users</span>
            </div>
          </Link>
        )}
        {!isAdmin ? (
          <Link
            href="/docs/requests"
            className="pointer hover:scale-105 transition-all"
          >
            <div className="flex flex-col justify-center items-center">
              <FileInput className="w-32 h-32 mr-2" strokeWidth={1} />
              <span className="text-2xl">Document Requests</span>
            </div>
          </Link>
        ) : (
          <Link href="/orgs" className="pointer hover:scale-105 transition-all">
            <div className="flex flex-col justify-center items-center">
              <Users2 className="w-32 h-32 mr-2" strokeWidth={1} />
              <span className="text-2xl">Manage Departments</span>
            </div>
          </Link>
        )}
        <div className="col-span-3 relative">
          {/* search */}
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`border-2 rounded-xl p-3 ${
              filteredDocs.length > 0 && "rounded-b-none border-b-0"
            }`}
          />
          <div
            className={`${
              filteredDocs.length === 0 && "hidden"
            } absolute top-10 w-full bg-background border-2 border-t-0 rounded-b-xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-50`}
          >
            {filteredDocs.map((doc) => {
              return (
                <Link
                  key={doc.fileName}
                  href={`/docs/${doc.fileName}?orgName=${doc.org}`}
                  className="flex items-center gap-4 p-4 bg-background border rounded-lg hover:bg-secondary hover:shadow-md transition-all transform hover:scale-[1.02] focus:outline focus:outline-2 focus:outline-blue-500"
                >
                  <FaFilePdf className="text-red-500 w-12 h-12 flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-medium text-primary">
                      {doc.title.substring(0, 20)}...
                    </span>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <User2 className="w-4 h-4" />
                      <span>{doc.reqBy}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {(doc.createdAt as any)
                          .toDate()
                          .toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div
        className={`grid ${
          false ? "grid-cols-[2fr_3fr_2fr]" : "grid-cols-[1fr_1fr]"
        } space-x-10 border-2 rounded-xl p-10 col-span-2`}
      >
        {/* Recent Documents */}
        <div className="flex flex-col">
          <span className="text-xl font-bold mb-6">Recent</span>
          <div className="border-l-2 p-5 grid grid-cols-2 gap-x-20 gap-y-5">
            {docs.map((doc) => (
              <Link
                key={doc.fileName}
                href={`/docs/${doc.fileName}?orgName=${doc.org}`}
                className="flex items-center gap-4 p-4 bg-background border rounded-lg hover:bg-secondary hover:shadow-md transition-all transform hover:scale-[1.02] focus:outline focus:outline-2 focus:outline-blue-500"
              >
                <FaFilePdf className="text-red-500 w-12 h-12 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-medium text-primary">
                    {doc.title.substring(0, 20)}...
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <User2 className="w-4 h-4" />
                    <span>{doc.reqBy.substring(0,23)}...</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {(doc.createdAt as any)
                        .toDate()
                        .toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                    </span>
                  </div>
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
            <Link href="/history" className="w-full">
              <Button className="w-full" variant="secondary">
                View All
              </Button>
            </Link>
          </div>
        </div>

        {/* Notifications Section */}
        {/* {!isAdmin && (
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
              <Button
                onClick={() => setShowNotifs(true)}
                variant="secondary"
                className="w-full"
              >
                {usersUnreadNotifs > 0 ? "View All" : "View"}
              </Button>
            </div>
            {(showNotifs || viewNotifications) && (
              <Notifications closeNotifs={() => setShowNotifs(false)} />
            )}
          </div>
        )} */}
      </div>
    </div>
  );
}
