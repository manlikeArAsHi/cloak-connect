import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface TrustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const TrustDialog = ({ open, onOpenChange, onConfirm }: TrustDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-blur border border-soft-royal-blue/30 rounded-3xl max-w-sm">
        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-cyan-accent/10 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-cyan-accent" />
          </div>
          <AlertDialogTitle className="text-center text-soft-white text-xl">
            Share Securely?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-grey-blue">
            Do you trust this person/group with this file? This action helps
            keep the community safe.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={onConfirm}
            className="w-full h-12 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-midnight-blue font-semibold rounded-2xl"
          >
            Trust & Send
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full h-12 border-cyan-accent/30 text-cyan-accent hover:bg-cyan-accent/10 rounded-2xl"
          >
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TrustDialog;
