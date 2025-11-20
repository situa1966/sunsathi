import React from 'react';
import { Sun, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-full text-white">
            <Sun size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sun-Sathi</h1>
            <p className="text-xs text-orange-600 font-medium hidden sm:block">Solar Potential & Subsidy Analyzer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <Zap size={16} />
                <span>PM Surya Ghar Yojana Supported</span>
            </div>
            <a 
              href="https://pmsuryaghar.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Official Portal &rarr;
            </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
