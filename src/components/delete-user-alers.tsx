import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Users } from "@/app/users/columns";
import { useAuth } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";

interface DeleteUserDialogProps {
  userToDelete: Users | null;
  onClose: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ userToDelete, onClose }) => {
  const {deleteUser} = useAuth();
  
    const handleDeleteUser = async () => {
      if (!userToDelete) return;
  
      try {
        deleteUser(userToDelete.id, userToDelete.email);
      } catch (error) {
        console.error("Error deleting user: ", error);
      }
    };

  return (
    <div className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10" onClick={onClose}>
      <Card className="w-100">
        <CardHeader>
          <CardTitle className="leading-8">Are you sure you want to delete this user?</CardTitle>
          <CardDescription>This user will be deleted from our servers and removed from department!</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end content-end">
          <Button variant="outline" onClick={onClose} className="me-4">Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteUser}>
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteUserDialog;