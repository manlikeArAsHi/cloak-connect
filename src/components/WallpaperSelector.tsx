import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { toast } from "sonner";

interface WallpaperSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (wallpaper: string) => void;
}

const wallpapers = [
  { id: 'default', name: 'Default', color: 'bg-midnight-blue' },
  { id: 'gradient1', name: 'Ocean', color: 'bg-gradient-to-br from-deep-indigo to-soft-royal-blue' },
  { id: 'gradient2', name: 'Cyber', color: 'bg-gradient-to-br from-cyan-accent/20 to-midnight-blue' },
  { id: 'gradient3', name: 'Night Sky', color: 'bg-gradient-to-br from-midnight-blue via-deep-indigo to-soft-royal-blue' },
  { id: 'dark', name: 'Pure Dark', color: 'bg-black' },
  { id: 'subtle', name: 'Subtle', color: 'bg-deep-indigo' },
];

const WallpaperSelector = ({ open, onOpenChange, onSelect }: WallpaperSelectorProps) => {
  const handleSelect = (wallpaper: string) => {
    onSelect(wallpaper);
    toast.success("Wallpaper updated!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-blur border border-soft-royal-blue/30 rounded-3xl max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-cyan-accent/10 flex items-center justify-center mb-4">
            <Palette className="w-6 h-6 text-cyan-accent" />
          </div>
          <DialogTitle className="text-center text-soft-white text-xl">
            Choose Wallpaper
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {wallpapers.map((wallpaper) => (
            <button
              key={wallpaper.id}
              onClick={() => handleSelect(wallpaper.color)}
              className="group relative rounded-2xl overflow-hidden border-2 border-soft-royal-blue/30 hover:border-cyan-accent transition-all h-24"
            >
              <div className={`w-full h-full ${wallpaper.color}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight-blue/80 to-transparent flex items-end justify-center p-2">
                <span className="text-soft-white text-sm font-medium">
                  {wallpaper.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WallpaperSelector;
