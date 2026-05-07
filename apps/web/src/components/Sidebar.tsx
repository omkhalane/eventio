import { Calendar, Settings, User } from 'lucide-react';
import React from 'react';

import { cn } from '../lib/utils';

const LOGO_IMAGE = '/assets/logo.svg';

export default function Sidebar() {
  return (
    <aside className="border-border bg-card flex h-screen w-16 flex-col items-center border-r py-6 transition-colors duration-300">
      <div className="mb-12">
        <div className="bg-foreground flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-lg">
          <img src={LOGO_IMAGE} alt="" className="h-5 w-5 invert" />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-8">
        <SidebarIcon icon={<Calendar className="h-6 w-6" />} active />
      </nav>

      <div className="mb-6 flex flex-col items-center gap-6">
        <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-300 bg-slate-200">
          <User className="m-1.5 h-5 w-5 text-slate-500" />
        </div>
        <button className="text-slate-400 transition-colors hover:text-slate-900">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}

function SidebarIcon({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <div
      className={cn(
        'group relative cursor-pointer transition-all duration-200',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
    </div>
  );
}
