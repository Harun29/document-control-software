"use client";

import { Label } from "@/components/ui/label";
import { useGeneral } from "@/context/GeneralContext";
import {
  ChevronLeft,
  Copy,
  FileSymlink,
  HistoryIcon,
  IdCard,
  LoaderCircle,
  Mail,
  Pencil,
  SquareArrowOutUpRight,
  Star,
  Terminal,
  Trash,
  User2,
  UserPen,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { DocRequest } from "../types";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import DocumentReviewDrawer from "../modifyDoc";
import {
  collection,
  query,
  where,
  doc,
  getDocs,
  deleteDoc,
  addDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DocumentHistory, { historyRecord } from "@/components/docHistory";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ManageDocs = ({ params }: { params: Promise<{ docId: string }> }) => {
  const { docs } = useGeneral();
  const { deleteDocument } = useGeneral();
  const { updateDocument } = useGeneral();
  const { user } = useAuth();
  const { isAdmin } = useAuth();
  const { isEditor } = useAuth();
  const { usersOrg } = useAuth();
  const { assignedDocs } = useAuth();
  const [docId, setDocId] = useState<string | null>(null);
  const [docsOrg, setDocsOrg] = useState("");
  const [document, setDocument] = useState<DocRequest>();
  const [loading, setLoading] = useState(false);
  const [newDocVersion, setNewDocVersion] = useState<DocRequest | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [documentHistory, setDocumentHistory] = useState<historyRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sendToOrg, setSendToOrg] = useState<{ name: string; id: string }>({
    name: "",
    id: "",
  });
  const [allOrgs, setAllOrgs] = useState<{ orgName: string; orgID: string }[]>(
    []
  );
  const [deleteUponSending, setDeleteUponSending] = useState(false);
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [favouriteDisabled, setFavouriteDisabled] = useState<boolean>(false);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const closeDrawerRef = useRef<HTMLButtonElement>(null);
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<
    {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      org: string;
    }[]
  >([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [issAssignedToMe, setIsAssignedToMe] = useState(false);
  const [assignedMessage, setAssignedMessage] = useState("");

  useEffect(() => {
    const checkAssignedDocs = async () => {
      if (assignedDocs) {
        const assignedDoc = assignedDocs.find(
          (doc) =>
            doc.docUrl === document?.fileName + "?orgName=" + document?.org
        );

        if (assignedDoc) {
          setIsAssignedToMe(true);
          setAssignedMessage(assignedDoc.message);
        } else {
          setIsAssignedToMe(false);
          setAssignedMessage("");
        }
      }
    };
    checkAssignedDocs();
  }, [assignedDocs, document?.fileURL, document?.fileName, document?.org]);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      const orgName = searchParams.get("orgName");
      console.log("resolvedParams: ", resolvedParams);
      setDocId(resolvedParams.docId.replace(/%20/g, " "));
      console.log("doc id: ", resolvedParams.docId);
      if (orgName) {
        setDocsOrg(orgName);
        console.log("org name: ", orgName);
      }
    };
    unwrapParams();
  }, [params, searchParams]);

  useEffect(() => {
    try {
      const fetchAllDepartments = async () => {
        const orgsRef = collection(db, "org");
        const orgsSnap = await getDocs(orgsRef);
        const orgs = orgsSnap.docs.map((doc) => {
          return {
            orgName: doc.data().name,
            orgID: doc.id,
          };
        });
        const filteredOrgs = orgs.filter(
          (org) => org.orgID !== user?.userInfo?.org
        );
        setAllOrgs(filteredOrgs);
      };
      const fetchAllUsers = async () => {
        const usersRef = doc(db, "org", usersOrg);
        const usersSnap = await getDoc(usersRef);
        const users = usersSnap.data()?.users;

        if (!users) {
          setUsers([]);
          return;
        }

        const fetchedUsers = await Promise.all(
          users.map(async (userId: string) => {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            const user = userSnap.data();
            return {
              id: userSnap.id,
              firstName: user?.firstName,
              lastName: user?.lastName,
              email: user?.email,
              role: user?.role,
              org: user?.org,
            };
          })
        );

        setUsers(fetchedUsers);
      };
      fetchAllUsers();
      fetchAllDepartments();
    } catch (err) {
      console.error("Error fetching all departments: ", err);
    }
  }, [user?.userInfo?.org, usersOrg]);

  useEffect(() => {
    console.log("docId: ", docId, "docsOrg: ", docsOrg);
  }, [docId, docsOrg]);

  const closeHistory = () => {
    setShowHistory(false);
  };

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      if (docs && docId && docsOrg) {
        const document = docs.find(
          (doc) => doc.fileName === docId && doc.org === docsOrg
        );
        if (document?.fileName) {
          const historyRef = doc(
            db,
            "docHistory",
            document.fileName + document.org
          );
          const docHistory = await getDoc(historyRef);
          console.log("docHistory: ", docHistory.data());
          const historyData = docHistory.data()?.history || [];
          setDocumentHistory(historyData as historyRecord[]);
        }
        setDocument(document);
      }
      setLoading(false);
    };
    fetchDocument();
  }, [docs, docId, docsOrg]);

  const handleModifyDoc = () => {
    if (drawerTriggerRef.current) {
      drawerTriggerRef.current.click();
      setNewDocVersion(document as DocRequest);
    }
    console.log("Modify document:", document);
  };

  const handleDeleteDoc = async (document: DocRequest) => {
    try {
      setLoadingAction(true);
      const docsRef = collection(db, "org", document.orgID, "docs");
      const q = query(docsRef, where("fileName", "==", document.fileName));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      await deleteDocument(document.fileName, document.org);

      const historyRef = collection(db, "history");
      await addDoc(historyRef, {
        author: user?.userInfo?.email || "Unknown",
        action: "Modified a document",
        result: document?.title || document.title,
        timestamp: serverTimestamp(),
      });

      const docUserRef = collection(
        db,
        "users",
        document.reqByID,
        "notifications"
      );
      const qe = query(
        docUserRef,
        where("documentURL", "==", document.fileName)
      );
      const querySnapshotNotifs = await getDocs(qe);
      querySnapshotNotifs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      document.favoritedBy?.forEach(async (userId) => {
        const userDocRef = collection(db, "users", userId, "notifications");
        await addDoc(userDocRef, {
          message: `Document ${document.title} has been deleted by ${user?.userInfo?.email}`,
          createdAt: new Date().toISOString(),
          read: false,
          documentName: document.title,
          documentURL: "/docs",
          title: "Document Deleted",
        });
      });

      window.history.back();
      toast.success("Document deleted successfully");
      setLoadingAction(false);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleSendDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const documentFileName = document?.fileName;
    const documentOrg = document?.org;

    if (documentFileName) {
      try {
        const docRef = await addDoc(
          collection(db, "org", sendToOrg.id, "docRequests"),
          {
            title: document?.title,
            summary: document?.summary,
            label: document?.label,
            fileName: document?.fileName,
            fileType: document?.fileType,
            fileURL: document?.fileURL,
            createdAt: new Date(),
            status: "pending",
            reqBy: user?.userInfo?.email,
            reqByID: user?.uid,
            org: sendToOrg.name,
            orgID: sendToOrg.id,
            favoritedBy: [],
          }
        );

        const orgRef = doc(db, "org", sendToOrg.id);
        const orgSnap = await getDoc(orgRef);
        const editors = orgSnap.data()?.editors;
        editors.forEach(async (editor: string) => {
          const notifRef = collection(db, "users", editor, "notifications");
          await addDoc(notifRef, {
            createdAt: new Date().toISOString(),
            read: false,
            documentURL: `/requests`,
            documentName: document?.title,
            title: "Document Request",
            message: `${user?.userInfo?.email} requested a document`,
          });
        });

        const historyRef = doc(
          db,
          "docHistory",
          documentFileName + documentOrg
        );
        await updateDoc(historyRef, {
          history: arrayUnion({
            action: `User submitted document to ${sendToOrg.name}`,
            user: user?.userInfo?.email,
            org: user?.userInfo?.orgName,
            timeStamp: new Date(),
          }),
        });

        const docHistoryRef = doc(
          db,
          "docHistory",
          documentFileName + sendToOrg.name
        );
        const docSnap = await getDoc(docHistoryRef);

        if (docSnap.exists()) {
          await updateDoc(docHistoryRef, {
            history: arrayUnion({
              action: "User requested document",
              user: user?.userInfo?.email,
              org: user?.userInfo?.orgName,
              timeStamp: new Date(),
            }),
          });
        } else {
          await setDoc(docHistoryRef, {
            history: [
              {
                action: "User requested document",
                user: user?.userInfo?.email,
                org: user?.userInfo?.orgName,
                timeStamp: new Date(),
              },
            ],
          });
        }

        if (deleteUponSending) {
          await deleteDocument(documentFileName, documentOrg as string);
        }

        document.favoritedBy?.forEach(async (userId) => {
          const userDocRef = collection(db, "users", userId, "notifications");
          await addDoc(userDocRef, {
            message: `Document ${document.title} has been sent to department ${sendToOrg.name} by ${user?.userInfo?.email}`,
            createdAt: new Date().toISOString(),
            read: false,
            documentName: document.title,
            documentURL: document.fileName + "?orgName=" + document.org,
            title: "Document Sent to Another Department",
          });
        });

        console.log("Document request submitted with ID:", docRef.id);
        setLoading(false);
        toast.success("Document request submitted successfully!");
      } catch (error) {
        console.error("Error adding document request:", error);
      }
    }
  };

  useEffect(() => {
    if (document?.favoritedBy) {
      setIsFavourite(document.favoritedBy.includes(user?.uid as string));
    }
  }, [document, user?.uid]);

  const handleAddToFavourites = async () => {
    try {
      if (!isFavourite) {
        if (document?.orgID) {
          setFavouriteDisabled(true);
          const q = query(
            collection(db, "org", document.orgID, "docs"),
            where("fileName", "==", document.fileName)
          );
          const querySnapshot = await getDocs(q);
          const docRef = doc(
            db,
            "org",
            document.orgID,
            "docs",
            querySnapshot.docs[0].id
          );
          await updateDoc(docRef, {
            favoritedBy: arrayUnion(user?.uid),
          });
        }
        const newDoc = docs.find(
          (doc) =>
            doc.fileName === document?.fileName && doc.org === document?.org
        );
        if (newDoc) {
          if (newDoc.favoritedBy) {
            newDoc.favoritedBy.push(user?.uid as string);
          } else {
            newDoc.favoritedBy = [user?.uid as string];
          }
        }
        await updateDocument(
          document?.fileName as string,
          document?.org as string,
          newDoc as DocRequest
        );
        setIsFavourite(true);
        setFavouriteDisabled(false);
        toast.success("Document added to favourites");
      } else {
        if (document?.orgID) {
          setFavouriteDisabled(true);
          const q = query(
            collection(db, "org", document.orgID, "docs"),
            where("fileName", "==", document.fileName)
          );
          const querySnapshot = await getDocs(q);
          const docRef = doc(
            db,
            "org",
            document.orgID,
            "docs",
            querySnapshot.docs[0].id
          );
          await updateDoc(docRef, {
            favoritedBy: arrayRemove(user?.uid),
          });
        }
        const newDoc = docs.find(
          (doc) =>
            doc.fileName === document?.fileName && doc.org === document?.org
        );
        if (newDoc) {
          newDoc.favoritedBy = newDoc.favoritedBy.filter(
            (id) => id !== user?.uid
          );
        }
        await updateDocument(
          document?.fileName as string,
          document?.org as string,
          newDoc as DocRequest
        );
        setIsFavourite(false);
        setFavouriteDisabled(false);
        toast.success("Document removed from favourites");
      }
    } catch (error) {
      setFavouriteDisabled(false);
      console.error("Error adding document to favourites: ", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const assignDocumentToUser = async (userId: string, message: string) => {
    try {
      const usersRef = doc(db, "users", userId);
      const userSnap = await getDoc(usersRef);
      const userData = userSnap.data();
      if (userData && userData.assignedDocs) {
        updateDoc(usersRef, {
          assignedDocs: arrayUnion({
            docUrl: document?.fileName + "?orgName=" + document?.org,
            message,
          }),
        });
      } else {
        setDoc(
          usersRef,
          {
            assignedDocs: [
              {
                docUrl: document?.fileName + "?orgName=" + document?.org,
                message,
              },
            ],
          },
          { merge: true }
        );
      }
      const usersNotifRef = collection(usersRef, "notifications");
      await addDoc(usersNotifRef, {
        message: `Document ${document?.title} has been assigned to you by ${user?.userInfo?.email}`,
        createdAt: new Date().toISOString(),
        read: false,
        documentName: document?.title,
        documentURL: document?.fileName + "?orgName=" + document?.org,
        title: "Document Assigned",
      });
      setMessage("");
      toast.success("Document assigned to user");
    } catch (err) {
      toast.error("Error assigning document to user");
      console.error("Error assigning document to user: ", err);
    }
  };

  if (loading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: "0", opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:flex lg:space-x-6 h-full min-h-[100vh-4rem]"
        >
          <div className="lg:w-2/3 flex flex-col space-y-6 p-6 bg-background shadow-md flex-grow">
            <h1 className="text-3xl mb-0 flex">
              <ChevronLeft
                onClick={() => window.history.back()}
                className="cursor-pointer w-8 h-8 mr-2 hover:scale-125 transition-all"
              />
              <FaFilePdf className="w-8 h-8 mr-2 text-red-500" />
              Document - Loading
            </h1>
            <p className="text-muted-foreground">
              View and manage document details
            </p>
            <div className="flex space-x-4 items-center">
              <Button variant="outline">Loading</Button>
              <Button variant="outline">Loading</Button>
              <Button variant="outline">Loading</Button>
              <Button variant="outline">Loading</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Summary</Label>
              <Skeleton className="h-[200px]" />
            </div>
            <div className="flex space-x-4">
              {document?.org === user?.userInfo?.orgName && (
                <Button
                  onClick={handleModifyDoc}
                  className="group flex items-center"
                >
                  <Pencil className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                  <span className="hidden group-hover:inline transition-opacity duration-1000 ease-in-out">
                    Modify
                  </span>
                </Button>
              )}
              <Button
                onClick={handleViewHistory}
                className="group flex items-center"
              >
                <HistoryIcon className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  History
                </span>
              </Button>
              <Button
                onClick={() => {
                  if (document?.fileURL) {
                    navigator.clipboard.writeText(document.fileURL);
                    toast.success("URL copied to clipboard");
                  }
                }}
                className="group flex items-center"
              >
                <Copy className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  Copy URL
                </span>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/3 bg-background shadow-md p-4 flex flex-col flex-grow">
            <h2 className="text-lg font-medium text-primary">
              Document Preview
            </h2>
            <div className="flex-grow h-[400px] overflow-auto border mt-4 rounded-md pt-4 pb-4">
              <Skeleton className="h-full" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  } else {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: "0", opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:flex lg:space-x-6 h-full min-h-[100vh-4rem]"
        >
          <div className="lg:w-2/3 flex flex-col space-y-6 p-6 bg-background shadow-md flex-grow">
            <h1 className="text-3xl mb-0 flex items-center">
              <ChevronLeft
                onClick={() => window.history.back()}
                className="cursor-pointer w-8 h-8 mr-2 hover:scale-125 transition-all"
              />
              {document?.fileType === "application/pdf" ? (
                <FaFilePdf className="w-8 h-8 mr-2 text-red-500" />
              ) : (
                <FaFileWord className="w-8 h-8 mr-2" />
              )}
              {isFavourite && <Star className="w-6 h-6 mr-2" fill="gold" />}
              Document - {document?.title}
            </h1>
            <p className="text-muted-foreground">
              View and manage document details
            </p>
            {issAssignedToMe && (
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>This document has been assigned to you</AlertTitle>
                <AlertDescription>Message: {assignedMessage}</AlertDescription>
              </Alert>
            )}
            <div className="flex space-x-4 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">{document?.title}</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Document Title</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">
                      {document?.createdAt
                        ? (document.createdAt as any)
                            .toDate()
                            .toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                        : "Date not available"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Date Added</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">
                      {document?.org || "Unknown"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Document Department</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">{document?.label}</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Document Type</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Summary</Label>
              <p>{document?.summary}</p>
            </div>
            <div className="flex space-x-4">
              {((document?.org === user?.userInfo?.orgName && isEditor) || issAssignedToMe || isAdmin) && (
                <Button
                  onClick={handleModifyDoc}
                  className="group flex items-center"
                >
                  <Pencil className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                  <span className="hidden group-hover:inline transition-opacity duration-1000 ease-in-out">
                    Modify
                  </span>
                </Button>
              )}
              <Button
                onClick={handleViewHistory}
                className="group flex items-center"
              >
                <HistoryIcon className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  History
                </span>
              </Button>
              <Button
                onClick={handleAddToFavourites}
                className="group flex items-center"
              >
                {!favouriteDisabled ? (
                  <Star
                    className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2"
                    fill={isFavourite ? "gold" : "none"}
                  />
                ) : (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                )}
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  {isFavourite ? "Remove from Favourites" : "Add to Favourites"}
                </span>
              </Button>
              <Button
                onClick={() => {
                  if (document?.fileURL) {
                    navigator.clipboard.writeText(document.fileURL);
                    toast.success("URL copied to clipboard");
                  }
                }}
                className="group flex items-center"
              >
                <Copy className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                  Copy URL
                </span>
              </Button>
              <a target="_blank" href={document?.fileURL}>
                <Button className="group flex items-center">
                  <SquareArrowOutUpRight className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                  <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                    Open In New Tab
                  </span>
                </Button>
              </a>
              {(document?.org === user?.userInfo?.orgName && isEditor) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="group flex items-center">
                      <FileSymlink className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                      <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                        Send to other Department
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Send Document</DialogTitle>
                      <DialogDescription>
                        Send this document to another department
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-rows-2 items-center gap-2">
                        <Select
                          onValueChange={(value) =>
                            setSendToOrg({
                              name:
                                allOrgs.find((org) => org.orgID === value)
                                  ?.orgName || "",
                              id: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Department" />
                          </SelectTrigger>
                          <SelectContent>
                            {allOrgs.map((org) => (
                              <SelectItem key={org.orgID} value={org.orgID}>
                                {org.orgName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={deleteUponSending}
                            onCheckedChange={(checked) =>
                              setDeleteUponSending(checked)
                            }
                            id="delete-upon-sending"
                          />
                          <Label htmlFor="airplane-mode">
                            Delete document from this department
                          </Label>
                        </div>
                        <p
                          className={`${
                            deleteUponSending ? "block" : "hidden"
                          } text-sm text-red-500`}
                        >
                          This action is irreversible
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        disabled={sendToOrg.id === "" && sendToOrg.name === ""}
                        onClick={(e) => handleSendDoc(e)}
                      >
                        Send
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {/* implement later */}
              {(document?.org === user?.userInfo?.orgName && isEditor) && (
                <Dialog>
                  <DialogTrigger>
                    <Button className="group flex items-center">
                      <UserPen className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                      <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                        Assign to user
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="mb-4">
                        All users in this department
                      </DialogTitle>
                      <div className="flex items-center mb-3">
                        <Input
                          placeholder="Search users..."
                          className="m-2"
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <Dialog key={user.id}>
                              <DialogTrigger className="hover-container hover:bg-secondary px-2 py-3 rounded-md cursor-pointer w-full">
                                <div className="flex mb-3 items-center">
                                  <Avatar className="mr-2">
                                    <AvatarFallback>
                                      <User2 />
                                    </AvatarFallback>
                                  </Avatar>
                                  <strong>
                                    {user.firstName} {user.lastName}
                                  </strong>
                                  <strong className="hidden-on-hover text-blue-600 ml-4 flex gap-x-2">
                                    <UserPen />
                                    Assign to
                                  </strong>
                                </div>
                                <div className="ml-2">
                                  <div className="flex mb-2">
                                    <Mail />
                                    <span className="ml-2">{user.email}</span>
                                  </div>
                                  <div className="flex">
                                    <IdCard />
                                    <span className="ml-2">{user.role}</span>
                                  </div>
                                </div>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="mb-4">
                                    Assign document to {user.firstName}{" "}
                                    {user.lastName}
                                  </DialogTitle>
                                  <DialogDescription>
                                    <Label htmlFor="message">
                                      Message to user
                                    </Label>
                                    <Textarea
                                      value={message}
                                      onChange={(e) =>
                                        setMessage(e.target.value)
                                      }
                                      id="message"
                                      className="w-full mt-2"
                                      placeholder="Enter a message to the user"
                                    />
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    onClick={() =>
                                      assignDocumentToUser(user.id, message)
                                    }
                                  >
                                    Assign
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          ))
                        ) : (
                          <div>No users</div>
                        )}
                      </div>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              )}
              {((document?.org === user?.userInfo?.orgName && isEditor) || isAdmin) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="group flex items-center"
                    >
                      <Trash className="w-4 h-4 transition-all duration-200 ease-in-out group-hover:mr-2" />
                      <span className="hidden group-hover:inline transition-opacity duration-200 ease-in-out">
                        Delete
                      </span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription className="flex flex-col gap-2">
                        Do you want to delete this document? {document?.title}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={loadingAction}
                        onClick={() => handleDeleteDoc(document!)}
                      >
                        {loadingAction && (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        )}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <div className="lg:w-1/3 bg-background shadow-md p-4 flex flex-col flex-grow">
            <h2 className="text-lg font-medium text-primary">
              Document Preview
            </h2>
            <>
              {/* Scrollable Viewer */}
              <div className="flex-grow h-[400px] overflow-auto border mt-4 rounded-md pt-4 pb-4">
                {document?.fileType === "application/pdf" && (
                  <Worker
                    workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
                  >
                    <Viewer fileUrl={document?.fileURL} />
                  </Worker>
                )}
                {document?.fileType ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
                  <DocViewer
                    documents={[{ uri: document?.fileURL }] as any}
                    pluginRenderers={DocViewerRenderers}
                  />
                )}
              </div>
            </>
            <DocumentReviewDrawer
              drawerTriggerRef={drawerTriggerRef}
              closeDrawerRef={closeDrawerRef}
              selectedDoc={document as DocRequest}
              newDocVersion={newDocVersion}
              setNewDocVersion={setNewDocVersion}
              handleDeleteDoc={handleDeleteDoc}
              loadingAction={loadingAction}
            />
            {showHistory && (
              <DocumentHistory
                docHistory={documentHistory}
                closeHistory={closeHistory}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
};

export default ManageDocs;
