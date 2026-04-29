import { getSiteSettings, getAllSocialLinks } from "@/lib/data/site-config";
import { db } from "@/db";
import { members, siteStats } from "@/db/schema";
import { count, asc } from "drizzle-orm";
import Link from "next/link";
import { Settings, Share2, Bell, Users, ArrowRight, TrendingUp } from "lucide-react";
import StatsManager from "@/components/admin/StatsManager";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";

export default async function AdminDashboard() {
  const [settings, socialLinks, [memberCount], stats] = await Promise.all([
    getSiteSettings(),
    getAllSocialLinks(),
    db.select({ count: count() }).from(members),
    db.select().from(siteStats).orderBy(asc(siteStats.sortOrder)),
  ]);

  const cards = [
    {
      label: "Site Settings",
      value: `${Object.keys(settings).length} keys`,
      icon: Settings,
      href: "/admin/settings",
      color: "bg-brand-600",
    },
    {
      label: "Social Links",
      value: `${socialLinks.filter((l) => l.isActive).length} active`,
      icon: Share2,
      href: "/admin/social-links",
      color: "bg-violet-600",
    },
    {
      label: "Notices",
      value: "Manage",
      icon: Bell,
      href: "/admin/notices",
      color: "bg-amber-600",
    },
    {
      label: "Approved Members",
      value: `${memberCount?.count ?? 0} total`,
      icon: Users,
      href: "/admin/members",
      color: "bg-emerald-600",
    },
  ];

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back · Dipshikha Admin Panel</p>
        </div>
        <div className="flex gap-3">
          <Link href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
             View Website
          </Link>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex items-center gap-5"
          >
            <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg`}>
              <Icon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-slate-900 truncate">{value}</div>
              <div className="text-sm text-slate-500 font-medium">{label}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Stats Manager */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
             <TrendingUp className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-900">Homepage Impact Stats</h2>
             <p className="text-sm text-slate-500">Manage the counters shown on the landing page</p>
           </div>
        </div>
        <StatsManager initialStats={stats} />
      </div>

      {/* Quick links & System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Update Services", href: "/admin/services", icon: Settings, color: "text-brand-600", bg: "bg-brand-50" },
                { label: "Manage Team", href: "/admin/team", icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
                { label: "Upload Downloads", href: "/admin/downloads", icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-brand-200 hover:bg-slate-50 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                         <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700">{item.label}</span>
                   </div>
                   <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 transition-colors" />
                </Link>
              ))}
            </div>
         </div>

         <div className="bg-brand-900 rounded-[32px] p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 20px)' }}></div>
            <div className="relative z-10">
               <h2 className="text-xl font-bold mb-2">System Status</h2>
               <p className="text-brand-300 text-sm mb-6">All systems are operational and connected to Supabase.</p>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                     <span className="text-brand-200 text-sm">Database</span>
                     <span className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        Connected
                     </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                     <span className="text-brand-200 text-sm">Storage</span>
                     <span className="text-emerald-400 text-sm font-bold">Active</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                     <span className="text-brand-200 text-sm">Auth Mode</span>
                     <span className="text-brand-300 text-sm font-bold">Secret Key</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
      </div>
    </AuthenticatedLayout>
  );
}
