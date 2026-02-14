import { useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, Clock, CalendarDays, StickyNote } from "lucide-react";

const BOTTOM_NAV_ITEMS = [
  { label: "Home", icon: LayoutDashboard, path: "/team-portal/dashboard" },
  { label: "Tasks", icon: CheckSquare, path: "/team-portal/tasks" },
  { label: "Time", icon: Clock, path: "/team-portal/timesheet" },
  { label: "Leaves", icon: CalendarDays, path: "/team-portal/leaves" },
  { label: "Notes", icon: StickyNote, path: "/team-portal/notes" },
];

export default function TeamPortalBottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = location === item.path;
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[56px] transition-colors ${
                isActive
                  ? "text-[#C41E3A]"
                  : "text-gray-400"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
