import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const ChatsTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    loadUserGroups();
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-soft-white">Your Chats</h2>

      <div className="space-y-3">
        {groups.length === 0 ? (
          <p className="text-grey-blue text-center py-8">
            No chats yet. Join a group to start chatting!
          </p>
        ) : (
          groups.map((member) => (
            <div
              key={member.id}
              onClick={() => navigate(`/chat/${member.groups.id}`)}
              className="glass-blur rounded-2xl p-4 border border-soft-royal-blue/30 hover:border-cyan-accent/50 cursor-pointer transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-accent/20 to-deep-indigo flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-cyan-accent" />
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
          ))
        )}
      </div>
    </div>
  );
};

export default ChatsTab;
