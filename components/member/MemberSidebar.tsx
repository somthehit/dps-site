"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Wallet,
  FileText,
  Settings,
  LogOut,
  Building2,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberSidebarProps {
  onLogout?: () => void;
}

export default function MemberSidebar({ onLogout }: MemberSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/member", icon: LayoutDashboard, implemented: true },
    { name: "My Profile", href: "/member/profile", icon: User, implemented: false },
    { name: "Online Forms", href: "/member/forms", icon: FileText, implemented: true },
    { name: "My Submissions", href: "/member/submissions", icon: ClipboardList, implemented: true },
    { name: "My Savings", href: "/member/savings", icon: Wallet, implemented: false },
    { name: "Documents", href: "/member/documents", icon: Building2, implemented: false },
    { name: "Settings", href: "/member/settings", icon: Settings, implemented: false },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-700 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">दिपशिखा सहकारी</h1>
            <p className="text-[10px] text-slate-500">DPS Member Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.implemented && (pathname === item.href || (item.href !== "/member" && pathname.startsWith(item.href)));

          const content = (
            <>
              <item.icon className={cn("w-5 h-5", isActive ? "text-brand-700" : "text-slate-400")} />
              <span className="flex-1">{item.name}</span>
              {!item.implemented && (
                <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md font-bold">SOON</span>
              )}
            </>
          );

          if (!item.implemented) {
            return (
              <div
                key={item.name}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-400 cursor-not-allowed"
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      {onLogout && (
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
