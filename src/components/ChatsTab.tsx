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
  DialogDescription,
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
      // Get all conversation IDs for current user
      const { data: myConversations, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
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
            .maybeSingle();

          return {
            id: conv.conversation_id,
            username: profile?.username || "Unknown",
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
              className="bg-gradient-to-r from-purple-accent to-teal-accent text-deep-black hover:shadow-[var(--shadow-glow-purple)] rounded-2xl"
            >
              <Search className="w-4 h-4 mr-2" />
              Find Users
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-glass-border">
            <DialogHeader>
              <DialogTitle className="text-frosted-white">Search Users</DialogTitle>
              <DialogDescription className="text-muted-grey">
                Find and start conversations with other users
              </DialogDescription>
            </DialogHeader>
            <UserSearch onClose={() => setSearchOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Direct Messages Section */}
      {conversations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-grey flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Direct Messages
          </h3>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => navigate(`/dm/${conv.id}`)}
              className="glass-panel rounded-2xl p-4 hover:border-purple-accent/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-accent/30 to-teal-accent/30 flex items-center justify-center group-hover:shadow-[var(--shadow-glow-purple)] transition-all">
                  <MessageSquare className="w-5 h-5 text-purple-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-frosted-white truncate">
                    @{conv.username}
                  </h3>
                  <p className="text-muted-grey text-sm">Direct message</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Groups Section */}
      {groups.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-grey flex items-center gap-2">
            <Users className="w-4 h-4" />
            Groups
          </h3>
          {groups.map((member) => (
            <div
              key={member.id}
              onClick={() => navigate(`/chat/${member.groups.id}`)}
              className="glass-panel rounded-2xl p-4 hover:border-purple-accent/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-accent/30 to-teal-accent/30 flex items-center justify-center group-hover:shadow-[var(--shadow-glow-teal)] transition-all">
                  <span className="text-lg font-bold text-teal-accent">
                    {member.groups.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-frosted-white truncate">
                    {member.groups.name}
                  </h3>
                  <p className="text-muted-grey text-sm truncate">
                    {member.groups.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {groups.length === 0 && conversations.length === 0 && (
        <div className="text-center py-12 glass-panel rounded-2xl">
          <MessageSquare className="w-12 h-12 text-muted-grey mx-auto mb-4" />
          <p className="text-muted-grey">No chats yet</p>
          <p className="text-muted-grey text-sm mt-2">
            Search for users to start chatting or join a group
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatsTab;
