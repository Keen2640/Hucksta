
import React, { useState, useEffect } from 'react';
import EditProfile from './EditProfile';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ProfileProps {
  session: any;
  onSelectItem?: (item: any) => void;
}

const Profile: React.FC<ProfileProps> = ({ session, onSelectItem }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'favorites'>('active');
  const [isEditing, setIsEditing] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<'none' | 'table_missing' | 'other'>('none');

  // Extract name from metadata or fallback to email parts
  const fullName = session?.user?.user_metadata?.full_name || 
                   (session?.user?.email?.split('@')[0] || 'Hucksta User');
  
  const [userData] = useState({
    firstName: fullName.split(' ')[0],
    lastName: fullName.split(' ').slice(1).join(' '),
    username: session?.user?.email?.split('@')[0] || 'student',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.id || 'default'}`
  });

  const isDemoUser = session?.user?.id === 'demo-user';

  const setupSQL = `
-- Create the main listings table with all required fields
create table if not exists public.listings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  brand text,
  size text,
  gender text,
  price numeric not null,
  condition text not null,
  category text not null,
  location text not null,
  description text,
  image_url text,
  seller_id uuid not null default auth.uid()
);

-- Enable Security
alter table public.listings enable row level security;

-- Policies
create policy "Anyone can view listings" on public.listings for select using (true);
create policy "Users can add items" on public.listings for insert with check (auth.uid() = seller_id);
create policy "Users can delete their items" on public.listings for delete using (auth.uid() = seller_id);
  `.trim();

  useEffect(() => {
    fetchMyListings();

    if (isSupabaseConfigured && !isDemoUser) {
      const channel = supabase
        .channel('user-listing-updates')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'listings',
          filter: `seller_id=eq.${session?.user?.id}`
        }, () => {
          fetchMyListings();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session?.user?.id]);

  const fetchMyListings = async () => {
    // Prevent querying Supabase with the 'demo-user' string as it causes a UUID cast error
    if (!isSupabaseConfigured || !session?.user?.id || isDemoUser) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') setErrorType('table_missing');
        else setErrorType('other');
        throw error;
      }
      
      if (data) {
        setMyListings(data);
        setErrorType('none');
      }
    } catch (err: any) {
      console.error('Error fetching my listings:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      window.location.reload(); 
    }
  };

  const getThumbnail = (imageUrl: string) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400';
    try {
      if (imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
        return JSON.parse(imageUrl)[0];
      }
      return imageUrl;
    } catch (e) {
      return imageUrl;
    }
  };

  if (isEditing) {
    return (
      <EditProfile 
        user={userData} 
        onBack={() => setIsEditing(false)} 
      />
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Profile Header */}
      <div className="relative h-64 bg-gradient-to-br from-orange-500 via-orange-600 to-emerald-600 p-6 flex flex-col justify-end">
        <button 
          onClick={handleLogout}
          className="absolute top-12 right-6 bg-white/20 p-2 rounded-xl text-white backdrop-blur-md hover:bg-white/30 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src={userData.avatar} 
              alt={userData.firstName} 
              className="w-24 h-24 rounded-3xl border-4 border-white object-cover shadow-lg bg-orange-100"
            />
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold truncate max-w-[200px]">{fullName}</h2>
            <p className="text-white/80 font-medium">@{userData.username}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-b border-gray-100 space-y-3">
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isSupabaseConfigured && !isDemoUser ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`}></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Connection</p>
              <p className={`text-xs font-bold ${isSupabaseConfigured && !isDemoUser ? 'text-emerald-600' : 'text-orange-600'}`}>
                {isDemoUser ? 'Guest Mode (Offline)' : isSupabaseConfigured ? 'Supabase Connected' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Listings</p>
            <p className="text-xs font-bold text-gray-800">{myListings.length}</p>
          </div>
        </div>
      </div>

      {errorType === 'table_missing' ? (
        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="bg-gray-50 rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-800">Database Setup Needed</h2>
            <p className="text-xs text-gray-500 font-medium">To see your personal listings, run this script in Supabase:</p>
            <div className="w-full">
              <pre className="bg-gray-900 text-emerald-400 p-4 rounded-2xl text-[8px] overflow-x-auto whitespace-pre font-mono h-32 no-scrollbar border border-white/10 shadow-inner select-all">
                {setupSQL}
              </pre>
            </div>
            <button 
              onClick={() => { setLoading(true); fetchMyListings(); }}
              className="w-full bg-orange-600 text-white font-bold py-3 rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              Verify Connection
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex border-b border-gray-100 px-2">
            <button onClick={() => setActiveTab('active')} className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'active' ? 'text-orange-600' : 'text-gray-400'}`}>
              Active
              {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full"></div>}
            </button>
            <button onClick={() => setActiveTab('sold')} className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'sold' ? 'text-orange-600' : 'text-gray-400'}`}>
              Sold
              {activeTab === 'sold' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full"></div>}
            </button>
            <button onClick={() => setActiveTab('favorites')} className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'favorites' ? 'text-orange-600' : 'text-gray-400'}`}>
              Favorites
              {activeTab === 'favorites' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full"></div>}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Loading Items...</p>
              </div>
            ) : activeTab === 'active' && myListings.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {myListings.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => onSelectItem?.(item)}
                    className="bg-white rounded-[2rem] p-1.5 border border-gray-100 shadow-sm flex flex-col h-full transform active:scale-95 transition-transform cursor-pointer"
                  >
                    <div className="relative aspect-[4/5] rounded-[1.75rem] overflow-hidden mb-2">
                      <img src={getThumbnail(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                        <span className="text-[10px] font-black text-orange-600">${Number(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="px-2 pb-2">
                      <h3 className="font-bold text-gray-800 text-[10px] leading-tight line-clamp-2 h-6 mb-1">{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="bg-gray-50 p-6 rounded-[2.5rem] mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="font-bold text-sm text-gray-500">No {activeTab} items found</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                  {isDemoUser ? 'Sign in to start listing items!' : 'Start by listing something for sale!'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 flex space-x-3">
        <button 
          onClick={() => setIsEditing(true)}
          className="flex-1 bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-orange-100 active:scale-[0.98] transition-all"
        >
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
