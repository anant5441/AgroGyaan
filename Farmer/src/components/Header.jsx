import React from 'react';
import { Leaf, Activity } from 'lucide-react';

export function Header() {
  return (
    <header className="shadow-sm" style={{ backgroundColor: '#CADCAE' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full"
              style={{ backgroundColor: '#8FA31E' }}
            >
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-[#8FA31E]">Agrogyaan</h1>
              <p className="text-sm text-gray-600">Smart Agriculture Solutions</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[#8FA31E]">
            <Activity className="w-5 h-5" />
            <span className="hidden sm:inline">Disease Detection</span>
          </div>
        </div>
      </div>
    </header>
  );
}
