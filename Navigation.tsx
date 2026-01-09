import React from 'react';
import { Tab } from '../types';

interface NavigationProps {
  activeTab: Tab;
  unreadCount?: number;
  onTabChange: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, unreadCount = 0, onTabChange }) => {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-8 pt-4 pb-6 flex justify-between items-center z-50">
      <button 
        onClick={() => onTabChange(Tab.HOME)}
        className={`flex flex-col items-center space-y-1 transition-all duration-300 ${activeTab === Tab.HOME ? 'text-orange-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={activeTab === Tab.HOME ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>

      <button 
        onClick={() => onTabChange(Tab.MESSAGES)}
        className={`flex flex-col items-center space-y-1 relative transition-all duration-300 ${activeTab === Tab.MESSAGES ? 'text-orange-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={activeTab === Tab.MESSAGES ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {unreadCount > 0 && (
            <div 
              key={unreadCount}
              className="absolute -top-2 -right-2.5 min-w-[20px] h-[20px] bg-[#E53935] rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300 shadow-sm"
            >
              <span className="text-[10px] font-black text-white px-1 leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </div>
      </button>

      <button 
        onClick={() => onTabChange(Tab.SELL)}
        className={`flex flex-col items-center transition-all duration-300 transform translate-y-0.5 ${activeTab === Tab.SELL ? 'scale-110' : 'hover:scale-105 active:scale-95'}`}
      >
        <div className={`
          px-4 py-1.5 rounded-full flex items-center justify-center transition-all duration-300 border-2
          ${activeTab === Tab.SELL 
            ? 'bg-orange-600 border-orange-600 shadow-md shadow-orange-100' 
            : 'bg-white border-orange-500 shadow-sm'}
        `}>
          <span className={`text-[11px] font-black uppercase tracking-widest ${activeTab === Tab.SELL ? 'text-white' : 'text-orange-600'}`}>
            Sell
          </span>
        </div>
      </button>

      <button 
        onClick={() => onTabChange(Tab.PROFILE)}
        className={`flex flex-col items-center space-y-1 transition-all duration-300 ${activeTab === Tab.PROFILE ? 'text-orange-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={activeTab === Tab.PROFILE ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
    </nav>
  );
};

export default Navigation;
