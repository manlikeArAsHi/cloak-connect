import { useState } from "react";
import { MessageSquare, Users, Settings, Plus } from "lucide-react";
import NavButton from "@/components/NavButton";
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
    <div className="h-screen flex flex-col bg-midnight-blue">
      {/* Header */}
      <header className="glass-blur border-b border-soft-royal-blue/30 px-6 py-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-accent to-soft-royal-blue bg-clip-text text-transparent">
          CLOAK
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>

      {/* Bottom Navigation */}
      <nav className="glass-blur border-t border-soft-royal-blue/30 px-4 py-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <NavButton
            icon={<Plus />}
            label="Status"
            isActive={activeTab === "statuses"}
            onClick={() => setActiveTab("statuses")}
          />
          <NavButton
            icon={<MessageSquare />}
            label="Chats"
            isActive={activeTab === "chats"}
            onClick={() => setActiveTab("chats")}
          />
          <NavButton
            icon={<Users />}
            label="Groups"
            isActive={activeTab === "groups"}
            onClick={() => setActiveTab("groups")}
          />
          <NavButton
            icon={<Settings />}
            label="Settings"
            isActive={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </div>
      </nav>
    </div>
  );
};

export default Home;
