"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Settings, Share2, Bell, LogOut, ExternalLink, Package, Users, Users2, Image as ImageIcon, Download, Shield, Megaphone, MessageSquare, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Hero Slides", href: "/admin/hero", icon: Sliders },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
  { label: "Social Links", href: "/admin/social-links", icon: Share2 },
  { label: "Notices", href: "/admin/notices", icon: Bell },
  { label: "News Ticker", href: "/admin/news-ticker", icon: Megaphone },
  { label: "Services", href: "/admin/services", icon: Package },
  { label: "Team Members", href: "/admin/team", icon: Users2 },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { label: "Downloads", href: "/admin/downloads", icon: Download },
  { label: "System Users", href: "/admin/users", icon: Shield },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.refresh();
    router.push("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-brand-900 text-white flex flex-col z-40 shadow-xl print:hidden">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" sizes="40px" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">DPS Admin</div>
            <div className="text-brand-400 text-[10px] uppercase tracking-wider">Control Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              pathname === href
                ? "bg-white/15 text-white"
                : "text-brand-200 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-brand-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <ExternalLink className="w-5 h-5" />
          View Site
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
