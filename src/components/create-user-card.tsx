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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CreateUserCard = forwardRef<HTMLDivElement>((_, ref) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<string | null>(null);
  const orgRef = useRef<string | null>(null);

  function handlePropagation(event: React.MouseEvent) {
    event.stopPropagation();
  }

  const handleRoleSelect = (value: string) => {
    roleRef.current = value;
  };

  const handleOrgSelect = (value: string) => {
    orgRef.current = value;
  };

  const handleAddUser = () => {
    const email = emailRef.current?.value || "";
    const firstName = firstNameRef.current?.value || "";
    const lastName = lastNameRef.current?.value || "";
    const role = roleRef.current || "";
    const org = orgRef.current || "";

    // Logic for creating user
    console.log("Email:", email);
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    console.log("Role:", role);
    console.log("Organization:", org);
  };

  return (
    <div className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10">
      <Card className="w-96" ref={ref}>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
          <CardDescription>Create regular users and editors</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="email"
            placeholder="email"
            ref={emailRef} // Bind input to ref
          />
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="first name"
              ref={firstNameRef} // Bind input to ref
            />
            <Input
              type="text"
              placeholder="last name"
              ref={lastNameRef} // Bind input to ref
            />
          </div>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger
                className="w-[180px]"
                onMouseDown={handlePropagation}
              >
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent onMouseDown={handlePropagation}>
                <SelectItem value="regular" onSelect={() => handleRoleSelect("regular")}>
                  Regular User
                </SelectItem>
                <SelectItem value="editor" onSelect={() => handleRoleSelect("editor")}>
                  Editor
                </SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger
                className="w-[180px]"
                onMouseDown={handlePropagation}
              >
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent onMouseDown={handlePropagation}>
                <SelectItem value="sales" onSelect={() => handleOrgSelect("sales")}>
                  Sales
                </SelectItem>
                <SelectItem value="it" onSelect={() => handleOrgSelect("it")}>
                  IT Dept
                </SelectItem>
                <SelectItem value="marketing" onSelect={() => handleOrgSelect("marketing")}>
                  Marketing
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddUser}>Add User</Button>
        </CardFooter>
      </Card>
    </div>
  );
});

CreateUserCard.displayName = "CreateUserCard";

export default CreateUserCard;
