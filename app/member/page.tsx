"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Wallet,
  FileText,
  Bell,
  Settings,
  LogOut,
  Clock,
  TrendingUp,
  PiggyBank,
  Receipt,
  ArrowUpRight,
  Sparkles,
  Building2,
  Users,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function MemberDashboard() {
  const [user, setUser] = useState<{ email: string; fullName?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          email: user.email || "",
          fullName: user.user_metadata?.full_name || "",
        });
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const comingSoonFeatures = [
    {
      icon: Wallet,
      title: "My Savings",
      titleNe: "मेरो बचत",
      description: "View your savings balance and transaction history",
      descriptionNe: "आफ्नो बचत रकम र कारोबार इतिहास हेर्नुहोस्",
    },
    {
      icon: TrendingUp,
      title: "Loan Status",
      titleNe: "ऋण स्थिति",
      description: "Check your loan applications and repayment status",
      descriptionNe: "आफ्नो ऋण आवेदन र भुक्तान स्थिति जाँच गर्नुहोस्",
    },
    {
      icon: Receipt,
      title: "Statements",
      titleNe: "विवरण",
      description: "Download monthly and yearly account statements",
      descriptionNe: "मासिक र वार्षिक खाता विवरण डाउनलोड गर्नुहोस्",
    },
    {
      icon: PiggyBank,
      title: "Deposits",
      titleNe: "निक्षेप",
      description: "Manage your fixed and recurring deposits",
      descriptionNe: "आफ्नो स्थायी र आवर्ती निक्षेप व्यवस्थापन गर्नुहोस्",
    },
    {
      icon: FileText,
      title: "Documents",
      titleNe: "कागजात",
      description: "Access your share certificates and documents",
      descriptionNe: "आफ्नो शेयर प्रमाणपत्र र कागजातहरू पहुँच गर्नुहोस्",
    },
    {
      icon: Bell,
      title: "Notifications",
      titleNe: "सूचनाहरू",
      description: "Get alerts for payments, meetings, and updates",
      descriptionNe: "भुक्तान, बैठक र अपडेटहरूको लागि अलर्ट प्राप्त गर्नुहोस्",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
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
          <Link
            href="/member"
            className="flex items-center gap-3 px-4 py-3 bg-brand-50 text-brand-700 rounded-xl font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>

          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <User className="w-5 h-5" />
            My Profile
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Wallet className="w-5 h-5" />
            My Savings
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <FileText className="w-5 h-5" />
            Documents
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Member Dashboard</h2>
              <p className="text-sm text-slate-500">Welcome to your personal portal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-slate-900">{user?.fullName || "Member"}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-brand-700" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Namaste, {user?.fullName || "Member"}! 🙏</h3>
                <p className="text-brand-100">Your member dashboard is being set up. Exciting features coming soon!</p>
                <p className="text-brand-200 text-sm mt-1">नमस्ते! तपाईंको सदस्य ड्यासबोर्ड तयार हुँदैछ।</p>
              </div>
              <Sparkles className="w-12 h-12 text-brand-200 opacity-50" />
            </div>
          </div>

          {/* Quick Stats - Coming Soon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Coming Soon
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">--</p>
              <p className="text-sm text-slate-500">Total Savings (बचत रकम)</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Coming Soon
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">--</p>
              <p className="text-sm text-slate-500">Share Holdings (शेयर)</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Coming Soon
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">--</p>
              <p className="text-sm text-slate-500">Active Loans (सक्रिय ऋण)</p>
            </div>
          </div>

          {/* Features Grid */}
          <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming Features / आगामी सुविधाहरू</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comingSoonFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:border-brand-300 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-brand-50 transition-colors">
                    <feature.icon className="w-6 h-6 text-slate-600 group-hover:text-brand-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    SOON
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{feature.title}</h4>
                <p className="text-xs text-slate-500 mb-2">{feature.titleNe}</p>
                <p className="text-sm text-slate-600">{feature.description}</p>
                <p className="text-xs text-slate-400 mt-1">{feature.descriptionNe}</p>
              </div>
            ))}
          </div>

          {/* Latest Updates */}
          <div className="mt-8 bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Latest Updates / पछिल्ला अपडेटहरू</h3>
              <span className="text-xs text-slate-400">No new updates</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Member Portal Launched</p>
                  <p className="text-sm text-slate-500">New member dashboard is now available for all approved members.</p>
                </div>
                <span className="text-xs text-slate-400">Today</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
