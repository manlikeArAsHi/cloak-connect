interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton = ({ icon, label, isActive, onClick }: NavButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${
        isActive ? "text-cyan-accent" : "text-grey-blue hover:text-cyan-accent"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default NavButton;
