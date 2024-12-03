import { Button } from "@/components/ui/button";
import { deleteDoc, getDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Users } from "@/app/users/columns";
import { useAuth } from "@/context/AuthContext";

interface DeleteUserDialogProps {
  userToDelete: Users | null;
  onClose: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ userToDelete, onClose }) => {
  const {user}= useAuth();
  const currentUserEmail = user?.userInfo.email;
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const userRef = doc(db, "users", userToDelete.id);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userName = userDoc.data().firstName + " " + userDoc.data().lastName;
        await deleteDoc(userRef);
        try {
          await addDoc(collection(db, "history"), {
            author: currentUserEmail || "Unknown",
            action: "deleted user",
            result: userName,
            timestamp: serverTimestamp(),
          });
          console.log("History record added to Firestore");
        } catch (historyError) {
          console.error("Error adding history record: ", historyError);
        }
        onClose();
      } else {
        alert("There are users in this organization. Please remove them before deleting the organization.");
      }
    } catch (error) {
      console.error("Error deleting organization: ", error);
    }
  };

  return (
    <div className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10" onClick={onClose}>
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="leading-8">Are you sure you want to delete this user?</CardTitle>
          <CardDescription>This user will be deleted from our servers and removed from organization!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={onClose} className="me-4">Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteUserDialog;