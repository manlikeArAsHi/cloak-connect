import { useEffect, useState } from "react";
import { MessageSquare, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import UserSearch from "./UserSearch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ChatsTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadUserGroups();
    loadConversations();
  }, [user]);

  const loadUserGroups = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('group_members')
      .select('*, groups(*)')
      .eq('user_id', user.id);

    if (error) {
      toast.error("Failed to load chats");
      return;
    }

    setGroups(data || []);
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data: myConversations, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations(*)")
        .eq("user_id", user.id);

      if (error) throw error;

      // Fetch other participants for each conversation
      const conversationsWithUsers = await Promise.all(
        (myConversations || []).map(async (conv) => {
          const { data: otherParticipants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.conversation_id)
            .neq("user_id", user.id);

          if (!otherParticipants || otherParticipants.length === 0) {
            return null;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", otherParticipants[0].user_id)
            .single();

          return {
            id: conv.conversation_id,
            username: profile?.username || "Unknown",
            updated_at: conv.conversations?.updated_at,
          };
        })
      );

      setConversations(conversationsWithUsers.filter(Boolean) as any[]);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-soft-white">Chats</h2>
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-cyan-accent to-soft-royal-blue"
            >
              <Search className="w-4 h-4 mr-2" />
              Find Users
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-midnight-blue border-soft-royal-blue">
            <DialogHeader>
              <DialogTitle className="text-soft-white">Search Users</DialogTitle>
            </DialogHeader>
            <UserSearch onClose={() => setSearchOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Direct Messages Section */}
      {conversations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-grey-blue flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Direct Messages
          </h3>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => navigate(`/dm/${conv.id}`)}
              className="glass-blur rounded-2xl p-4 border border-soft-royal-blue/30 hover:border-cyan-accent/50 cursor-pointer transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-accent/20 to-deep-indigo flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-cyan-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-soft-white truncate">
                    @{conv.username}
                  </h3>
                  <p className="text-grey-blue text-sm truncate">
                    Direct message
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Groups Section */}
      {groups.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-grey-blue flex items-center gap-2">
            <Users className="w-4 h-4" />
            Groups
          </h3>
          {groups.map((member) => (
            <div
              key={member.id}
              onClick={() => navigate(`/chat/${member.groups.id}`)}
              className="glass-blur rounded-2xl p-4 border border-soft-royal-blue/30 hover:border-cyan-accent/50 cursor-pointer transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-accent/20 to-deep-indigo flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-cyan-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-soft-white truncate">
                    {member.groups.name}
                  </h3>
                  <p className="text-grey-blue text-sm truncate">
                    {member.groups.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {groups.length === 0 && conversations.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-grey-blue mx-auto mb-4" />
          <p className="text-grey-blue">No chats yet</p>
          <p className="text-grey-blue text-sm mt-2">
            Search for users to start chatting or join a group
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatsTab;
