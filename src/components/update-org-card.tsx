"use client";

import { useState, forwardRef } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderCircle, PencilIcon, Terminal } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "./ui/textarea";

interface Org {
  id: string;
  name: string;
  description: string;
  users: string[];
  docs: string[];
}

interface UpdateOrgCardProps {
  org: Org;
  onClose: () => void;
}

const UpdateOrgCard = forwardRef<HTMLDivElement, UpdateOrgCardProps>(({ org, onClose }, ref) => {
  const [name, setName] = useState(org.name);
  const [description, setDescription] = useState(org.description);
  const [loading, setLoading] = useState(false);
  const {user}= useAuth();
  const currentUserEmail = user?.userInfo?.email;

  const handlePropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleUpdateOrg = async () => {
    if (!name || !description) {
      alert("Please fill out all fields before proceeding.");
      return;
    }

    try {
      setLoading(true);
      const orgRef = doc(db, "org", org.id);

      await updateDoc(orgRef, {
        name,
        description,
      });

      try {
        await addDoc(collection(db, "history"), {
          author: currentUserEmail || "Unknown",
          action: "updated department",
          result: name,
          timestamp: serverTimestamp(),
        });
        console.log("History record added to Firestore");
      } catch (historyError) {
        console.error("Error adding history record: ", historyError);
      }

      console.log("Department information updated in Firestore");
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Error updating department information: ", error);
    }
  };

  return (
    <div className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10" onClick={onClose}>
      <Card className="w-100" ref={ref} onClick={handlePropagation}>
        <CardHeader>
          <CardTitle className="flex">
            <PencilIcon className="h-6 w-6 mr-2" />
            Update department Information</CardTitle>
          <CardDescription>Update the information of an existing department</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Department Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Department Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Alert className="mt-5">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              All fields are required in order to update department information!
            </AlertDescription>
          </Alert>
          <Button disabled={loading} onClick={handleUpdateOrg} className="mt-4">
            {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
            Update Department
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});
UpdateOrgCard.displayName = "UpdateOrgCard";
export default UpdateOrgCard;