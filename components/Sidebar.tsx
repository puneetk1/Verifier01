import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  engagementActive?: boolean;
  onTerminate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, engagementActive, onTerminate }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'scope', icon: 'fa-bullseye', label: 'Scope Management' },
    { id: 'tools', icon: 'fa-wrench', label: 'Tools Config' },
    { id: 'agents', icon: 'fa-robot', label: 'AI Agents' },
    { id: 'findings', icon: 'fa-shield-virus', label: 'Findings Hub' },
    { id: 'ecosystem', icon: 'fa-layer-group', label: 'Security Ecosystem' },
    { id: 'system-health', icon: 'fa-heartbeat', label: 'System Health' },
    { id: 'infrastructure', icon: 'fa-server', label: 'Infrastructure' },
    { id: 'llm-status', icon: 'fa-microchip', label: 'LLM Status' },
    { id: 'docs', icon: 'fa-book-open', label: 'Deployment' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#16191f] border-r border-gray-800 flex flex-col h-full">
      <div className="p-6 mb-4 flex items-center space-x-3">
        <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fas fa-crosshairs text-white text-lg"></i>
        </div>
        <span className="font-bold text-xl tracking-tight text-white uppercase">Aegis AI</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center ${activeTab === item.id ? 'text-white' : 'group-hover:text-indigo-400'}`}></i>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-gray-800 space-y-4">
        {engagementActive && onTerminate && (
          <button 
            onClick={onTerminate}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-500/10"
          >
            <i className="fas fa-skull"></i>
            <span>Emergency Kill</span>
          </button>
        )}

        <div className="bg-[#1c2128] rounded-xl p-4 border border-gray-800">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Licensed to</p>
          <p className="text-sm font-semibold text-gray-200">CyberOps Enterprise</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-gray-500">Tier: Platinum</span>
            <span className="text-[10px] bg-green-500/20 text-green-500 px-2 rounded-full border border-green-500/30">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;