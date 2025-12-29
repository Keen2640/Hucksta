
import React, { useState } from 'react';

interface EditProfileProps {
  onBack: () => void;
  user: {
    firstName: string;
    lastName: string;
    username: string;
    avatar: string;
  };
}

const EditProfile: React.FC<EditProfileProps> = ({ onBack, user }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [username, setUsername] = useState(user.username);

  return (
    <div className="absolute inset-0 z-[60] flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
      {/* Header - Consistent with ClothingListingForm */}
      <div className="bg-orange-600 p-6 flex items-start space-x-4">
        <button onClick={onBack} className="bg-white/20 p-2 rounded-full text-white transition-colors hover:bg-white/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-white text-xl font-semibold">Edit Profile</h1>
          <p className="text-white/80 text-sm">Update your public profile details</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-10">
        {/* Profile Picture Upload Section */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-orange-50 bg-gray-100 flex items-center justify-center">
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" 
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <button className="absolute -bottom-2 -right-2 bg-orange-600 text-white p-3 rounded-2xl shadow-lg border-4 border-white active:scale-90 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Change Profile Picture</p>
        </div>

        {/* Input Fields */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">First Name</label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex" 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none text-gray-800" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Last Name</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Johnson" 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none text-gray-800" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alexj" 
                className="w-full p-4 pl-9 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none text-gray-800" 
              />
            </div>
            <p className="text-[11px] text-gray-400 ml-1">Your unique handle on Hucksta</p>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={onBack}
            className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-100 active:scale-[0.98] transition-all hover:bg-orange-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
