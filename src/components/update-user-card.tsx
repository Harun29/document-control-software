"use client";

import { useState, useEffect, forwardRef } from "react";
import { collection, doc, getDocs, updateDoc, arrayRemove, arrayUnion, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PencilIcon, Terminal } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  org: string;
}

interface UpdateUserCardProps {
  user: User;
  onClose: () => void;
}

const UpdateUserCard = forwardRef<HTMLDivElement, UpdateUserCardProps>(({ user, onClose }, ref) => {
  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [role, setRole] = useState<string | null>(user.role);
  const [org, setOrg] = useState<string | null>(user.org);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ id: string; name: string }[]>([]);
  const { user: authUser } = useAuth();
  const currentUserEmail = authUser?.userInfo?.email;

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "org"));
        const orgsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setData(orgsList);
      } catch (error) {
        console.error("Error fetching organizations: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  const handlePropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleUpdateUser = async () => {
    if (!email || !firstName || !lastName || !role || !org) {
      alert("Please fill out all fields before proceeding.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.id);

      await updateDoc(userRef, {
        email,
        firstName,
        lastName,
        role,
        org,
      });

      if (org !== user.org) {
        const oldOrgRef = doc(db, "org", user.org);
        const newOrgRef = doc(db, "org", org);

        await updateDoc(oldOrgRef, {
          users: arrayRemove(user.id),
        });

        await updateDoc(newOrgRef, {
          users: arrayUnion(user.id),
        });
      }

      try {
        await addDoc(collection(db, "history"), {
          author: currentUserEmail || "Unknown",
          action: "updated user",
          result: email,
          timestamp: serverTimestamp(),
        });
        console.log("History record added to Firestore");
      } catch (historyError) {
        console.error("Error adding history record: ", historyError);
      }

      console.log("User information updated in Firestore");
      onClose();
    } catch (error) {
      console.error("Error updating user information: ", error);
    }
  };

  return (
    <div className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10" onClick={onClose}>
      <Card className="w-96" ref={ref} onClick={handlePropagation}>
        <CardHeader>
          <CardTitle className="flex">
            <PencilIcon className="h-6 w-6 mr-2" />
            Update User Information</CardTitle>
          <CardDescription>Update the information of an existing user</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
            <Select onValueChange={(value) => setRole(value)} value={role || undefined}>
              <SelectTrigger className="w-[180px]" onMouseDown={handlePropagation}>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent onMouseDown={handlePropagation}>
                <SelectItem value="regular">Regular User</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setOrg(value)} value={org || undefined}>
              <SelectTrigger className="w-[180px]" onMouseDown={handlePropagation}>
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent onMouseDown={handlePropagation}>
                {loading ? (
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
              All fields are required in order to update user information!
            </AlertDescription>
          </Alert>
          <Button onClick={handleUpdateUser} className="mt-4">Update User</Button>
        </CardContent>
      </Card>
    </div>
  );
});

UpdateUserCard.displayName = "UpdateUserCard";
export default UpdateUserCard;