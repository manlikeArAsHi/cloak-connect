import { useState } from "react";
import { MessageSquare, Users, Settings, Plus, User } from "lucide-react";
import ChatsTab from "@/components/ChatsTab";
import GroupsTab from "@/components/GroupsTab";
import SettingsTab from "@/components/SettingsTab";
import StatusesTab from "@/components/StatusesTab";

const Home = () => {
  const [activeTab, setActiveTab] = useState<"chats" | "groups" | "settings" | "statuses">("statuses");

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
    <div className="h-screen flex bg-midnight-blue">
      {/* Left Side Panel */}
      <aside className="w-20 glass-blur border-r border-soft-royal-blue/30 flex flex-col items-center py-6 gap-6">
        {/* Logo */}
        <div className="mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-accent to-soft-royal-blue bg-clip-text text-transparent">
            C
          </h1>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => setActiveTab("statuses")}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "statuses"
              ? "bg-cyan-accent/20 text-cyan-accent shadow-glow"
              : "text-grey-blue hover:text-cyan-accent hover:bg-soft-royal-blue/30"
          }`}
        >
          <Plus size={24} />
        </button>

        <button
          onClick={() => setActiveTab("chats")}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "chats"
              ? "bg-cyan-accent/20 text-cyan-accent shadow-glow"
              : "text-grey-blue hover:text-cyan-accent hover:bg-soft-royal-blue/30"
          }`}
        >
          <MessageSquare size={24} />
        </button>

        <button
          onClick={() => setActiveTab("groups")}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "groups"
              ? "bg-cyan-accent/20 text-cyan-accent shadow-glow"
              : "text-grey-blue hover:text-cyan-accent hover:bg-soft-royal-blue/30"
          }`}
        >
          <Users size={24} />
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "settings"
              ? "bg-cyan-accent/20 text-cyan-accent shadow-glow"
              : "text-grey-blue hover:text-cyan-accent hover:bg-soft-royal-blue/30"
          }`}
        >
          <Settings size={24} />
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="glass-blur border-b border-soft-royal-blue/30 px-6 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-accent to-soft-royal-blue bg-clip-text text-transparent">
            CLOAK
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Home;
