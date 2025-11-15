import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedUserId: string;
  reportedUsername: string;
}

const ReportDialog = ({ open, onOpenChange, reportedUserId, reportedUsername }: ReportDialogProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!reason.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('reports').insert({
        reported_user_id: reportedUserId,
        reporter_id: user.id,
        reason: reason.trim(),
      });

      if (error) throw error;

      toast.success("Report submitted. Thank you for keeping Cloak safe.");
      setReason("");
      onOpenChange(false);
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error("You have already reported this user");
      } else {
        toast.error(error.message || "Failed to submit report");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-blur border border-soft-royal-blue/30 rounded-3xl max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber" />
          </div>
          <DialogTitle className="text-center text-soft-white text-xl">
            Report {reportedUsername}
          </DialogTitle>
          <DialogDescription className="text-center text-grey-blue">
            After 3 reports, accounts are automatically suspended. False reports may result in your account being restricted.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you're reporting this user..."
            className="bg-deep-indigo border-soft-royal-blue text-soft-white placeholder:text-grey-blue rounded-2xl min-h-[100px]"
            maxLength={500}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleReport}
              disabled={loading || !reason.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-amber to-amber/80 hover:from-amber/90 hover:to-amber/70 text-midnight-blue font-semibold rounded-2xl"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 h-12 border-cyan-accent/30 text-cyan-accent hover:bg-cyan-accent/10 rounded-2xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
