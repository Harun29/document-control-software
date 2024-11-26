"use client";

import { useState, useEffect, forwardRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

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

  const handlePropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleUpdateOrg = async () => {
    if (!name || !description) {
      alert("Please fill out all fields before proceeding.");
      return;
    }

    try {
      const orgRef = doc(db, "org", org.id);

      await updateDoc(orgRef, {
        name,
        description,
      });

      console.log("Organization information updated in Firestore");
      onClose();
    } catch (error) {
      console.error("Error updating organization information: ", error);
    }
  };

  return (
    <div className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10" onClick={onClose}>
      <Card className="w-96" ref={ref} onClick={handlePropagation}>
        <CardHeader>
          <CardTitle>Update Organization Information</CardTitle>
          <CardDescription>Update the information of an existing organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Organization Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Organization Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Alert className="mt-5">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              All fields are required in order to update organization information!
            </AlertDescription>
          </Alert>
          <Button onClick={handleUpdateOrg} className="mt-4">Update Organization</Button>
        </CardContent>
      </Card>
    </div>
  );
});

export default UpdateOrgCard;