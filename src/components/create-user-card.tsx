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

const CreateUserCard = forwardRef<HTMLDivElement>((_, ref) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [org, setOrg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handlePropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleAddUser = async () => {
    if (!email || !password || !firstName || !lastName || !role || !org) {
      alert("Please fill out all fields before proceeding.");
      return;
    }

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
          <Alert className="mt-5">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              All fields are required in order to add a new user!
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button disabled={!email || !password || !firstName || !lastName || !role || !org}>
                Add User
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Proceed adding this user?</AlertDialogTitle>
                <AlertDialogDescription>
                  New user will be added. Email: {email}, Full name: {firstName} {lastName}, Organization: {org}, Role: {role}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter onMouseDown={handlePropagation}>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>
                  <Button onClick={handleAddUser}>Add User</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
});

CreateUserCard.displayName = "CreateUserCard";

export default CreateUserCard;
