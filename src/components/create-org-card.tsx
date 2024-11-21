"use client";

import React, { forwardRef } from "react";
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

  return (
    <div className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10">
      <Card className="w-96" ref={ref}>
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
          <CardDescription>Create new Organization in company</CardDescription>
        </CardHeader>
        <CardContent>
          <Input type="text" placeholder="Organization name" />
          <Textarea className="mb-3" placeholder="Organization description"/>
        </CardContent>
        <CardFooter>
          <Button>Create Organization</Button>
        </CardFooter>
      </Card>
    </div>
  );
});

CreateOrgCard.displayName = "CreateOrgCard";

export default CreateOrgCard;
