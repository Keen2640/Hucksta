import React, { useState } from 'react';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');

  const listings = [
    {
      id: '1',
      title: 'Vintage Denim Jacket',
      price: 89,
      status: 'Active',
      image: 'https://picsum.photos/seed/jacket/100/100'
    },
    {
      id: '2',
      title: 'Nike SB Dunks',
      price: 159,
      status: 'Active',
      image: 'https://picsum.photos/seed/shoes/100/100'
    }
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Profile Header */}
      <div className="relative h-64 bg-gradient-to-br from-orange-500 via-orange-600 to-emerald-600 p-6 flex flex-col justify-end">
        <button className="absolute top-6 right-6 bg-white/20 p-2 rounded-xl text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src="https://picsum.photos/seed/alex/100/100" 
              alt="Alex" 
              className="w-24 h-24 rounded-3xl border-4 border-white object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-full border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zM10 5a1 1 0 00-1 1v2.586L7.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 8.586V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold">Alex Johnson</h2>
            <p className="text-white/80">@alexj</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-4 text-sm font-semibold relative ${activeTab === 'active' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          Active Listings
          {activeTab === 'active' && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-orange-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('sold')}
          className={`flex-1 py-4 text-sm font-semibold relative ${activeTab === 'sold' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          Sold Items
          {activeTab === 'sold' && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-orange-600 rounded-t-full" />}
        </button>
      </div>

      {/* Listings List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'active' ? listings.map((item) => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-3 flex space-x-4 shadow-sm">
            <div className="relative">
              <img src={item.image} alt={item.title} className="w-20 h-20 rounded-2xl object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-gray-800">{item.title}</h3>
              <p className="text-orange-600 font-bold text-lg">${item.price}</p>
            </div>
            <button className="self-center p-2 text-gray-400 border border-gray-100 rounded-xl hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="font-medium">No sold items yet</p>
          </div>
        )}
      </div>

      {/* Edit Profile Button */}
      <div className="p-4 border-t border-gray-100">
        <button className="w-full bg-orange-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-orange-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
