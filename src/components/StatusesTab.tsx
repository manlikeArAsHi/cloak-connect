import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import StatusDialog from "./StatusDialog";

interface Status {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  created_at: string;
  expires_at: string;
  profiles: {
    username: string;
  };
}

const StatusesTab = () => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadStatuses();

    const channel = supabase
      .channel('statuses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'statuses',
        },
        () => loadStatuses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStatuses = async () => {
    const { data, error } = await supabase
      .from('statuses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load statuses");
      return;
    }

    if (data) {
      const statusesWithProfiles = await Promise.all(
        data.map(async (status) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', status.user_id)
            .single();
          
          return {
            ...status,
            profiles: profile || { username: 'Anonymous' }
          };
        })
      );
      setStatuses(statusesWithProfiles);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-soft-white">Status Updates</h2>
        <Button
          onClick={() => setShowDialog(true)}
          size="icon"
          className="rounded-full bg-gradient-to-br from-cyan-accent to-cyan-accent/80"
        >
          <Plus className="w-5 h-5 text-midnight-blue" />
        </Button>
      </div>

      <div className="space-y-3">
        {statuses.length === 0 ? (
          <p className="text-grey-blue text-center py-8">
            No status updates yet. Be the first!
          </p>
        ) : (
          statuses.map((status) => (
            <div
              key={status.id}
              className="glass-blur rounded-2xl p-4 border border-soft-royal-blue/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-cyan-accent font-medium text-sm">
                    {status.profiles.username}
                  </p>
                  <p className="text-soft-white mt-2">{status.content}</p>
                  <p className="text-grey-blue text-xs mt-2">
                    {new Date(status.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <StatusDialog open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
};

export default StatusesTab;
