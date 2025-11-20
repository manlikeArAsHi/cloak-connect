import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import SpecialAccessButton from "./SpecialAccessButton";

const SettingsTab = () => {
  const { signOut, user } = useAuth();
  const [username, setUsername] = useState("");

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (data) {
      setUsername(data.username);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-frosted-white">Settings</h2>

      <div className="space-y-4">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-accent/30 to-teal-accent/30 flex items-center justify-center">
              <User className="w-8 h-8 text-purple-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-frosted-white text-lg">
                {username || "Anonymous"}
              </h3>
              <p className="text-muted-grey text-sm">Your anonymous handle</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-frosted-white">About Cloak</h3>
          <p className="text-muted-grey text-sm leading-relaxed">
            Cloak is a secure, anonymous social app designed for students. Your
            privacy and freedom of expression are our top priorities. No real
            names, no emails, no judgment—just authentic connection.
          </p>
        </div>

        <SpecialAccessButton />

        <Button
          onClick={() => {
            signOut();
            toast.success("Signed out successfully");
          }}
          className="w-full h-12 bg-gradient-to-r from-destructive to-destructive/80 hover:shadow-[var(--shadow-glow-purple)] text-frosted-white font-semibold rounded-2xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;
