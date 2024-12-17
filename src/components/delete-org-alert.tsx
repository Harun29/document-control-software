import { Button } from "@/components/ui/button";
import { deleteDoc, getDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Orgs } from "@/app/orgs/columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";

interface DeleteOrgDialogProps {
  orgToDelete: Orgs | null;
  onClose: () => void;
}

const DeleteOrgDialog: React.FC<DeleteOrgDialogProps> = ({ orgToDelete, onClose }) => {
  const {user}= useAuth();
  const currentUserEmail = user?.userInfo?.email;
  
  const handleDeleteOrg = async () => {
    if (!orgToDelete) return;

    try {
      const orgRef = doc(db, "org", orgToDelete.id);
      const orgDoc = await getDoc(orgRef);

      if (orgDoc.exists() && orgDoc.data().users.length === 0) {
        const docName = orgDoc.data().name;
        await deleteDoc(orgRef);
        try {
          await addDoc(collection(db, "history"), {
            author: currentUserEmail || "Unknown",
            action: "deleted organization",
            result: docName,
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
          <CardTitle className="leading-8">Are you sure you want to delete this organization?</CardTitle>
          <CardDescription>This organization will be deleted from our servers with all its data!</CardDescription>
        </CardHeader>
        <CardContent className="flex content-end justify-end">
          <Button variant="outline" onClick={onClose} className="me-4">Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteOrg}>
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteOrgDialog;