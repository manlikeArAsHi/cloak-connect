import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StatusDialog = ({ open, onOpenChange }: StatusDialogProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error } = await supabase.from('statuses').insert({
        user_id: user.id,
        content: content.trim(),
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      toast.success("Status posted!");
      setContent("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to post status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-blur border border-soft-royal-blue/30 rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-soft-white">Post Status Update</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="bg-deep-indigo border-soft-royal-blue text-soft-white placeholder:text-grey-blue rounded-2xl min-h-[120px]"
            maxLength={500}
          />
          <p className="text-grey-blue text-xs">
            Status will auto-delete after 24 hours
          </p>
          <Button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="w-full h-12 bg-gradient-to-r from-cyan-accent to-cyan-accent/80 hover:from-cyan-accent/90 hover:to-cyan-accent/70 text-midnight-blue font-semibold rounded-2xl"
          >
            {loading ? "Posting..." : "Post Status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusDialog;
