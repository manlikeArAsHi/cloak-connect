import { useEffect, useState } from "react";
import { Users, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const GroupsTab = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGroups();
    loadUserGroups();
  }, [user]);

  const loadGroups = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('name');

    if (error) {
      toast.error("Failed to load groups");
      return;
    }

    setGroups(data || []);
  };

  const loadUserGroups = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);

    if (data) {
      setUserGroups(new Set(data.map(m => m.group_id)));
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('group_members').insert({
        group_id: groupId,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Joined group!");
      loadUserGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error} = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Left group");
      loadUserGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to leave group");
    }
  };

  const levelGroups = groups.filter(g => g.type === 'level');
  const interestGroups = groups.filter(g => g.type === 'interest');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-frosted-white mb-4">
          Level Groups
        </h2>
        <div className="space-y-3">
          {levelGroups.map((group) => {
            const isMember = userGroups.has(group.id);
            return (
              <div
                key={group.id}
                className="glass-panel rounded-2xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-accent/30 to-teal-accent/30 flex items-center justify-center">
                      <Hash className="w-6 h-6 text-teal-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-frosted-white">
                        {group.name}
                      </h3>
                      <p className="text-muted-grey text-sm">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => isMember ? leaveGroup(group.id) : joinGroup(group.id)}
                    className={`px-6 py-2 rounded-2xl font-medium transition-all ${
                      isMember
                        ? "bg-glass-panel text-muted-grey hover:bg-glass-border"
                        : "bg-gradient-to-r from-purple-accent to-teal-accent text-deep-black hover:shadow-[var(--shadow-glow-purple)]"
                    }`}
                  >
                    {isMember ? "Leave" : "Join"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-soft-white mb-4">
          Interest Groups
        </h2>
        <div className="space-y-3">
          {interestGroups.map((group) => {
            const isMember = userGroups.has(group.id);
            return (
              <div
                key={group.id}
                className="glass-blur rounded-2xl p-4 border border-soft-royal-blue/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-accent/20 to-deep-indigo flex items-center justify-center">
                      <Users className="w-6 h-6 text-cyan-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-soft-white">
                        {group.name}
                      </h3>
                      <p className="text-grey-blue text-sm">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => isMember ? leaveGroup(group.id) : joinGroup(group.id)}
                    className={`px-6 py-2 rounded-2xl font-medium transition-all ${
                      isMember
                        ? "bg-grey-blue/20 text-grey-blue hover:bg-grey-blue/30"
                        : "bg-gradient-to-r from-cyan-accent to-cyan-accent/80 text-midnight-blue hover:from-cyan-accent/90"
                    }`}
                  >
                    {isMember ? "Leave" : "Join"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GroupsTab;
