import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface MarketplaceProps {
  onSelectItem?: (item: any) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onSelectItem }) => {
  const [activeCategory, setActiveCategory] = useState('Clothing');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'Clothing', icon: '👕' },
    { name: 'Furniture', icon: '🪑' },
    { name: 'Electronics', icon: '💻' }
  ];

  useEffect(() => {
    fetchListings();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('marketplace-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
          fetchListings();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const fetchListings = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setListings(data);
    } catch (err: any) {
      console.error('Fetch error:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const displayedItems = listings.filter(item => {
    const matchesCategory = item.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchLower) || 
                         (item.brand && item.brand.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

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

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
      {/* Simplified Header */}
      <div className="pt-16 pb-8 px-6 bg-white">
        <h1 className="text-4xl font-black text-orange-600 tracking-tight mb-6">Hucksta</h1>
        
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campus items..." 
            className="w-full h-12 pl-12 pr-4 bg-gray-50 rounded-2xl text-sm font-medium focus:outline-none border border-gray-100 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat.name} 
              onClick={() => {
                setActiveCategory(cat.name);
                setSearchQuery('');
              }}
              className={`flex items-center space-x-2 px-5 py-3 rounded-2xl whitespace-nowrap transition-all ${
                activeCategory === cat.name 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'bg-gray-50 text-gray-500 border border-gray-100'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pb-32">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8 bg-gray-50 rounded-[2.5rem]">
            <h3 className="text-gray-900 font-bold mb-1">No items found</h3>
            <p className="text-gray-400 text-xs">Be the first to list something in {activeCategory}!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {displayedItems.map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => onSelectItem?.(item)}
                className="group bg-white rounded-3xl p-1.5 border border-gray-100 flex flex-col h-full transform active:scale-95 hover:border-orange-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-2">
                  <img src={getThumbnail(item.image_url)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-[8px] font-black text-orange-600 bg-white border border-orange-600 uppercase tracking-widest shadow-sm">
                    {item.condition}
                  </div>
                </div>

                <div className="px-2 pb-2">
                  <div className="flex flex-wrap items-center gap-x-1.5 mb-1">
                    {item.brand && (
                      <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest truncate max-w-[65px]">
                        {item.brand}
                      </p>
                    )}
                    {item.category === 'Clothing' && (
                      <span className="text-[7px] font-bold text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200">
                        {item.gender || 'Unisex'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-[11px] leading-tight mb-1 line-clamp-2 h-6">{item.title}</h3>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-orange-600 font-black text-sm">${Number(item.price).toFixed(2)}</p>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter truncate max-w-[60px]">{item.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
