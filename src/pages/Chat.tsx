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
    <div className={`h-screen flex flex-col ${wallpaper}`}>
      {/* Header */}
      <header className="glass-blur border-b border-soft-royal-blue/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/home")}
              className="text-grey-blue hover:text-cyan-accent transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="font-semibold text-soft-white">
                {groupInfo?.name || "Chat"}
              </h2>
              <p className="text-xs text-grey-blue">{groupInfo?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWallpaperDialog(true)}
              className="text-grey-blue hover:text-cyan-accent transition-colors"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowReportDialog(true)}
              className="text-grey-blue hover:text-cyan-accent transition-colors"
            >
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                <p className="text-xs text-cyan-accent font-medium px-4">
                  {msg.sender}
                </p>
              )}
              <div
                className={`rounded-3xl px-4 py-3 ${
                  msg.isSelf
                    ? "bg-gradient-to-br from-cyan-accent to-cyan-accent/80 text-midnight-blue rounded-br-lg"
                    : "bg-deep-indigo text-soft-white rounded-bl-lg"
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
              <p className="text-xs text-grey-blue px-4">
                {new Date(msg.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="glass-blur border-t border-soft-royal-blue/30 p-4">
        <div className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-deep-indigo/50 border-soft-royal-blue text-soft-white placeholder:text-grey-blue rounded-3xl h-11"
          />
          {message.trim() ? (
            <Button
              onClick={handleSend}
              size="icon"
              className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-accent to-cyan-accent/80 hover:from-cyan-accent/90 hover:to-cyan-accent/70"
            >
              <Send className="w-5 h-5 text-midnight-blue" />
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
