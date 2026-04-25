import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { FaPaperPlane, FaSearch, FaEllipsisV, FaSpinner } from "react-icons/fa";
import socket, { connectSocket } from "../../services/socket";
import API from "../../api/index";
import toast from "react-hot-toast";

export default function Messaging() {
  const [activeChat, setActiveChat] = useState(null); // active chat ID (contact ID)
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Authenticated Context
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = currentUser._id || currentUser.id;

  // 1. Fetching Global Contacts List 
  useEffect(() => {
     const fetchContacts = async () => {
         try {
            // Ideally this fetches /connection/my , but /user/all acts as a universal network fallback
            const res = await API.get("/user/all");
            // Filter out ourselves
            const otherUsers = (res.data.users || []).filter(u => (u._id || u.id) !== currentUserId);
            setContacts(otherUsers);
            if (otherUsers.length > 0) setActiveChat(otherUsers[0]._id || otherUsers[0].id);
         } catch(e) {
            console.error("Failed to load contacts network", e);
         }
     };
     fetchContacts();
  }, [currentUserId]);

  // 2. Fetch Chat History when Contact changes
  useEffect(() => {
     if (!activeChat) return;

     const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
           const res = await API.get(`/message/${activeChat}`);
           // Ensure normalization mapping if API payloads differ slightly
           setMessages(res.data || []);
        } catch(e) {
           console.error("Historical chat fail", e);
           // Fallback to empty if endpoint hasn't synced properly
           setMessages([]);
        } finally {
           setLoadingHistory(false);
        }
     };
     fetchHistory();
  }, [activeChat]);

  // 3. Registering the Active Live Socket Receptors
  useEffect(() => {
     // Ensure socket is connected and user is registered with backend
     connectSocket();

     const handleMessageReceive = (data) => {
        // Only append if the message matches the current active chat window, or push a notification if not
        if (data.sender?._id === activeChat || data.sender === activeChat || data.receiver === currentUserId) {
             setMessages(prev => [...prev, data]);
        }
     };

     socket.on("newMessage", handleMessageReceive);
     return () => socket.off("newMessage", handleMessageReceive);
  }, [activeChat, currentUserId]);


  // 4. Emitting Payload & Handling Submit
  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;
    
    const payload = {
       sender: currentUserId,
       receiver: activeChat,
       text: message
    };

    // 1. Instantly drop visual representation onto current console
    const optimisticMapping = {
        _id: Date.now().toString(),
        sender: currentUserId,
        receiver: activeChat,
        text: message,
        createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMapping]);
    setMessage("");

    // 2. Transmit actively to node.js proxy
    socket.emit("sendMessage", payload);

    // *Optional backup: If your logic also relies on API.post explicitly along with socket
    try {
        await API.post(`/message/send/${activeChat}`, { text: message });
    } catch(err) {
        console.error("Backup Rest Fail", err); 
    }
  };


  // Helpers
  const activeUser = contacts.find(c => (c._id || c.id) === activeChat);
  const filteredContacts = contacts.filter(c => c.name?.toLowerCase().includes(query.toLowerCase()));

  return (
    <Layout>
      <div className="card h-[75vh] flex overflow-hidden">
        
        {/* Left Pane - Contacts */}
        <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/10">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white mb-3">Messages</h2>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text" 
                placeholder="Search..." 
                className="bg-white/5 border border-white/10 text-xs rounded-full pl-8 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-full"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredContacts.map(chat => (
              <div 
                key={chat._id || chat.id}
                onClick={() => setActiveChat(chat._id || chat.id)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-colors flex items-center gap-3 relative ${activeChat === (chat._id || chat.id) ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}
              >
                {activeChat === (chat._id || chat.id) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>}
                
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center font-bold text-white shadow-md overflow-hidden flex-shrink-0">
                    {chat.profilePhoto ? <img src={chat.profilePhoto} className="w-full h-full object-cover" /> : chat.name?.[0]?.toUpperCase()}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-sm font-semibold text-white truncate">{chat.name}</h4>
                  </div>
                  <p className="text-xs text-blue-500/80 truncate capitalize">{chat.role || "Member"}</p>
                </div>
              </div>
            ))}
            {filteredContacts.length === 0 && <div className="p-5 text-center text-xs text-slate-500">No network found.</div>}
          </div>
        </div>

        {/* Right Pane - Chat */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-transparent to-black/20 relative">
          
          {/* Chat Header */}
          {activeUser && (
             <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/10 backdrop-blur-md">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center font-bold text-white shadow-md overflow-hidden flex-shrink-0">
                     {activeUser.profilePhoto ? <img src={activeUser.profilePhoto} className="w-full h-full object-cover" /> : activeUser.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{activeUser.name}</h3>
                    <p className="text-xs text-blue-500 capitalize">{activeUser.role || "Member"}</p>
                  </div>
               </div>
               <button className="p-2 text-slate-400 hover:text-white transition-colors">
                 <FaEllipsisV />
               </button>
             </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col">
            {loadingHistory ? (
                <div className="flex-1 flex justify-center items-center text-blue-500 flex-col gap-2">
                   <FaSpinner className="animate-spin text-2xl" />
                   <span className="text-xs font-bold tracking-widest uppercase">Connecting Tunnel...</span>
                </div>
            ) : messages.length === 0 ? (
                <div className="flex-1 flex justify-center items-center text-slate-500 text-sm font-medium">
                   It's quiet in here. Send a message to start conversing!
                </div>
            ) : (
                messages.map(msg => {
                   const isMe = msg.sender === currentUserId || msg.sender?._id === currentUserId;
                   return (
                      <div key={msg._id || msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[75%] p-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-[#1e2a30] text-slate-200 border border-white/5 rounded-bl-sm'}`}>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      </div>
                   )
                })
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/20 border-t border-white/10">
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type a secure message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                disabled={!activeChat}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={!message.trim() || !activeChat}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
              >
                <FaPaperPlane className="ml-[-2px]" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </Layout>
  );
}
