import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Mic, MoreVertical, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TrustDialog from "@/components/TrustDialog";
import VoiceNoteRecorder from "@/components/VoiceNoteRecorder";
import ReportDialog from "@/components/ReportDialog";
import WallpaperSelector from "@/components/WallpaperSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const Chat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showTrustDialog, setShowTrustDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showWallpaperDialog, setShowWallpaperDialog] = useState(false);
  const [wallpaper, setWallpaper] = useState("bg-midnight-blue");
  const [pendingVoiceNote, setPendingVoiceNote] = useState<Blob | null>(null);
  const [groupInfo, setGroupInfo] = useState<any>(null);

  useEffect(() => {
    if (!chatId) return;

    loadGroupInfo();
    loadMessages();

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${chatId}`,
        },
        () => loadMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const loadGroupInfo = async () => {
    const { data } = await supabase
      .from('groups')
      .select('*')
      .eq('id', chatId)
      .single();
    setGroupInfo(data);
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('group_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error("Failed to load messages");
      return;
    }

    if (data) {
      const messagesWithProfiles = await Promise.all(
        data.map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', msg.sender_id)
            .single();
          
          return {
            ...msg,
            sender: profile?.username || 'Anonymous',
            isSelf: msg.sender_id === user?.id,
          };
        })
      );
      setMessages(messagesWithProfiles);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user || !chatId) return;

    try {
      const { error } = await supabase.from('messages').insert({
        group_id: chatId,
        sender_id: user.id,
        content: message.trim(),
      });

      if (error) throw error;
      setMessage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };

  const handleVoiceNoteRecorded = (blob: Blob) => {
    setPendingVoiceNote(blob);
    setShowTrustDialog(true);
  };

  const handleTrustConfirm = async () => {
    if (!pendingVoiceNote || !user || !chatId) return;

    try {
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('voice-notes')
        .upload(fileName, pendingVoiceNote);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('voice-notes').getPublicUrl(fileName);

      const { error } = await supabase.from('messages').insert({
        group_id: chatId,
        sender_id: user.id,
        content: '[Voice Note]',
        is_voice_note: true,
        voice_note_url: data.publicUrl,
      });

      if (error) throw error;

      toast.success("Voice note sent!");
      setPendingVoiceNote(null);
      setShowTrustDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send voice note");
    }
  };

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden ${wallpaper}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 animated-bg opacity-40 pointer-events-none" />
      
      {/* Header */}
      <header className="glass-panel border-b border-glass-border px-4 py-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/home")}
              className="text-muted-grey hover:text-purple-accent transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-accent to-teal-accent flex items-center justify-center text-deep-black font-semibold relative">
                {groupInfo?.name?.charAt(0) || "G"}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-teal-accent rounded-full border-2 border-deep-black" />
              </div>
              <div>
                <h2 className="font-semibold text-frosted-white">
                  {groupInfo?.name || "Chat"}
                </h2>
                <p className="text-xs text-muted-grey">{groupInfo?.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWallpaperDialog(true)}
              className="text-muted-grey hover:text-purple-accent transition-colors"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowReportDialog(true)}
              className="text-muted-grey hover:text-purple-accent transition-colors"
            >
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isSelf ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] space-y-1 ${
                msg.isSelf ? "items-end" : "items-start"
              }`}
            >
              {!msg.isSelf && (
                <p className="text-xs text-purple-accent font-medium px-4">
                  {msg.sender}
                </p>
              )}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.isSelf
                    ? "chat-bubble-sent text-deep-black rounded-br-md"
                    : "chat-bubble-received text-frosted-white rounded-bl-md"
                }`}
              >
                {msg.is_voice_note ? (
                  <audio controls className="max-w-full">
                    <source src={msg.voice_note_url} type="audio/webm" />
                  </audio>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>
              <p className="text-xs text-muted-grey px-4">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="glass-panel border-t border-glass-border p-4 relative z-10">
        <div className="flex items-center gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 glass-panel border-glass-border text-frosted-white placeholder:text-muted-grey focus:border-purple-accent rounded-2xl h-11"
          />
          {message.trim() ? (
            <Button
              onClick={handleSend}
              size="icon"
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-purple-accent to-teal-accent hover:shadow-[var(--shadow-glow-teal)] text-deep-black"
            >
              <Send className="w-5 h-5" />
            </Button>
          ) : (
            <VoiceNoteRecorder onRecordingComplete={handleVoiceNoteRecorded} />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <TrustDialog
        open={showTrustDialog}
        onOpenChange={setShowTrustDialog}
        onConfirm={handleTrustConfirm}
      />
      {groupInfo && (
        <ReportDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          reportedUserId={groupInfo.id}
          reportedUsername={groupInfo.name}
        />
      )}
      <WallpaperSelector
        open={showWallpaperDialog}
        onOpenChange={setShowWallpaperDialog}
        onSelect={setWallpaper}
      />
    </div>
  );
};

export default Chat;
