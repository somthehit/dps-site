"use client";

import { useState, useEffect } from "react";
import { Trash2, Mail, Phone, User, CheckCircle, MessageSquare, Search, Filter, Eye, X } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export default function MessageManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        if (isMounted) setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMessages();
    return () => { isMounted = false; };
  }, []);

  const getSecret = () =>
    typeof window !== "undefined"
      ? (document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? "")
      : "";

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => m.id === id ? updated : m));
        if (viewingMessage?.id === id) setViewingMessage(updated);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error(`Failed to update status: ${res.status}`, errData);
        alert(`Error: ${errData.error || 'Failed to update status'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Check console.");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": getSecret() },
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        setViewingMessage(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMessages = messages
    .filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                           m.subject.toLowerCase().includes(search.toLowerCase()) ||
                           m.phone.includes(search);
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{messages.length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Messages</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{messages.filter(m => m.status === 'unread').length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unread</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{messages.filter(m => m.status !== 'unread').length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, subject or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none text-sm font-bold text-slate-600 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Message List */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sender</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map(msg => (
                <tr key={msg.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer ${msg.status === 'unread' ? 'bg-brand-50/20' : ''}`} onClick={() => { setViewingMessage(msg); if(msg.status === 'unread') updateStatus(msg.id, 'read'); }}>
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-900">{msg.name}</div>
                    <div className="text-xs text-slate-400">{msg.phone}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{msg.subject}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-300">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      msg.status === 'unread' ? 'bg-amber-100 text-amber-700' :
                      msg.status === 'read' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {msg.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setViewingMessage(msg); if(msg.status === 'unread') updateStatus(msg.id, 'read'); }} className="p-2 bg-slate-100 hover:bg-brand-500 hover:text-white rounded-xl transition-all"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => deleteMessage(msg.id)} className="p-2 bg-slate-100 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMessages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <MessageSquare className="w-12 h-12 mb-4" />
                      <p className="font-bold">No messages found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Modal */}
      {viewingMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{viewingMessage.subject}</h3>
                <div className="text-xs text-slate-400 mt-1">Received on {new Date(viewingMessage.createdAt).toLocaleString()}</div>
              </div>
              <button onClick={() => setViewingMessage(null)} className="p-3 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><User className="w-3 h-3" /> Sender</div>
                  <div className="font-bold text-slate-700">{viewingMessage.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Phone className="w-3 h-3" /> Phone</div>
                  <div className="font-bold text-slate-700">{viewingMessage.phone}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Mail className="w-3 h-3" /> Email</div>
                  <div className="font-bold text-slate-700">{viewingMessage.email || "N/A"}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Content</div>
                <div className="p-6 bg-slate-50 rounded-3xl text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100">
                  {viewingMessage.message}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(viewingMessage.id, 'unread')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewingMessage.status === 'unread' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Mark Unread</button>
                  <button onClick={() => updateStatus(viewingMessage.id, 'read')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewingMessage.status === 'read' ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Mark Read</button>
                  <button onClick={() => updateStatus(viewingMessage.id, 'replied')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewingMessage.status === 'replied' ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Replied</button>
                </div>
                <button onClick={() => deleteMessage(viewingMessage.id)} className="flex items-center gap-2 px-6 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 className="w-4 h-4" /> Delete Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
