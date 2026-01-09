
import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Message {
  id: string;
  text: string;
  sender_id: string;
  created_at: string;
}

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listings?: { title: string; image_url: string };
  other_user_id: string;
}

interface MessagesProps {
  session: any;
  isDemoMode: boolean;
  initialConversationId?: string | null;
}

const Messages: React.FC<MessagesProps> = ({ session, isDemoMode, initialConversationId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<'none' | 'table_missing'>('none');
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUserId = session?.user?.id;
  const isDemoUser = currentUserId === 'demo-user';

  const chatSetupSQL = `
-- Create Conversations Table
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  listing_id uuid references public.listings(id) on delete cascade,
  buyer_id uuid not null,
  seller_id uuid not null
);

-- Create Messages Table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  text text not null
);

-- Enable RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Policies for Conversations
create policy "Users can see their conversations" on public.conversations
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Users can start conversations" on public.conversations
  for insert with check (auth.uid() = buyer_id);

-- Policies for Messages
create policy "Users can see messages in their conversations" on public.messages
  for select using (
    exists (
      select 1 from public.conversations 
      where id = conversation_id and (buyer_id = auth.uid() or seller_id = auth.uid())
    )
  );
create policy "Users can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);
  `.trim();

  useEffect(() => {
    // Prevent querying Supabase with the 'demo-user' string as it causes a UUID cast error
    if (currentUserId && !isDemoMode && !isDemoUser) {
      fetchConversations(currentUserId);
    } else {
      setLoading(false);
    }
  }, [currentUserId, isDemoMode]);

        // If an initial convo id is provided, select it after conversations load
        useEffect(() => {
          if (!initialConversationId) return;
          if (conversations.length === 0) return;

          const match = conversations.find((c) => c.id === initialConversationId);
          if (match) setSelectedConversation(match);
        }, [initialConversationId, conversations]);

        const fetchConversations = async (userId: string) => {
          try {
            const { data, error } = await supabase
              .from('conversations')
              .select(`
                id, listing_id, buyer_id, seller_id,
                listings ( title, image_url )
              `)
              .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

            if (error) {
              if ((error as any).code === '42P01') setErrorType('table_missing');
              throw error;
            }

            if (data) {
              const formatted = data.map((conv: any) => ({
                ...conv,
                other_user_id: conv.buyer_id === userId ? conv.seller_id : conv.buyer_id
              }));
              setConversations(formatted);
              // attempt to fetch display names for each other_user_id
              formatted.forEach((conv: any) => {
                const otherId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
                if (otherId) fetchAndCacheUserName(otherId);
              });
            }
          } catch (err: any) {
            console.error('Error fetching conversations:', err.message || err);
          } finally {
            setLoading(false);
          }
        };

        const fetchAndCacheUserName = async (userId: string) => {
          if (!userId) return;
          if (userNames[userId]) return; // cached

          try {
            // Try a public 'profiles' table first (common pattern)
            const { data: profile, error: profileErr } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', userId)
              .single();

            if (!profileErr && profile?.full_name) {
              setUserNames((s) => ({ ...s, [userId]: profile.full_name }));
              return;
            }

            // Fallback: try to read from 'users' table (may be restricted)
            const { data: userRow, error: userErr } = await supabase
              .from('users')
              .select('email, user_metadata')
              .eq('id', userId)
              .single();

            if (!userErr && userRow) {
              const full = (userRow.user_metadata && userRow.user_metadata.full_name) || (userRow.email && userRow.email.split('@')[0]);
              if (full) {
                setUserNames((s) => ({ ...s, [userId]: full }));
                return;
              }
            }

            // If nothing found, store a default placeholder (will fall back to handle)
            setUserNames((s) => ({ ...s, [userId]: '' }));
          } catch (err) {
            console.error('Error fetching user name for', userId, err);
            setUserNames((s) => ({ ...s, [userId]: '' }));
          }
        };

        const fetchMessages = async (convId: string) => {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });

          if (error) console.error('Error fetching messages:', error.message || error);
          else setMessages(data || []);
        };

        useEffect(() => {
          if (!selectedConversation || isDemoMode || isDemoUser) return;

          fetchMessages(selectedConversation.id);

          const channel = supabase
            .channel(`chat-${selectedConversation.id}`)
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${selectedConversation.id}`
            }, (payload) => {
              setMessages((prev) => {
                // Prevent duplicates from local vs remote insert
                if (prev.some(m => m.id === payload.new.id)) return prev;
                return [...prev, payload.new as Message];
              });
            })
            .subscribe();

          return () => {
            supabase.removeChannel(channel);
          };
        }, [selectedConversation]);

        useEffect(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, [messages]);

        const handleSendMessage = async () => {
          if (!inputValue.trim() || !selectedConversation || !currentUserId || isDemoUser) return;

          const text = inputValue.trim();
          setInputValue('');

          const { error } = await supabase.from('messages').insert({
            conversation_id: selectedConversation.id,
            sender_id: currentUserId,
            text: text
          });

          if (error) {
            alert('Failed to send message: ' + error.message);
          }
        };

        const getUserHandle = (userId: string) => {
          const name = userNames[userId];
          if (name && name.trim().length > 0) return name;
          return `@comet_${userId.slice(0, 5)}`;
        };

        if (errorType === 'table_missing') {
          return (
            <div className="flex flex-col h-full bg-white p-8 justify-center items-center text-center space-y-4">
              <div className="bg-orange-50 p-6 rounded-[2rem] text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-gray-900">Setup Messaging</h2>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">Run this SQL in Supabase to enable real-time campus chat:</p>
              <div className="w-full">
                 <pre className="bg-gray-900 text-emerald-400 p-4 rounded-2xl text-[8px] overflow-x-auto whitespace-pre font-mono h-48 no-scrollbar border border-white/10 shadow-inner select-all">
                  {chatSetupSQL}
                </pre>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-orange-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-orange-100 uppercase tracking-widest text-xs"
              >
                Check Again
              </button>
            </div>
          );
        }

        if (selectedConversation) {
          return (
            <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
              <div className="pt-12 pb-4 px-6 flex items-center border-b border-gray-50 space-x-4">
                <button onClick={() => setSelectedConversation(null)} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center space-x-3">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.other_user_id}`} 
                    className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100" 
                    alt="Avatar" 
                  />
                  <h3 className="text-base font-bold text-gray-400 tracking-tight">
                    {getUserHandle(selectedConversation.other_user_id)}
                  </h3>
                </div>
              </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4" style={{ paddingBottom: 160 }}>
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in zoom-in duration-200`}>
                    <div className={`max-w-[80%] px-5 py-3 rounded-[1.5rem] text-sm shadow-sm ${
                      isMe ? 'bg-orange-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

              <div className="p-4 pb-28 bg-white border-t border-gray-100" style={{ position: 'relative', zIndex: 40 }}>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..." 
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                  <button 
                    onClick={handleSendMessage} 
                    className="bg-orange-500 text-white p-3.5 rounded-2xl shadow-lg shadow-orange-100 active:scale-90 transition-transform"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col h-full bg-white overflow-hidden">
            <div className="pt-16 pb-6 px-8 border-b border-gray-50">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Inbox</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Campus Live</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 p-4 space-y-3 bg-gray-50/30">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-gray-300 text-center px-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-6 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-gray-900 font-bold mb-1 uppercase tracking-tighter text-lg">No Messages Yet</h3>
                  <p className="text-xs font-medium text-gray-400">Items you message sellers about will appear here.</p>
                </div>
              ) : (
                conversations.map((chat) => (
                  <div 
                    key={chat.id} 
                    onClick={() => setSelectedConversation(chat)}
                    className="p-5 flex items-center space-x-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:border-orange-100"
                  >
                    <div className="relative">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.other_user_id}`} 
                        className="w-16 h-16 rounded-[1.5rem] bg-orange-50 border border-orange-100" 
                        alt="Avatar" 
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 text-lg tracking-tight mb-0.5">
                        {getUserHandle(chat.other_user_id)}
                      </h3>
                    </div>
                    <div className="text-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      };

      export default Messages;
