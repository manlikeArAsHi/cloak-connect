import { useState } from "react";
import { MessageSquare, Users, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatsTab from "@/components/ChatsTab";
import GroupsTab from "@/components/GroupsTab";
import SettingsTab from "@/components/SettingsTab";

type Tab = "chats" | "groups" | "settings";

const Home = () => {
  const [activeTab, setActiveTab] = useState<Tab>("chats");

  const tabs = [
    { id: "chats" as Tab, label: "Chats", icon: MessageSquare },
    { id: "groups" as Tab, label: "Groups", icon: Users },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="glass-blur border-b border-soft-royal-blue/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-soft-white tracking-wider">
            CLOAK
          </h1>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-accent to-pale-cyan" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "chats" && <ChatsTab />}
        {activeTab === "groups" && <GroupsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>

      {/* Floating Action Button */}
      {activeTab !== "settings" && (
        <Button
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-accent to-cyan-accent/80 hover:from-cyan-accent/90 hover:to-cyan-accent/70 shadow-glow"
          size="icon"
        >
          <Plus className="w-6 h-6 text-midnight-blue" />
        </Button>
      )}

      {/* Bottom Navigation */}
      <nav className="glass-blur border-t border-soft-royal-blue/30 px-6 py-4">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? "text-cyan-accent" : "text-grey-blue"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Home;
