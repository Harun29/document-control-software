"use client";

import React, { useRef, useState, forwardRef, useEffect } from "react";
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
import { auth, db } from "../config/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const CreateUserCard = forwardRef<HTMLDivElement>((_, ref) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<string | null>(null);
  const [org, setOrg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  function handlePropagation(event: React.MouseEvent) {
    event.stopPropagation();
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleAddUser = async () => {
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const firstName = firstNameRef.current?.value || "";
    const lastName = lastNameRef.current?.value || "";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        firstName,
        lastName,
        role,
        org,
      });

      console.log("User registered and added to Firestore");
    } catch (error) {
      console.error("Error registering user: ", error);
    }
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
            placeholder="Email"
            ref={emailRef} // Bind input to ref
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"} // Toggle visibility
              placeholder="Password"
              ref={passwordRef} // Bind input to ref
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="First Name"
              ref={firstNameRef} // Bind input to ref
            />
            <Input
              type="text"
              placeholder="Last Name"
              ref={lastNameRef} // Bind input to ref
            />
          </div>
          <div className="flex gap-2">
            <Select onValueChange={(value) => setRole(value)}>
              <SelectTrigger
                className="w-[180px]"
                onMouseDown={handlePropagation}
              >
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent onMouseDown={handlePropagation}>
                <SelectItem value="regular">Regular User</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setOrg(value)}>
              <SelectTrigger
                className="w-[180px]"
                onMouseDown={handlePropagation}
              >
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent onMouseDown={handlePropagation}>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="it">IT Dept</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
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
