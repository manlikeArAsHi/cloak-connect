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
      <h2 className="text-xl font-semibold text-soft-white">Settings</h2>

      <div className="space-y-4">
        <div className="glass-blur rounded-2xl p-6 border border-soft-royal-blue/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-accent/20 to-deep-indigo flex items-center justify-center">
              <User className="w-8 h-8 text-cyan-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-soft-white text-lg">
                {username || "Anonymous"}
              </h3>
              <p className="text-grey-blue text-sm">Your anonymous handle</p>
            </div>
          </div>
        </div>

        <div className="glass-blur rounded-2xl p-6 border border-soft-royal-blue/30 space-y-4">
          <h3 className="font-semibold text-soft-white">About Cloak</h3>
          <p className="text-grey-blue text-sm leading-relaxed">
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
          className="w-full h-12 bg-gradient-to-r from-amber to-amber/80 hover:from-amber/90 hover:to-amber/70 text-midnight-blue font-semibold rounded-2xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;
