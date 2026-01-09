
import React, { useState, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ItemDetailProps {
  item: any;
  session: any;
  isDemoMode: boolean;
  onBack: () => void;
  // Pass back an optional conversation id so the parent can open it directly
  onMessage: (conversationId?: string | null) => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ item, session, isDemoMode, onBack, onMessage }) => {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);

  const isOwner = session?.user?.id === item.seller_id;
  const isDemoUser = session?.user?.id === 'demo-user';

  const photos = useMemo(() => {
    if (!item.image_url) return [];
    try {
      if (item.image_url.startsWith('[') && item.image_url.endsWith(']')) {
        return JSON.parse(item.image_url) as string[];
      }
      return [item.image_url];
    } catch (e) {
      return [item.image_url];
    }
  }, [item.image_url]);

  const handleNext = () => setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
  const handlePrev = () => setCurrentPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);

  const handleMessageSeller = async () => {
    if (isDemoMode || isDemoUser) {
      alert("Direct Messaging requires a real account. Please sign up!");
      return;
    }

    setIsMessaging(true);
    try {
      // 1. Try to find any existing conversation for this listing where the
      // current user is a participant (either buyer or seller).
      const { data: found, error: findError } = await supabase
        .from('conversations')
        .select('id, buyer_id, seller_id')
        .eq('listing_id', item.id)
        .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
        .limit(1);

      if (findError) {
        if (findError.code === '42P01') {
          alert('DM feature is not set up in the database. Run the SQL script from the Inbox tab.');
          return;
        }
        throw findError;
      }

      if (found && found.length > 0) {
        const convId = found[0].id;
        onMessage(convId);
        return;
      }

      // 2. Create new conversation. If another client creates it concurrently,
      // the insert may fail with a constraint; so after insert error we'll re-check.
      const { data: created, error: createError } = await supabase
        .from('conversations')
        .insert({
          listing_id: item.id,
          buyer_id: session.user.id,
          seller_id: item.seller_id
        })
        .select()
        .limit(1);

      if (createError) {
        // If insert failed due to duplicate (race), try to find the conversation again
        console.warn('Create conversation error, re-checking existing:', createError.message || createError);
        const { data: retryFound } = await supabase
          .from('conversations')
          .select('id, buyer_id, seller_id')
          .eq('listing_id', item.id)
          .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
          .limit(1);

        if (retryFound && retryFound.length > 0) {
          const convId = retryFound[0].id;
          onMessage(convId);
          return;
        }

        throw createError;
      }

      // Successfully created
      if (created && created.length > 0) {
        const convId = created[0].id;
        onMessage(convId);
        return;
      }
    } catch (err: any) {
      console.error('Error starting chat:', err.message || err);
      alert('Could not start chat: ' + (err.message || 'Unknown error'));
    } finally {
      setIsMessaging(false);
    }
  };

  const handleDelete = async () => {
    if (isDemoMode || isDemoUser) {
      alert("Guest accounts can't delete items.");
      return;
    }
    if (!window.confirm('Are you sure you want to remove this listing?')) return;

    setIsDeleting(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .delete()
        .eq('id', item.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        alert('Permission denied or item already removed.');
        onBack();
        return;
      }
      alert('Listing successfully removed.');
      onBack();
    } catch (err: any) {
      console.error('Error deleting item:', err.message || err);
      alert('Error deleting item: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full bg-white overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300">
      <div className="relative w-full aspect-[4/3] bg-gray-50 flex items-center justify-center p-8">
        <button onClick={onBack} className="absolute top-12 left-6 z-30 bg-white/90 backdrop-blur p-2.5 rounded-2xl shadow-xl border border-gray-100 active:scale-95 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="w-full h-full relative group">
          <img src={photos[currentPhotoIdx]} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
          {photos.length > 1 && (
            <>
              <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/40 p-2 rounded-r-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/40 p-2 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-6 pb-24 pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">{item.title}</h1>
            <span className="text-sm font-bold text-orange-600 uppercase tracking-tighter">{item.brand || item.category}</span>
          </div>
          <div className="border-2 border-orange-100 rounded-[1.25rem] px-4 py-2 bg-white shadow-sm">
            <span className="text-xl font-black text-orange-600">${Number(item.price).toFixed(2)}</span>
          </div>
        </div>

        {/* Clothing Specific Details - Size and Gender */}
        {item.category === 'Clothing' && (
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="bg-gray-900 px-4 py-2 rounded-xl flex items-center space-x-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Size</span>
              <span className="text-xs font-bold text-white uppercase">{item.size || 'N/A'}</span>
            </div>
            <div className="bg-orange-600 px-4 py-2 rounded-xl flex items-center space-x-2">
              <span className="text-[10px] font-black text-orange-200 uppercase tracking-widest">Type</span>
              <span className="text-xs font-bold text-white uppercase">{item.gender || 'Unisex'}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 p-4 rounded-[1.5rem] border border-gray-100">
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Condition</p>
            <p className="text-sm font-bold text-gray-800">{item.condition}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-[1.5rem] border border-gray-100">
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Category</p>
            <p className="text-sm font-bold text-gray-800">{item.category}</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-[1.5rem] p-4 mb-6 flex items-center space-x-3">
          <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-0.5">Pickup Location</p>
            <p className="text-sm font-bold text-gray-900">{item.location}</p>
          </div>
        </div>

        {item.description && (
          <div className="mb-8 p-5 bg-gray-50/30 rounded-[2rem] border border-gray-100">
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-2">Description</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
              {item.description}
            </p>
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-[2rem] p-5 space-y-5 shadow-sm">
          <div className="flex items-center space-x-4">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seller_id}`} 
              className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200" 
              alt="Seller"
            />
            <div>
              <h4 className="font-bold text-gray-900">Campus Seller</h4>
              <p className="text-xs text-gray-400 font-medium">Verified Student</p>
            </div>
          </div>

          {isOwner ? (
            <button 
              onClick={handleDelete} 
              disabled={isDeleting} 
              className="w-full bg-red-50 py-4 rounded-2xl flex items-center justify-center space-x-2 text-red-600 font-bold active:scale-95 transition-all"
            >
              <span className="text-sm uppercase tracking-widest">{isDeleting ? 'Removing...' : 'Delete Listing'}</span>
            </button>
          ) : (
            <button 
              onClick={handleMessageSeller} 
              disabled={isMessaging}
              className="w-full bg-orange-600 shadow-xl shadow-orange-100 py-4 rounded-2xl flex items-center justify-center space-x-2 text-white font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-orange-700"
            >
              <span className="text-sm">{isMessaging ? 'Connecting...' : 'Message Seller'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;

