"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { getSupportTickets, getTicketMessages, updateTicketStatus, sendTicketMessage, processRefund } from "@/app/admin/support/actions";

//  SVG ICON SYSTEM (v2 - Expanded for Support)
const Icons = {
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  User: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CheckCircle: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Paperclip: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
  Send: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Alert: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  CreditCard: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
};

export default function SupportCenter({ initialTickets, currentAdminId }: { initialTickets: any[], currentAdminId: string }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTickets[0]?.id || null);
  const [activeMessages, setActiveMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const loadMessages = async (id: string) => {
    const messages = await getTicketMessages(id);
    setActiveMessages(messages);
  };

  useEffect(() => {
    if (selectedTicketId) {
      loadMessages(selectedTicketId);
    }
  }, [selectedTicketId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicketId) return;
    
    const msg = {
      ticketId: selectedTicketId,
      senderId: currentAdminId,
      message: newMessage,
      createdAt: new Date().toISOString()
    };
    
    setActiveMessages(prev => [...prev, msg]);
    setNewMessage("");

    await sendTicketMessage(selectedTicketId, currentAdminId, newMessage);
    loadMessages(selectedTicketId);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicketId) return;
    startTransition(async () => {
       await updateTicketStatus(selectedTicketId, newStatus);
       setTickets(prev => prev.map(t => t.id === selectedTicketId ? {...t, status: newStatus} : t));
    });
  };

  const handleRefund = async () => {
    if (!selectedTicket?.orderId) return;
    if (!confirm("Authorizing dynamic Stripe refund. Confirm adjustment?")) return;
    
    startTransition(async () => {
       const res = await processRefund(selectedTicket.orderId, 19.99); // Placeholder amount
       if (res.success) {
         alert("Refund processed successfully.");
         await sendTicketMessage(selectedTicketId!, currentAdminId, `System: Admin authorized a refund of $19.99 for Order ${selectedTicket.orderId}.`);
         loadMessages(selectedTicketId!);
       }
    });
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl h-[80vh] animate-in fade-in zoom-in-95 duration-700">
      
      {/*  SIDEBAR: Ticket List */}
      <div className="w-[380px] border-r border-white/5 flex flex-col">
        <div className="p-8 border-b border-white/5">
          <h3 className="text-xl font-black tracking-tighter mb-4 text-white">Support <span className="text-primary text-xs uppercase tracking-[0.2em] ml-2">Pilot Desk</span></h3>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"><Icons.Search /></div>
            <input 
              placeholder="Search conversations..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredTickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicketId(ticket.id)}
              className={`w-full p-6 text-left border-b border-white/5 transition-all hover:bg-white/[0.02] ${selectedTicketId === ticket.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded ${
                  ticket.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 
                  ticket.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-slate-500'
                }`}>{ticket.priority}</span>
                <span className="text-[10px] text-slate-500 font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm font-bold text-white mb-1 truncate">{ticket.subject}</p>
              <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{ticket.description}</p>
              <div className="flex gap-2 mt-4">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${ticket.status === 'OPEN' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{ticket.status}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat MAIN CHAT: Interaction */}
      <div className="flex-1 flex flex-col bg-white/[0.01]">
        {selectedTicket ? (
          <>
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div>
                <h4 className="text-lg font-bold text-white mb-1">{selectedTicket.subject}</h4>
                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><Icons.User /> {selectedTicket.User?.name || 'Guest User'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-[9px]"><Icons.Clock /> {selectedTicket.id.split('-')[0]}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedTicket.orderId && (
                  <button onClick={handleRefund} className="btn btn-outline border-primary/20 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 flex items-center gap-2">
                    <Icons.CreditCard /> Auth Refund
                  </button>
                )}
                <select 
                  value={selectedTicket.status} 
                  onChange={e => handleStatusChange(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase px-4 focus:outline-none"
                >
                  <option value="OPEN">Mark Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed-Force</option>
                </select>
              </div>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar">
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl italic text-slate-400 text-xs mb-10">
                <span className="font-black uppercase text-[8px] tracking-widest text-slate-500 block mb-2 underline decoration-primary/30">Original Report</span>
                "{selectedTicket.description}"
              </div>

              {activeMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderId === currentAdminId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-5 rounded-[1.5rem] ${
                    msg.senderId === currentAdminId 
                      ? 'bg-primary text-white rounded-tr-none shadow-xl shadow-primary/20' 
                      : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                  }`}>
                    <p className="text-xs font-bold leading-relaxed">{msg.message}</p>
                    <span className="text-[8px] font-black uppercase opacity-40 mt-3 block">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-8 bg-black/30 border-t border-white/5">
              <form onSubmit={handleSendMessage} className="relative">
                <input 
                  placeholder="Type message to user..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                  <Icons.Send />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none grayscale cursor-pointer hover:grayscale-0 transition-all duration-1000">
             <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center mb-6">
                <Icons.Alert />
             </div>
             <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-500">Awaiting Signal</p>
          </div>
        )}
      </div>

      {/* Search RIGHT PANE: User Intelligence */}
      {selectedTicket && (
        <div className="w-[300px] border-l border-white/5 flex flex-col bg-black/20">
           <div className="p-8">
             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">User Intelligence</h5>
             
             <div className="space-y-10">
               <div>
                 <p className="text-[8px] font-black uppercase text-slate-500 mb-2">Customer Profile</p>
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center font-black">
                     {selectedTicket.User?.name?.[0] || 'U'}
                   </div>
                   <div>
                     <p className="text-xs font-black text-white">{selectedTicket.User?.name || 'Anonymous'}</p>
                     <p className="text-[9px] text-slate-500 truncate w-32">{selectedTicket.User?.email || 'No Email'}</p>
                   </div>
                 </div>
               </div>

               {selectedTicket.orderId && (
                 <div>
                   <p className="text-[8px] font-black uppercase text-slate-500 mb-2">Linked Transaction</p>
                   <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
                      <p className="text-[10px] font-bold text-white group-hover:text-primary transition-colors">Order #{selectedTicket.orderId.split('-')[0]}</p>
                      <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-1">Status: COMPLETED</p>
                   </div>
                 </div>
               )}

               <div className="pt-8 border-t border-white/5">
                 <p className="text-[8px] font-black uppercase text-slate-500 mb-4">Admin Assignment</p>
                 <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <Icons.CheckCircle />
                    <span className="text-[9px] font-black uppercase text-emerald-400">Security Clearance Done</span>
                 </div>
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
