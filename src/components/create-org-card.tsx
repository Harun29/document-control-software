"use client";

import React, { useRef, forwardRef } from "react";
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

const CreateOrgCard = forwardRef<HTMLDivElement>((_, ref) => {
  const orgNameRef = useRef<HTMLInputElement>(null);
  const orgDescriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleCreateOrganization = () => {
    const orgName = orgNameRef.current?.value || "";
    const orgDescription = orgDescriptionRef.current?.value || "";

    // Logic to handle organization creation
    console.log("Organization Name:", orgName);
    console.log("Organization Description:", orgDescription);
  };

  return (
    <div className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10">
      <Card className="w-96" ref={ref}>
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
          <CardDescription>Create new Organization in company</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Organization name"
            ref={orgNameRef} // Bind input to ref
          />
          <Textarea
            className="mb-3"
            placeholder="Organization description"
            ref={orgDescriptionRef} // Bind textarea to ref
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateOrganization}>Create Organization</Button>
        </CardFooter>
      </Card>
    </div>
  );
});

CreateOrgCard.displayName = "CreateOrgCard";

export default CreateOrgCard;
