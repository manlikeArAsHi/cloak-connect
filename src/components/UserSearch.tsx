import { useState } from "react";
import { Search, Loader2, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

interface UserSearchProps {
  onClose?: () => void;
}

const UserSearch = ({ onClose }: UserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .ilike("username", `%${searchTerm}%`)
        .neq("id", user?.id)
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error: any) {
      toast.error("Failed to search users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (otherUserId: string) => {
    if (!user) return;
    
    setCreating(otherUserId);
    try {
      // Check if conversation already exists
      const { data: existingParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (existingParticipants) {
        for (const participant of existingParticipants) {
          const { data: otherParticipants, error } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", participant.conversation_id);

          if (!error && otherParticipants) {
            const userIds = otherParticipants.map((p) => p.user_id);
            if (userIds.length === 2 && userIds.includes(otherUserId)) {
              // Conversation exists
              navigate(`/dm/${participant.conversation_id}`);
              onClose?.();
              return;
            }
          }
        }
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add both participants
      const { error: partError } = await supabase
        .from("conversation_participants")
        .insert([
          { conversation_id: conversation.id, user_id: user.id },
          { conversation_id: conversation.id, user_id: otherUserId },
        ]);

      if (partError) throw partError;

      toast.success("Conversation started!");
      navigate(`/dm/${conversation.id}`);
      onClose?.();
    } catch (error: any) {
      toast.error("Failed to start conversation");
      console.error(error);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-blue" />
          <Input
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 bg-deep-indigo/50 border-soft-royal-blue text-soft-white"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="bg-gradient-to-r from-cyan-accent to-soft-royal-blue"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      <div className="space-y-2">
        {results.map((profile) => (
          <div
            key={profile.id}
            className="glass-blur rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-soft-white font-medium">@{profile.username}</p>
            </div>
            <Button
              size="sm"
              onClick={() => startConversation(profile.id)}
              disabled={creating === profile.id}
              className="bg-gradient-to-r from-cyan-accent to-soft-royal-blue"
            >
              {creating === profile.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </>
              )}
            </Button>
          </div>
        ))}

        {!loading && searchTerm && results.length === 0 && (
          <p className="text-center text-grey-blue py-8">No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
