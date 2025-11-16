import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import VoiceNoteRecorder from "@/components/VoiceNoteRecorder";
import TrustDialog from "@/components/TrustDialog";

const DirectMessage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showTrustDialog, setShowTrustDialog] = useState(false);
  const [pendingVoiceNote, setPendingVoiceNote] = useState<Blob | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    fetchOtherUser();
    fetchMessages();

    const channel = supabase
      .channel(`dm:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchOtherUser = async () => {
    try {
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .neq("user_id", user?.id);

      if (participants && participants[0]) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", participants[0].user_id)
          .single();

        setOtherUser(profile);
      }
    } catch (error) {
      console.error("Error fetching other user:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch sender profiles for each message
      const messagesWithSenders = await Promise.all(
        (data || []).map(async (message) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", message.sender_id)
            .single();

          return {
            ...message,
            sender: profile,
          };
        })
      );

      setMessages(messagesWithSenders);
    } catch (error: any) {
      toast.error("Failed to load messages");
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage,
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  const handleVoiceNoteComplete = async (blob: Blob) => {
    setPendingVoiceNote(blob);
    setShowVoiceRecorder(false);
    setShowTrustDialog(true);
  };

  const handleTrustConfirm = async () => {
    if (!pendingVoiceNote || !user) return;

    try {
      // Upload voice note to storage
      const fileName = `voice-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("voice-notes")
        .upload(fileName, pendingVoiceNote);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("voice-notes")
        .getPublicUrl(fileName);

      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: "Voice note",
        is_voice_note: true,
        voice_note_url: publicUrl,
      });

      if (error) throw error;
      toast.success("Voice note sent!");
    } catch (error: any) {
      toast.error("Failed to send voice note");
      console.error(error);
    } finally {
      setPendingVoiceNote(null);
      setShowTrustDialog(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-midnight-blue">
      {/* Header */}
      <header className="glass-blur border-b border-soft-royal-blue/30 px-6 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/home")}
          className="text-soft-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-soft-white">
            @{otherUser?.username || "Loading..."}
          </h1>
          <p className="text-xs text-grey-blue">Direct Message</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  isOwn
                    ? "bg-gradient-to-r from-cyan-accent to-soft-royal-blue text-midnight-blue"
                    : "glass-blur text-soft-white"
                }`}
              >
                {message.is_voice_note ? (
                  <audio controls src={message.voice_note_url} className="w-full" />
                ) : (
                  <p className="break-words">{message.content}</p>
                )}
                <p
                  className={`text-xs mt-2 ${
                    isOwn ? "text-midnight-blue/70" : "text-grey-blue"
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-blur border-t border-soft-royal-blue/30 p-4">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVoiceRecorder(true)}
            className="text-cyan-accent"
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="bg-deep-indigo/50 border-soft-royal-blue text-soft-white"
          />
          <Button
            onClick={sendMessage}
            className="bg-gradient-to-r from-cyan-accent to-soft-royal-blue"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {showVoiceRecorder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-blur rounded-3xl p-6 max-w-md w-full">
            <VoiceNoteRecorder onRecordingComplete={handleVoiceNoteComplete} />
          </div>
        </div>
      )}

      <TrustDialog
        open={showTrustDialog}
        onOpenChange={setShowTrustDialog}
        onConfirm={handleTrustConfirm}
      />
    </div>
  );
};

export default DirectMessage;
