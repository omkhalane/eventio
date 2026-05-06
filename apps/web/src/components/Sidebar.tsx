import React from 'react';
import { Calendar, Settings, Moon, Sun, User, Info, Users, Infinity as InfinityIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  return (
    <aside className="w-16 h-screen flex flex-col items-center py-6 border-r border-border bg-card transition-colors duration-300">
      <div className="mb-12">
        <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center shadow-lg">
          <InfinityIcon className="w-5 h-5 text-background" strokeWidth={3} />
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-8">
        <SidebarIcon icon={<Calendar className="w-6 h-6" />} active />
      </nav>

      <div className="flex flex-col gap-6 mb-6 items-center">
        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
          <User className="w-5 h-5 m-1.5 text-slate-500" />
        </div>
        <button className="text-slate-400 hover:text-slate-900 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}

function SidebarIcon({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <div
      className={cn(
        "cursor-pointer transition-all duration-200 group relative",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
    </div>
  );
}
