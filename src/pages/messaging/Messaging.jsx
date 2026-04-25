import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import { FaPaperPlane, FaSearch, FaEllipsisV, FaSpinner, FaInbox } from "react-icons/fa";
import socket, { connectSocket } from "../../services/socket";
import { getConnections } from "../../api/connection";
import { sendMessage as apiSendMessage, getMessages as apiGetMessages } from "../../api/message";
import toast from "react-hot-toast";

export default function Messaging() {
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [unreadMap, setUnreadMap] = useState({}); // userId → unread count
  const bottomRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = currentUser._id || currentUser.id;

  // ─── 0. Handle Redirection from Networking ────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get("chat");
    if (chatId) {
      setActiveChat(chatId);
    }
  }, []);

  // ─── 1. Load contacts from real connections ──────────────────────────────
  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true);
      try {
        const res = await getConnections();
        const conns = Array.isArray(res.data) ? res.data : (res.data?.connections || []);

        // Extract the "other" person from each connection pair
        const people = conns
          .filter(c => c.status === "accepted")
          .map(c => {
            const isSender = (c.sender?._id || c.sender) === currentUserId;
            return isSender ? c.receiver : c.sender;
          })
          .filter(Boolean);

        // Deduplicate by _id
        const unique = [...new Map(people.map(p => [p._id || p.id, p])).values()];
        setContacts(unique);
        
        // Only set default if no chat is pre-selected via query param
        const params = new URLSearchParams(window.location.search);
        if (unique.length > 0 && !params.get("chat") && !activeChat) {
          setActiveChat(unique[0]._id || unique[0].id);
        }
      } catch (e) {
        console.error("Failed to load contacts:", e);
        toast.error("Could not load your connections.");
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, [currentUserId]);

  // ─── 2. Load chat history when active chat changes ────────────────────────
  useEffect(() => {
    if (!activeChat) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await apiGetMessages(activeChat);
        setMessages(Array.isArray(res.data) ? res.data : []);
        // Clear unread for this contact
        setUnreadMap(prev => ({ ...prev, [activeChat]: 0 }));
      } catch (e) {
        console.error("Chat history fetch failed:", e);
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [activeChat]);

  // ─── 3. Auto-scroll to bottom when messages update ───────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── 4. Socket — connect and listen for incoming messages ────────────────
  useEffect(() => {
    connectSocket();

    const handleNewMessage = (data) => {
      const senderId = data.sender?._id || data.sender;
      if (senderId === activeChat) {
        // Currently viewing this conversation — append
        setMessages(prev => [...prev, data]);
      } else {
        // Different chat — increment unread badge
        setUnreadMap(prev => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
        toast(`💬 New message from ${contacts.find(c => (c._id || c.id) === senderId)?.name || "someone"}`, {
          duration: 3000,
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [activeChat, contacts]);

  // ─── 5. Send message ─────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !activeChat) return;

    // Optimistic UI — show immediately
    const optimistic = {
      _id: `optimistic-${Date.now()}`,
      sender: currentUserId,
      receiver: activeChat,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setMessage("");

    try {
      // Persist to DB via REST (Backend REST API now handles socket emission as well)
      const res = await apiSendMessage(activeChat, trimmed);
      // Replace optimistic with real message from server
      setMessages(prev =>
        prev.map(m => m._id === optimistic._id ? (res.data?.message || res.data || m) : m)
      );
    } catch (err) {
      console.error("Send message failed:", err);
      toast.error("Message failed to send. Please try again.");
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setMessage(trimmed); // restore input
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const activeUser = contacts.find(c => (c._id || c.id) === activeChat);
  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Layout>
      <div className="card h-[78vh] flex overflow-hidden shadow-xl">

        {/* ── LEFT PANE: Contacts ── */}
        <div className="w-[280px] shrink-0 border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-extrabold text-slate-800 mb-3 flex items-center gap-2">
              <FaInbox className="text-blue-600" /> Messages
            </h2>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                type="text"
                placeholder="Search connections..."
                className="bg-white border border-slate-200 text-xs rounded-full pl-8 pr-4 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 w-full transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingContacts ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-blue-500">
                <FaSpinner className="animate-spin text-xl" />
                <span className="text-xs font-semibold">Loading connections...</span>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-medium">
                {contacts.length === 0
                  ? "Connect with people first to start messaging."
                  : "No results found."}
              </div>
            ) : (
              filteredContacts.map(chat => {
                const chatId = chat._id || chat.id;
                const isActive = activeChat === chatId;
                const unread = unreadMap[chatId] || 0;
                return (
                  <div
                    key={chatId}
                    onClick={() => setActiveChat(chatId)}
                    className={`p-3.5 border-b border-slate-100 cursor-pointer transition-all flex items-center gap-3 relative ${
                      isActive ? "bg-blue-50 border-l-2 border-l-blue-600" : "hover:bg-white"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm overflow-hidden">
                        {chat.profilePhoto
                          ? <img src={chat.profilePhoto} className="w-full h-full object-cover" alt={chat.name} />
                          : (chat.name?.[0] || "?").toUpperCase()
                        }
                      </div>
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${isActive ? "text-blue-700" : "text-slate-800"}`}>
                        {chat.name}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize truncate mt-0.5">
                        {chat.role || "Member"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANE: Chat ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Chat Header */}
          {activeUser ? (
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm overflow-hidden flex-shrink-0">
                  {activeUser.profilePhoto
                    ? <img src={activeUser.profilePhoto} className="w-full h-full object-cover" alt={activeUser.name} />
                    : (activeUser.name?.[0] || "?").toUpperCase()
                  }
                </div>
                <div>
                  <h3 className="text-slate-800 font-bold text-sm">{activeUser.name}</h3>
                  <p className="text-[10px] text-blue-600 capitalize font-medium">{activeUser.role || "Member"}</p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors">
                <FaEllipsisV />
              </button>
            </div>
          ) : (
            !loadingContacts && (
              <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex-shrink-0">
                <p className="text-slate-400 text-sm font-medium">Select a conversation</p>
              </div>
            )
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50/50">
            {loadingHistory ? (
              <div className="flex-1 flex flex-col justify-center items-center h-full gap-2 text-blue-500">
                <FaSpinner className="animate-spin text-2xl" />
                <span className="text-xs font-bold tracking-wide uppercase">Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-slate-400 text-sm font-medium gap-2">
                <FaInbox className="text-3xl text-slate-300" />
                Say hello! This is the start of your conversation.
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender === currentUserId || msg.sender?._id === currentUserId;
                return (
                  <div key={msg._id || msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm"
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                    {msg.createdAt && (
                      <span className="text-[10px] text-slate-400 mt-1 mx-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 bg-white border-t border-slate-200 flex-shrink-0">
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder={activeChat ? "Type a message..." : "Select a conversation first"}
                value={message}
                onChange={e => setMessage(e.target.value)}
                disabled={!activeChat || loadingHistory}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!message.trim() || !activeChat}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-95 transition-all"
              >
                <FaPaperPlane className="ml-[-1px] text-sm" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </Layout>
  );
}
