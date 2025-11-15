import { useNavigate } from "react-router-dom";
import { User, Lock, Bell, Shield, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SettingsTab = () => {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Username", value: "anonymous_user" },
        { icon: Lock, label: "Change Password", value: "" },
      ],
    },
    {
      title: "Privacy",
      items: [
        { icon: Bell, label: "Notifications", value: "Enabled" },
        { icon: Shield, label: "Anonymous Mode", value: "Always On" },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Profile Card */}
      <div className="glass-blur rounded-3xl p-6 border border-soft-royal-blue/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-accent to-pale-cyan flex items-center justify-center">
            <User className="w-8 h-8 text-midnight-blue" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-soft-white">
              anonymous_user
            </h2>
            <p className="text-sm text-grey-blue">Student</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, idx) => (
        <div key={idx} className="space-y-3">
          <h3 className="text-sm font-semibold text-grey-blue uppercase tracking-wider px-2">
            {section.title}
          </h3>
          <div className="glass-blur rounded-2xl border border-soft-royal-blue/20 divide-y divide-soft-royal-blue/10">
            {section.items.map((item, itemIdx) => {
              const Icon = item.icon;
              return (
                <button
                  key={itemIdx}
                  className="w-full px-4 py-4 flex items-center gap-4 hover:bg-soft-royal-blue/20 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <Icon className="w-5 h-5 text-cyan-accent flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="text-soft-white font-medium">{item.label}</p>
                    {item.value && (
                      <p className="text-sm text-grey-blue">{item.value}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-grey-blue flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* About Section */}
      <div className="glass-blur rounded-2xl p-6 border border-soft-royal-blue/20">
        <h3 className="text-lg font-semibold text-soft-white mb-2">
          About Cloak
        </h3>
        <p className="text-sm text-grey-blue leading-relaxed">
          Student freedom, safety, and anonymity. Express yourself without
          labels or judgment. Your privacy is our priority.
        </p>
      </div>

      {/* Logout Button */}
      <Button
        onClick={() => navigate("/")}
        variant="outline"
        className="w-full h-12 rounded-2xl border-destructive/50 text-destructive hover:bg-destructive/10"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </Button>
    </div>
  );
};

export default SettingsTab;
