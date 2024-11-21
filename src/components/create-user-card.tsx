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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CreateUserCard = forwardRef<HTMLDivElement>((_, ref) => {
  const handlePropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10">
      <Card className="w-96" ref={ref}>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
          <CardDescription>Create regular users and editors</CardDescription>
        </CardHeader>
        <CardContent>
          <Input type="email" placeholder="email" />
          <div className="flex gap-2">
            <Input type="text" placeholder="first name" />
            <Input type="text" placeholder="last name" />
          </div>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger
                className="w-[180px]"
                onMouseDown={handlePropagation} // Prevent trigger propagation
              >
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent onMouseDown={handlePropagation}> {/* Prevent dropdown propagation */}
                <SelectItem value="regular">Regular User</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger
                className="w-[180px]"
                onMouseDown={handlePropagation} // Prevent trigger propagation
              >
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent onMouseDown={handlePropagation}> {/* Prevent dropdown propagation */}
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="it">IT Dept</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Add User</Button>
        </CardFooter>
      </Card>
    </div>
  );
});

CreateUserCard.displayName = "CreateUserCard";

export default CreateUserCard;
