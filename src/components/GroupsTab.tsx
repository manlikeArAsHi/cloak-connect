import { Users, Briefcase, Gamepad2, Book } from "lucide-react";

const GroupsTab = () => {
  const groups = [
    {
      id: 1,
      name: "100lvl Hub",
      members: 234,
      category: "Level",
      icon: Book,
    },
    {
      id: 2,
      name: "200lvl Community",
      members: 189,
      category: "Level",
      icon: Book,
    },
    {
      id: 3,
      name: "300lvl Discussion",
      members: 156,
      category: "Level",
      icon: Book,
    },
    {
      id: 4,
      name: "400lvl Discussion",
      members: 142,
      category: "Level",
      icon: Book,
    },
    {
      id: 5,
      name: "Tech Enthusiasts",
      members: 87,
      category: "Interest",
      icon: Briefcase,
    },
    {
      id: 6,
      name: "Gaming Community",
      members: 65,
      category: "Interest",
      icon: Gamepad2,
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Level Groups */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-grey-blue uppercase tracking-wider px-2">
          By Level
        </h2>
        <div className="space-y-2">
          {groups
            .filter((g) => g.category === "Level")
            .map((group) => {
              const Icon = group.icon;
              return (
                <button
                  key={group.id}
                  className="w-full glass-blur rounded-2xl p-4 flex items-center gap-4 hover:bg-soft-royal-blue/30 transition-colors border border-soft-royal-blue/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-accent/20 to-cyan-accent/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-cyan-accent" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-soft-white">
                      {group.name}
                    </h3>
                    <p className="text-sm text-grey-blue">
                      {group.members} members
                    </p>
                  </div>
                  <Users className="w-5 h-5 text-grey-blue flex-shrink-0" />
                </button>
              );
            })}
        </div>
      </div>

      {/* Interest Groups */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-grey-blue uppercase tracking-wider px-2">
          By Interest
        </h2>
        <div className="space-y-2">
          {groups
            .filter((g) => g.category === "Interest")
            .map((group) => {
              const Icon = group.icon;
              return (
                <button
                  key={group.id}
                  className="w-full glass-blur rounded-2xl p-4 flex items-center gap-4 hover:bg-soft-royal-blue/30 transition-colors border border-soft-royal-blue/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-accent/20 to-cyan-accent/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-cyan-accent" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-soft-white">
                      {group.name}
                    </h3>
                    <p className="text-sm text-grey-blue">
                      {group.members} members
                    </p>
                  </div>
                  <Users className="w-5 h-5 text-grey-blue flex-shrink-0" />
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default GroupsTab;
