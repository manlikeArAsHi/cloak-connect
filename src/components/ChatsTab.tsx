import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const ChatsTab = () => {
  const navigate = useNavigate();

  const mockChats = [
    {
      id: 1,
      name: "400lvl Discussion",
      lastMessage: "Anyone up for study session?",
      time: "2m ago",
      unread: 3,
      isGroup: true,
    },
    {
      id: 2,
      name: "anonymous_student",
      lastMessage: "Thanks for the notes!",
      time: "15m ago",
      unread: 0,
      isGroup: false,
    },
    {
      id: 3,
      name: "Tech Enthusiasts",
      lastMessage: "Check out this new framework",
      time: "1h ago",
      unread: 7,
      isGroup: true,
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      {mockChats.length > 0 ? (
        <div className="divide-y divide-soft-royal-blue/20">
          {mockChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-deep-indigo/30 transition-colors text-left"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-soft-royal-blue to-deep-indigo flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-cyan-accent" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-soft-white truncate">
                    {chat.name}
                  </h3>
                  <span className="text-xs text-grey-blue flex-shrink-0 ml-2">
                    {chat.time}
                  </span>
                </div>
                <p className="text-sm text-grey-blue truncate">
                  {chat.lastMessage}
                </p>
              </div>

              {/* Unread Badge */}
              {chat.unread > 0 && (
                <div className="w-6 h-6 rounded-full bg-cyan-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-midnight-blue">
                    {chat.unread}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <MessageCircle className="w-16 h-16 text-grey-blue mb-4" />
          <h3 className="text-lg font-semibold text-soft-white mb-2">
            No chats yet
          </h3>
          <p className="text-sm text-grey-blue">
            Start a conversation or join a group
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatsTab;
