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
      <AlertDialogContent className="glass-panel rounded-3xl max-w-sm border-glass-border shadow-[var(--shadow-glass)]">
        <AlertDialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-accent/20 to-teal-accent/20 flex items-center justify-center mb-4 shadow-[var(--shadow-glow-purple)]">
            <Shield className="w-8 h-8 text-teal-accent" />
          </div>
          <AlertDialogTitle className="text-center text-frosted-white text-2xl">
            Do you trust the recipient(s)?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-grey">
            This action helps keep the community safe. Only share with people you trust.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-3">
          <Button
            onClick={onConfirm}
            className="w-full h-12 bg-gradient-to-r from-teal-accent to-teal-accent/80 hover:shadow-[var(--shadow-glow-teal)] text-deep-black font-semibold rounded-2xl"
          >
            Yes, Send
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full h-12 border-glass-border text-muted-grey hover:bg-glass-panel rounded-2xl"
          >
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TrustDialog;
