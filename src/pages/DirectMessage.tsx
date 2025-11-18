import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MoreVertical, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import VoiceNoteRecorder from "@/components/VoiceNoteRecorder";
import TrustDialog from "@/components/TrustDialog";
import DMSettingsDialog from "@/components/DMSettingsDialog";
import MediaUpload from "@/components/MediaUpload";

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
  const [pendingMedia, setPendingMedia] = useState<File | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string>("");
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
        setOtherUserId(participants[0].user_id);
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
        .is("deleted_at", null)
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
    if ((!newMessage.trim() && !selectedMedia) || !user) return;

    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload media if selected
      if (selectedMedia) {
        const fileName = `${Date.now()}-${selectedMedia.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("voice-notes")
          .upload(fileName, selectedMedia);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("voice-notes")
          .getPublicUrl(fileName);

        mediaUrl = publicUrl;
        mediaType = selectedMedia.type;
      }

      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage.trim() || "Media",
        media_url: mediaUrl,
        media_type: mediaType,
      });

      if (error) throw error;
      setNewMessage("");
      setSelectedMedia(null);
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

  const handleMediaSelect = (file: File) => {
    setPendingMedia(file);
    setShowTrustDialog(true);
  };

  const handleMediaTrustConfirm = async () => {
    if (!pendingMedia || !user) return;

    try {
      const fileName = `${Date.now()}-${pendingMedia.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("voice-notes")
        .upload(fileName, pendingMedia);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("voice-notes")
        .getPublicUrl(fileName);

      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: "Media",
        media_url: publicUrl,
        media_type: pendingMedia.type,
      });

      if (error) throw error;
      toast.success("Media sent!");
    } catch (error: any) {
      toast.error("Failed to send media");
      console.error(error);
    } finally {
      setPendingMedia(null);
      setShowTrustDialog(false);
    }
  };

  const handleTrustConfirm = async () => {
    if (pendingMedia) {
      await handleMediaTrustConfirm();
      return;
    }

    if (!pendingVoiceNote || !user) return;

    try {
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
      <header className="glass-blur border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            className="text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              @{otherUser?.username || "Loading..."}
            </h1>
            <p className="text-xs text-muted-foreground">Direct Message</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
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
                  <div className="space-y-2">
                    <audio controls src={message.voice_note_url} className="w-full" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(message.voice_note_url, '_blank')}
                      className="w-full text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ) : message.media_url ? (
                  <div className="space-y-2">
                    {message.media_type?.startsWith("image/") ? (
                      <img
                        src={message.media_url}
                        alt="Shared media"
                        className="rounded-lg max-w-full"
                      />
                    ) : message.media_type === "application/pdf" ? (
                      <div className="flex items-center gap-2 p-2 bg-background/20 rounded-lg">
                        <Download className="w-4 h-4" />
                        <span className="text-sm">PDF Document</span>
                      </div>
                    ) : (
                      <video controls src={message.media_url} className="rounded-lg max-w-full" />
                    )}
                    {message.content !== "Media" && (
                      <p className="break-words">{message.content}</p>
                    )}
                  </div>
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
      <div className="glass-blur border-t border-border p-4">
        <div className="flex gap-2 items-end">
          <VoiceNoteRecorder onRecordingComplete={handleVoiceNoteComplete} />
          <MediaUpload
            onMediaSelect={setSelectedMedia}
            onClear={() => setSelectedMedia(null)}
            selectedFile={selectedMedia}
          />
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={sendMessage}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <TrustDialog
        open={showTrustDialog}
        onOpenChange={setShowTrustDialog}
        onConfirm={handleTrustConfirm}
      />

      <DMSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        otherUserId={otherUserId}
        otherUsername={otherUser?.username || ""}
        conversationId={conversationId || ""}
        onBlock={() => navigate("/home")}
      />
    </div>
  );
};

export default DirectMessage;
