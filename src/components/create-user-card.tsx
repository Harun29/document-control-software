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
import { db } from "../config/firebaseConfig";
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
import { Terminal, UserPlus2 } from "lucide-react";
import { useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { Orgs } from "@/app/orgs/columns";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const CreateUserCard = forwardRef<HTMLDivElement>((_, ref) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [org, setOrg] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Orgs[]>([]);
  // const {user}= useAuth();
  const {createUser}= useAuth();

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "org"));
        const orgsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Orgs[];
        setData(orgsList);
      } catch (error) {
        console.error("Error fetching orgs: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  useEffect(() => {
    setOrgName(data.find((o) => o.id === org)?.name || "");
  }, [org, data])
  // potential issue

  const handlePropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleAddUser = async () => {
    if (!email || !password || !firstName || !lastName || !role || !org) {
      toast.error("All fields are required!");
      return;
    }

    try {
      await createUser(email, password, firstName, lastName, role, org, orgName);
      toast.success("User added successfully!");
      console.log("User registered and added to Firestore");
    } catch (error) {
      console.error("Error registering user: ", error);
    }
  };

  return (
    <div className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10">
      <Card className="w-96" ref={ref}>
        <CardHeader>
          <CardTitle className="flex">
            <UserPlus2 className="h-6 w-6 mr-2" />
            Create New User
          </CardTitle>
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
                <SelectItem value="Regular">Regular User</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setOrg(value)}>
              <SelectTrigger
                className="w-[180px]"
                onMouseDown={handlePropagation}
              >
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent onMouseDown={handlePropagation}>
                {loading && !data ? (
                  <SelectItem value="loading">Loading...</SelectItem>
                ) : (
                  data.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))
                )}
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
                  New user will be added. Email: {email}, Full name: {firstName} {lastName}, Department: {org}, Role: {role}
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
