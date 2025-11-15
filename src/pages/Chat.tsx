import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Smile, Mic, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TrustDialog from "@/components/TrustDialog";

const Chat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [message, setMessage] = useState("");
  const [showTrustDialog, setShowTrustDialog] = useState(false);

  const mockMessages = [
    {
      id: 1,
      sender: "tech_wizard",
      content: "Hey! Anyone working on the CS project?",
      timestamp: "10:30 AM",
      isSelf: false,
    },
    {
      id: 2,
      sender: "You",
      content: "Yeah, I'm stuck on the algorithm part",
      timestamp: "10:32 AM",
      isSelf: true,
    },
    {
      id: 3,
      sender: "code_ninja",
      content: "I can help with that. Want to meet up?",
      timestamp: "10:35 AM",
      isSelf: false,
    },
    {
      id: 4,
      sender: "You",
      content: "That would be great! Library at 3?",
      timestamp: "10:36 AM",
      isSelf: true,
    },
  ];

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage("");
    }
  };

  const handleAttachment = () => {
    setShowTrustDialog(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
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
                400lvl Discussion
              </h2>
              <p className="text-xs text-grey-blue">12 members online</p>
            </div>
          </div>
          <button className="text-grey-blue hover:text-cyan-accent transition-colors">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockMessages.map((msg) => (
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
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              <p className="text-xs text-grey-blue px-4">{msg.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="glass-blur border-t border-soft-royal-blue/30 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAttachment}
            className="text-grey-blue hover:text-cyan-accent transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="text-grey-blue hover:text-cyan-accent transition-colors">
            <Smile className="w-5 h-5" />
          </button>
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
            <button className="text-grey-blue hover:text-cyan-accent transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Trust Dialog */}
      <TrustDialog
        open={showTrustDialog}
        onOpenChange={setShowTrustDialog}
        onConfirm={() => {
          setShowTrustDialog(false);
          // Handle file upload
        }}
      />
    </div>
  );
};

export default Chat;
