import React, { useEffect, useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { MessageSquare, Loader2, ArrowLeft, Smile } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { io, Socket } from "socket.io-client";

interface UserProfile {
    _id: string;
    username: string;
    fullName: string;
    profilePicture: string;
}

interface MessageData {
    _id: string;
    sender: string; // User ID
    recipient: string; // User ID
    text: string;
    createdAt: string;
}

const MessagePage: React.FC = () => {
    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();
    const [currentUserDbId, setCurrentUserDbId] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const queryUserId = searchParams.get("userId");

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [messages, setMessages] = useState<MessageData[]>([]);

    const [inputText, setInputText] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Sync / fetch logged-in user profile & users list
    useEffect(() => {
        const initializeChat = async () => {
            if (!clerkUser) return;
            try {
                setLoadingUsers(true);
                const token = await getToken();

                // Sync user to get database _id
                const syncRes = await fetch("/api/user/sync", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const syncData = await syncRes.json();
                if (syncData.success && syncData.user) {
                    setCurrentUserDbId(syncData.user._id);
                }

                // Fetch user list
                const usersRes = await fetch("/api/messages/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const usersData = await usersRes.json();
                if (usersData.success) {
                    setUsers(usersData.users);
                }
            } catch (err) {
                console.error("Failed to initialize chat:", err);
            } finally {
                setLoadingUsers(false);
            }
        };

        initializeChat();
    }, [clerkUser]);

    // 1.5 Auto-select user from query parameter (e.g. redirected from Search page)
    useEffect(() => {
        if (queryUserId && users.length > 0) {
            const targetUser = users.find((u) => u._id === queryUserId);
            if (targetUser) {
                setSelectedUser(targetUser);
            }
        }
    }, [queryUserId, users]);

    // 2. Set up Socket.io connection when database user ID is available
    useEffect(() => {
        if (!currentUserDbId) return;

        // Connect to Socket.io backend
        const socketUrl = import.meta.env.MODE === "development" ? "http://localhost:8080" : window.location.origin;
        const socket = io(socketUrl, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("[Socket] Connected to backend socket:", socket.id);
            // Join private room named after current MongoDB user ID
            socket.emit("join", currentUserDbId);
        });

        // Listen for new messages
        socket.on("new_message", (message: MessageData) => {
            console.log("[Socket] Received message:", message);
            // If the message belongs to the current open chat, append it
            setMessages((prev) => {
                // Prevent duplicate appends if client already processed it
                if (prev.some((m) => m._id === message._id)) return prev;

                const isFromSelected = selectedUser && (message.sender === selectedUser._id || message.recipient === selectedUser._id);
                const isFromSelf = message.sender === currentUserDbId;

                if (isFromSelected || isFromSelf) {
                    return [...prev, message];
                }
                return prev;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [currentUserDbId, selectedUser]);

    // 3. Load message history when selecting a user
    useEffect(() => {
        if (!selectedUser) return;

        const loadMessages = async () => {
            try {
                setLoadingMessages(true);
                const token = await getToken();
                const response = await fetch(`/api/messages/${selectedUser._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (data.success) {
                    setMessages(data.messages);
                }
            } catch (err) {
                console.error("Failed to load messages:", err);
            } finally {
                setLoadingMessages(false);
            }
        };

        loadMessages();
    }, [selectedUser]);

    // 4. Send Message Handler
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !inputText.trim() || sending) return;

        try {
            setSending(true);
            const token = await getToken();
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    recipientId: selectedUser._id,
                    text: inputText.trim(),
                }),
            });

            const data = await response.json();
            if (data.success) {
                setInputText("");
            } else {
                alert(data.message || "Failed to send message.");
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Error sending message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col pb-16">

            {/* Messages Header */}
            <header className="sticky top-0 z-40 bg-black border-b border-zinc-900 px-4 py-3 flex items-center justify-between max-w-6xl mx-auto w-full">
                <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Feed
                </Link>
                <span className="font-semibold text-base">Direct Messages</span>
                <div className="w-5"></div> {/* Spacer for symmetry */}
            </header>

            {/* Main chat window container */}
            <div className="flex-1 max-w-6xl mx-auto w-full flex bg-zinc-950/20 border border-zinc-900 rounded-lg overflow-hidden my-4 min-h-[calc(100vh-140px)]">

                {/* Left Side: Users list */}
                <div className="w-full sm:w-[320px] border-r border-zinc-900 flex flex-col bg-zinc-950/30">
                    <div className="p-4 border-b border-zinc-900">
                        <h3 className="font-semibold text-lg text-left">Chats</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-zinc-950">
                        {loadingUsers ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                            </div>
                        ) : users.length === 0 ? (
                            <p className="text-zinc-500 text-sm text-center py-10">No other users found.</p>
                        ) : (
                            users.map((user) => {
                                const isSelected = selectedUser?._id === user._id;
                                return (
                                    <button
                                        key={user._id}
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setMessages([]); // Clear messages state while loading
                                        }}
                                        className={`w-full flex items-center gap-3 p-4 text-left transition-colors cursor-pointer ${isSelected ? "bg-zinc-900/60" : "hover:bg-zinc-900/20"
                                            }`}
                                    >
                                        <img
                                            src={user.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                                            alt={user.username}
                                            className="w-12 h-12 rounded-full object-cover border border-zinc-800 shrink-0"
                                        />
                                        <div className="overflow-hidden">
                                            <p className="font-semibold text-sm truncate text-white">{user.username}</p>
                                            <p className="text-zinc-500 text-xs truncate mt-0.5">{user.fullName}</p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Side: Message stream */}
                <div className="flex-1 flex flex-col bg-zinc-950/10">
                    {selectedUser ? (
                        <>
                            {/* Chat pane header */}
                            <div className="flex items-center gap-3 p-4 border-b border-zinc-900 bg-zinc-950/40">
                                <img
                                    src={selectedUser.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                                    alt={selectedUser.username}
                                    className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                                />
                                <div className="text-left">
                                    <p className="font-bold text-sm text-white">{selectedUser.username}</p>
                                    <p className="text-zinc-400 text-xs">{selectedUser.fullName}</p>
                                </div>
                            </div>

                            {/* Message bubbles stream */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col justify-end">
                                {loadingMessages ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                                    </div>
                                ) : (
                                    <div className="space-y-3 overflow-y-auto pr-1">
                                        {messages.length === 0 ? (
                                            <div className="text-center py-20">
                                                <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                                                <p className="text-zinc-500 text-sm">Say hello to {selectedUser.username}!</p>
                                            </div>
                                        ) : (
                                            messages.map((message) => {
                                                const isSelf = message.sender === currentUserDbId;
                                                return (
                                                    <div
                                                        key={message._id}
                                                        className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${isSelf
                                                                    ? "bg-sky-500 text-white rounded-br-none"
                                                                    : "bg-zinc-800 text-zinc-100 rounded-bl-none"
                                                                }`}
                                                        >
                                                            <p className="text-left break-words">{message.text}</p>
                                                            <span className="block text-[9px] text-zinc-400/80 text-right mt-1 font-sans">
                                                                {new Date(message.createdAt).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Chat Input box */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-900 bg-black">
                                <div className="flex items-center gap-3 border border-zinc-800 rounded-full px-4 py-2.5 bg-zinc-950">
                                    <Smile className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-zinc-200" />
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Message..."
                                        className="flex-1 bg-transparent text-sm placeholder-zinc-500 text-white focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim() || sending}
                                        className="text-sky-500 hover:text-white font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:hover:text-sky-500 transition-colors"
                                    >
                                        {sending ? "..." : "Send"}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        /* Empty state when no chat selected */
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
                            <div className="w-24 h-24 rounded-full border-2 border-zinc-700 flex items-center justify-center mb-4 text-zinc-400">
                                <MessageSquare className="w-12 h-12 stroke-[1.2]" />
                            </div>
                            <h3 className="text-xl font-medium mb-1">Your messages</h3>
                            <p className="text-sm text-zinc-500 max-w-sm">
                                Send private photos and messages to a friend or group.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MessagePage;