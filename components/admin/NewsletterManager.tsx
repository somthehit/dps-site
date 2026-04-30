"use client";

import { useEffect, useState } from "react";
import { Trash2, Mail, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Subscriber = {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  email_sent_count?: number;
  last_email_sent_at?: string;
};

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      setSubscribers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/newsletter/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchSubscribers();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    try {
      await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
      fetchSubscribers();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
          <p className="text-slate-500">Manage your email newsletter list ({subscribers.length} total)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-slate-700">Email</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-slate-700">Status</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-slate-700">Subscribed</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-slate-700 text-center">Emails Sent</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-slate-700">Last Email</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscribers.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{sub.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(sub.id, sub.is_active)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      sub.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {sub.is_active ? (
                      <><CheckCircle2 className="w-3 h-3" /> Active</>
                    ) : (
                      <><XCircle className="w-3 h-3" /> Inactive</>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('ne-NP') : 'N/A'}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                    📧 {sub.email_sent_count || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {sub.last_email_sent_at 
                    ? new Date(sub.last_email_sent_at).toLocaleDateString('ne-NP') + ' ' + new Date(sub.last_email_sent_at).toLocaleTimeString('ne-NP', {hour: '2-digit', minute:'2-digit'})
                    : 'Never'
                  }
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSubscriber(sub.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No subscribers found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
