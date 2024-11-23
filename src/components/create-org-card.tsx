"use client";

import React, { useState, forwardRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

const CreateOrgCard = forwardRef<HTMLDivElement>((_, ref) => {
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");

  const handlePropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleCreateOrganization = async () => {
    if (!orgName || !orgDescription) {
      alert("Please fill out all fields before proceeding.");
      return;
    }

    try {
      await setDoc(doc(db, "org", orgName), {
        name: orgName,
        description: orgDescription,
        users: [],
        docs: []
      });
      console.log("Organization added to Firestore");
    } catch (error) {
      console.error("Error creating organization: ", error);
    }
  };

  return (
    <div className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10">
      <Card className="w-96" ref={ref}>
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
          <CardDescription>Create a new organization in the company</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Organization name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <Textarea
            className="mb-3"
            placeholder="Organization description"
            value={orgDescription}
            onChange={(e) => setOrgDescription(e.target.value)}
          />
          <Alert className="mt-5">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              All fields are required to create a new organization!
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button disabled={!orgName || !orgDescription}>
                Create Organization
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Proceed creating this organization?</AlertDialogTitle>
                <AlertDialogDescription>
                  The organization will be created with the name: {orgName}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onMouseDown={handlePropagation}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction>
                  <Button
                    onMouseDown={handlePropagation}
                    onClick={handleCreateOrganization}
                  >
                    Create Organization
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
});

CreateOrgCard.displayName = "CreateOrgCard";

export default CreateOrgCard;
