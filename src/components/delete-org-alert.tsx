import { Button } from "@/components/ui/button";
import { deleteDoc, getDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Orgs } from "@/app/orgs/columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface DeleteOrgDialogProps {
  orgToDelete: Orgs | null;
  onClose: () => void;
}

const DeleteOrgDialog: React.FC<DeleteOrgDialogProps> = ({ orgToDelete, onClose }) => {
  const handleDeleteOrg = async () => {
    if (!orgToDelete) return;

    try {
      const orgRef = doc(db, "org", orgToDelete.id);
      const orgDoc = await getDoc(orgRef);

      if (orgDoc.exists() && orgDoc.data().users.length === 0) {
        await deleteDoc(orgRef);
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
        <CardContent>
          <Button variant="outline" onClick={onClose} className="me-4">Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteOrg}>Delete</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteOrgDialog;