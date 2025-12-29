
import React, { useState } from 'react';

interface MarketplaceProps {
  onSelectItem?: (item: any) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onSelectItem }) => {
  const [activeCategory, setActiveCategory] = useState('Clothing');

  const categories = [
    { name: 'Clothing', icon: '👕' },
    { name: 'Furniture', icon: '🪑' },
    { name: 'Electronics', icon: '💻' }
  ];

  const items = [
    { 
      id: '1', 
      title: 'Mini Fridge - Perfect for Dorm', 
      brand: 'Danby',
      location: 'Res Hall North',
      price: 75, 
      condition: 'Good',
      conditionColor: 'bg-emerald-600',
      category: 'Furniture',
      categoryIcon: '🪑',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'
    },
    { 
      id: '2', 
      title: 'UTD Temoc Hoodie - Official Merch', 
      brand: 'UTD',
      location: 'Student Union',
      price: 35, 
      condition: 'Excellent',
      conditionColor: 'bg-emerald-600',
      category: 'Clothing',
      categoryIcon: '👕',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400'
    },
    { 
      id: '3', 
      title: 'Modern Study Lamp', 
      brand: 'IKEA',
      location: 'Library',
      price: 15, 
      condition: 'Like New',
      conditionColor: 'bg-emerald-600',
      category: 'Furniture',
      categoryIcon: '🪑',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=400'
    },
    { 
      id: '4', 
      title: 'Vintage Levi 501 Jeans', 
      brand: 'Levis',
      location: 'JSOM',
      price: 55, 
      condition: 'Excellent',
      conditionColor: 'bg-emerald-600',
      category: 'Clothing',
      categoryIcon: '👕',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400'
    },
    { 
      id: '5', 
      title: 'Sony Noise Cancelling Headphones', 
      brand: 'Sony',
      location: 'Student Union',
      price: 120, 
      condition: 'Like New',
      conditionColor: 'bg-purple-600',
      category: 'Electronics',
      categoryIcon: '💻',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400'
    },
    { 
      id: '6', 
      title: 'Mechanical Keyboard (Blue Switches)', 
      brand: 'Keychron',
      location: 'Library',
      price: 45, 
      condition: 'Good',
      conditionColor: 'bg-purple-600',
      category: 'Electronics',
      categoryIcon: '💻',
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=400'
    }
  ];

  const filteredItems = items.filter(item => item.category === activeCategory);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-emerald-400 via-orange-500 to-[#F27F44] overflow-y-auto no-scrollbar">
      {/* Top Logo Section */}
      <div className="pt-14 pb-4 px-4 flex justify-center z-10">
        <h1 className="text-5xl font-black text-white tracking-tight">Hucksta</h1>
      </div>

      {/* Header Controls */}
      <div className="pb-6 px-4">
        {/* Search Bar */}
        <div className="flex items-center pt-6 mb-6">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search clothing, furniture, or tech..." 
              className="w-full h-12 pl-12 pr-4 bg-white rounded-2xl text-sm font-medium focus:outline-none shadow-xl shadow-black/10 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Category Pill Feed */}
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button 
              key={cat.name} 
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full whitespace-nowrap transition-all duration-200 shadow-sm border ${
                activeCategory === cat.name 
                ? 'bg-white text-orange-600 border-white' 
                : 'bg-white/20 text-white border-white/30 backdrop-blur-md hover:bg-white/30'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm font-bold uppercase tracking-wide">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Items */}
      <div className="flex-1 p-3 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item: any) => (
            <div 
              key={item.id} 
              onClick={() => onSelectItem?.(item)}
              className="bg-white rounded-[2rem] p-1.5 shadow-xl flex flex-col h-full transform active:scale-95 transition-transform cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] rounded-[1.75rem] overflow-hidden mb-2">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                
                {/* Condition Tag */}
                <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-md ${item.conditionColor}`}>
                  {item.condition}
                </div>

                {/* Favorite Button */}
                <button className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                {/* Category Label */}
                <div className={`absolute bottom-2 left-2 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center shadow-lg shadow-black/10 ${
                  item.category === 'Electronics' ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  <span className="mr-1">{item.categoryIcon}</span>
                  {item.category}
                </div>

                {/* Graduation Icon Badge */}
                <div className="absolute bottom-2 right-2 bg-white/80 p-1.5 rounded-full shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
              </div>

              {/* Text Content */}
              <div className="px-2 pb-2">
                <h3 className="font-bold text-gray-800 text-xs leading-tight mb-1 line-clamp-2 h-8">
                  {item.title}
                </h3>
                <p className="text-[10px] text-gray-400 font-medium mb-1">{item.brand}</p>
                <div className="flex items-center text-emerald-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[9px] font-bold">{item.location}</span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-orange-600 font-black text-lg">${item.price}</p>
                  {item.category === 'Clothing' && (
                    <div className="w-5 h-5 rounded-full border border-gray-100 flex items-center justify-center text-[8px] text-gray-400 font-bold mb-1">
                      M
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
