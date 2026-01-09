
import React, { useState, useEffect, useCallback } from 'react';
import { Tab, Category } from './types';
import Navigation from './components/Navigation';
import SellFlow from './components/SellFlow';
import Profile from './components/Profile';
import Marketplace from './components/Marketplace';
import Messages from './components/Messages';
import ItemDetail from './components/ItemDetail';
import Login from './components/Login';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  // If set, Messages will open that conversation directly
  const [openConversationId, setOpenConversationId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationKey, setNotificationKey] = useState(0);
  const [lastNotificationText, setLastNotificationText] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setIsDemoMode(false);
      else setIsDemoMode(!isSupabaseConfigured);
    });

    return () => subscription.unsubscribe();
  }, []);

  const triggerNotification = useCallback((text: string) => {
    setLastNotificationText(text);
    setUnreadCount(prev => prev + 1);
    setNotificationKey(prev => prev + 1);
    setShowNotification(true);
    // Hide notification after 4 seconds
    setTimeout(() => setShowNotification(false), 4000);
  }, []);

  // Global message listener for notifications and unread badge
  useEffect(() => {
    if (!session?.user?.id || isDemoMode) return;

    const channel = supabase
      .channel('global-notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, async (payload) => {
        const newMessage = payload.new;
        
        // Only notify if someone else sent the message
        if (newMessage.sender_id !== session.user.id) {
          // Check if the message belongs to a conversation the current user is part of
          const { data: conv } = await supabase
            .from('conversations')
            .select('id, buyer_id, seller_id')
            .eq('id', newMessage.conversation_id)
            .single();

          if (conv && (conv.buyer_id === session.user.id || conv.seller_id === session.user.id)) {
            // Only trigger visual notification if the user isn't currently looking at the inbox
            if (activeTab !== Tab.MESSAGES) {
              triggerNotification(newMessage.text);
            }
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, activeTab, isDemoMode, triggerNotification]);

  useEffect(() => {
    // Clear unread badge when entering messages tab
    if (activeTab === Tab.MESSAGES) {
      setUnreadCount(0);
      setShowNotification(false);
    }
  }, [activeTab]);

  const handleDemoLogin = () => {
    setIsDemoMode(true);
    setSession({ user: { email: 'demo@utdallas.edu', id: 'demo-user' } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-orange-600 font-bold animate-pulse tracking-tighter text-xl">Hucksta</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-[3rem] overflow-hidden min-h-[852px]">
          <Login onLogin={handleDemoLogin} />
          {!isSupabaseConfigured && (
            <div className="px-8 pb-8 -mt-8 text-center">
              <p className="text-[10px] text-gray-400 mb-2 italic">Backend not connected yet.</p>
              <button 
                onClick={handleDemoLogin}
                className="text-xs font-bold text-orange-600 underline"
              >
                Enter Demo Mode (No Setup Required)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (viewingItem) {
        return (
        <ItemDetail 
          item={viewingItem} 
          session={session}
          isDemoMode={isDemoMode}
          onBack={() => setViewingItem(null)} 
          onMessage={(conversationId?: string | null) => {
            setViewingItem(null);
            setOpenConversationId(conversationId || null);
            setActiveTab(Tab.MESSAGES);
          }}
        />
      );
    }

    switch (activeTab) {
      case Tab.HOME:
        return <Marketplace onSelectItem={setViewingItem} />;
      case Tab.MESSAGES:
        return <Messages session={session} isDemoMode={isDemoMode} initialConversationId={openConversationId} />;
      case Tab.SELL:
        return (
          <SellFlow 
            category={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
            session={session}
            isDemoMode={isDemoMode}
            onCancel={() => {
              setSelectedCategory(null);
              setActiveTab(Tab.HOME);
            }}
            onSuccess={() => {
              setSelectedCategory(null);
              setActiveTab(Tab.HOME);
            }}
          />
        );
      case Tab.PROFILE:
        return (
          <Profile 
            session={session} 
            onSelectItem={setViewingItem} 
          />
        );
      default:
        return <Marketplace onSelectItem={setViewingItem} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto relative h-screen bg-white shadow-xl overflow-hidden flex flex-col">
        
        {/* Animated Visual Notification Toast */}
        {showNotification && (
          <div 
            key={notificationKey}
            onClick={() => setActiveTab(Tab.MESSAGES)}
            className="absolute top-16 left-0 right-0 z-[100] px-4 cursor-pointer animate-envelope-pop"
          >
            <div className="bg-white border-2 border-black p-4 rounded-[2.5rem] shadow-2xl flex items-center space-x-5">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-10 border-[2.5px] border-black rounded-sm relative flex items-center justify-center bg-white">
                  <div className="absolute top-0 w-full h-[60%] border-b-[2.5px] border-black transform origin-top translate-y-[-1px]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
                  <div className="absolute bottom-0 w-full h-[60%] border-t border-gray-100 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 0)' }}></div>
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#E53935] rounded-full border-[3px] border-white flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                  <span className="text-white text-xs font-black">1</span>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-0.5">New Message</p>
                <p className="text-sm font-bold text-gray-900 truncate leading-tight">
                  {lastNotificationText}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="h-full w-full overflow-y-auto no-scrollbar">
            {renderContent()}
          </div>
        </div>
        
        <Navigation 
          activeTab={activeTab} 
          unreadCount={unreadCount}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== Tab.SELL) setSelectedCategory(null);
            setViewingItem(null);
          }} 
        />
      </div>
    </div>
  );
};

export default App;
