import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Ban, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import ReportDialog from "./ReportDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DMSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otherUserId: string;
  otherUsername: string;
  conversationId: string;
  onBlock: () => void;
}

const DMSettingsDialog = ({
  open,
  onOpenChange,
  otherUserId,
  otherUsername,
  conversationId,
  onBlock,
}: DMSettingsDialogProps) => {
  const { user } = useAuth();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBlockUser = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.from("blocked_users").insert({
        blocker_id: user.id,
        blocked_id: otherUserId,
      });

      if (error) throw error;
      toast.success(`Blocked @${otherUsername}`);
      setShowBlockDialog(false);
      onOpenChange(false);
      onBlock();
    } catch (error: any) {
      toast.error("Failed to block user");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessages = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("direct_messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("sender_id", user.id);

      if (error) throw error;
      toast.success("Your messages have been deleted");
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to delete messages");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Conversation Settings</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manage your conversation with @{otherUsername}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-border text-foreground hover:bg-muted"
              onClick={() => {
                setShowReportDialog(true);
                onOpenChange(false);
              }}
            >
              <Shield className="w-4 h-4" />
              Report User
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setShowBlockDialog(true)}
            >
              <Ban className="w-4 h-4" />
              Block User
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-warning/30 text-warning hover:bg-warning/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete My Messages
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reportedUserId={otherUserId}
        reportedUsername={otherUsername}
      />

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Ban className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-foreground">
              Block @{otherUsername}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground">
              They won't be able to message you or see your status. You can unblock them later from settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <AlertDialogAction
              onClick={handleBlockUser}
              disabled={isLoading}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Block User
            </AlertDialogAction>
            <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <AlertDialogTitle className="text-center text-foreground">
              Delete Your Messages?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground">
              This will delete all messages you've sent in this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <AlertDialogAction
              onClick={handleDeleteMessages}
              disabled={isLoading}
              className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
            >
              Delete Messages
            </AlertDialogAction>
            <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DMSettingsDialog;