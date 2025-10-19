'use client';

import React from 'react';
import { X, Plus } from 'lucide-react';

interface Tab {
  id: string;
  title: string;
  isActive: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
}

export default function TabBar({ tabs, onTabClick, onTabClose, onNewTab }: TabBarProps) {
  return (
    <div className="flex items-center bg-gradient-to-b from-gray-950 to-gray-950/95 border-b border-gray-800/50 h-10 overflow-x-auto scrollbar-hide backdrop-blur-sm">
      {/* Tabs */}
      <div className="flex items-center flex-1 overflow-x-auto">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            style={{ animationDelay: `${index * 50}ms` }}
            className={`
              group relative flex items-center gap-2 px-4 h-10 min-w-[140px] max-w-[200px]
              border-r border-gray-800/50 cursor-pointer transition-all duration-200
              ${tab.isActive
                ? 'bg-gradient-to-b from-gray-900 to-gray-900/95 text-white shadow-lg'
                : 'bg-transparent text-gray-400 hover:bg-gray-900/30 hover:text-gray-300'
              }
            `}
          >
            {/* Tab Title */}
            <span className="flex-1 truncate text-sm font-medium tracking-wide">
              {tab.title}
            </span>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className={`
                opacity-0 group-hover:opacity-100 transition-all duration-200
                p-0.5 rounded-md hover:bg-red-500/20 hover:text-red-400
                ${tab.isActive ? 'opacity-70 hover:opacity-100' : ''}
              `}
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Active Indicator */}
            {tab.isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 shadow-lg shadow-blue-500/50" />
            )}

            {/* Hover Glow */}
            <div className={`
              absolute inset-0 bg-gradient-to-b from-blue-500/0 to-blue-500/0
              group-hover:from-blue-500/5 group-hover:to-transparent
              transition-all duration-300 pointer-events-none
            `} />
          </div>
        ))}
      </div>

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-white hover:bg-blue-500/10 transition-all duration-200 group"
        title="新增 Session (⌘T)"
      >
        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
}
