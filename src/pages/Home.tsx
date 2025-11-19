import { useState } from "react";
import { MessageSquare, Users, Settings, Plus } from "lucide-react";
import ChatsTab from "@/components/ChatsTab";
import GroupsTab from "@/components/GroupsTab";
import SettingsTab from "@/components/SettingsTab";
import StatusesTab from "@/components/StatusesTab";

const Home = () => {
  const [activeTab, setActiveTab] = useState<"chats" | "groups" | "settings" | "statuses">("chats");

  const renderContent = () => {
    switch (activeTab) {
      case "chats":
        return <ChatsTab />;
      case "groups":
        return <GroupsTab />;
      case "settings":
        return <SettingsTab />;
      case "statuses":
        return <StatusesTab />;
    }
  };

  return (
    <div className="h-screen flex bg-deep-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-bg opacity-40 pointer-events-none" />
      
      {/* Left Side Panel */}
      <aside className="w-20 glass-panel border-r border-glass-border flex flex-col items-center py-6 gap-6 relative z-10">
        {/* Logo */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-accent to-teal-accent bg-clip-text text-transparent">
            C
          </h1>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => setActiveTab("statuses")}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "statuses"
              ? "bg-gradient-to-r from-purple-accent/20 to-teal-accent/20 text-teal-accent shadow-[var(--shadow-glow-teal)]"
              : "text-muted-grey hover:text-purple-accent hover:bg-glass-panel"
          }`}
        >
          <Plus size={22} />
        </button>

        <button
          onClick={() => setActiveTab("chats")}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "chats"
              ? "bg-gradient-to-r from-purple-accent/20 to-teal-accent/20 text-teal-accent shadow-[var(--shadow-glow-teal)]"
              : "text-muted-grey hover:text-purple-accent hover:bg-glass-panel"
          }`}
        >
          <MessageSquare size={22} />
        </button>

        <button
          onClick={() => setActiveTab("groups")}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "groups"
              ? "bg-gradient-to-r from-purple-accent/20 to-teal-accent/20 text-teal-accent shadow-[var(--shadow-glow-teal)]"
              : "text-muted-grey hover:text-purple-accent hover:bg-glass-panel"
          }`}
        >
          <Users size={22} />
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "settings"
              ? "bg-gradient-to-r from-purple-accent/20 to-teal-accent/20 text-teal-accent shadow-[var(--shadow-glow-teal)]"
              : "text-muted-grey hover:text-purple-accent hover:bg-glass-panel"
          }`}
        >
          <Settings size={22} />
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="glass-panel border-b border-glass-border px-6 py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-accent to-teal-accent bg-clip-text text-transparent">
            CLOAK
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Home;
