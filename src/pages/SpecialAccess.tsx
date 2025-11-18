import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const SpecialAccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appeals, setAppeals] = useState<any[]>([]);
  const [hasSpecialAccess, setHasSpecialAccess] = useState(false);
  const [loading, setLoading] = useState(true);

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

      if (isSpecial) {
        fetchAppeals();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking access:", error);
      setLoading(false);
    }
  };

  const fetchAppeals = async () => {
    try {
      const { data, error } = await supabase
        .from("appeals")
        .select(`
          *,
          profiles:user_id (username)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAppeals(data || []);
    } catch (error) {
      console.error("Error fetching appeals:", error);
      toast.error("Failed to load appeals");
    } finally {
      setLoading(false);
    }
  };

  const handlePardon = async (appealId: string, userId: string) => {
    try {
      // Update appeal status
      const { error: appealError } = await supabase
        .from("appeals")
        .update({
          status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", appealId);

      if (appealError) throw appealError;

      // Unsuspend the user
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          is_suspended: false,
          suspend_reason: null,
          suspended_at: null,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast.success("User has been pardoned");
      fetchAppeals();
    } catch (error: any) {
      toast.error("Failed to pardon user");
      console.error(error);
    }
  };

  const handleReject = async (appealId: string) => {
    try {
      const { error } = await supabase
        .from("appeals")
        .update({
          status: "rejected",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", appealId);

      if (error) throw error;

      toast.success("Appeal has been rejected");
      fetchAppeals();
    } catch (error: any) {
      toast.error("Failed to reject appeal");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!hasSpecialAccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-6">
        <Shield className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6 text-center">
          You don't have special access privileges to view this page.
        </p>
        <Button onClick={() => navigate("/home")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Special Access Panel
          </h1>
          <p className="text-xs text-muted-foreground">Manage appeals and pardons</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <Card className="bg-card border-border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Pending Appeals
            </h2>
            
            {appeals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No appeals to review
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appeals.map((appeal) => (
                    <TableRow key={appeal.id}>
                      <TableCell className="font-medium">
                        @{appeal.profiles?.username}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {appeal.message}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appeal.status === "pending"
                              ? "secondary"
                              : appeal.status === "approved"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {appeal.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(appeal.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {appeal.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePardon(appeal.id, appeal.user_id)}
                              className="border-success/30 text-success hover:bg-success/10"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Pardon
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(appeal.id)}
                              className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SpecialAccess;