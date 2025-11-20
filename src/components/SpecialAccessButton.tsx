import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

const SpecialAccessButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasSpecialAccess, setHasSpecialAccess] = useState(false);

  useEffect(() => {
    checkSpecialAccess();
  }, [user]);

  const checkSpecialAccess = async () => {
    if (!user) return;

    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isSpecial = roles?.some((r) => r.role === "special" || r.role === "admin");
      setHasSpecialAccess(isSpecial);
    } catch (error) {
      console.error("Error checking access:", error);
    }
  };

  if (!hasSpecialAccess) return null;

  return (
    <Button
      onClick={() => navigate("/special-access")}
      variant="outline"
      className="gap-2 border-purple-accent/30 text-purple-accent hover:bg-purple-accent/10 rounded-2xl"
    >
      <Shield className="w-4 h-4" />
      Special Access
    </Button>
  );
};

export default SpecialAccessButton;