
import React from 'react';
import { Engagement, Finding } from '../types';

interface DashboardProps {
  engagement: Engagement | null;
  findings: Finding[];
  onTerminate?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ engagement, findings, onTerminate }) => {
  const stats = [
    { label: 'Critical Assets', value: '42', icon: 'fa-server', color: 'text-indigo-400' },
    { label: 'Active Engagements', value: engagement ? '1' : '0', icon: 'fa-satellite-dish', color: 'text-green-400' },
    { label: 'Total Findings', value: findings.length > 0 ? findings.length : '1,284', icon: 'fa-bug', color: 'text-red-400' },
    { label: 'SLA Compliant', value: '98%', icon: 'fa-check-double', color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#16191f] p-6 rounded-2xl border border-gray-800 shadow-xl transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
              <i className={`fas ${stat.icon} ${stat.color}`}></i>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Scan Progress */}
        <div className="lg:col-span-2 bg-[#16191f] rounded-2xl border border-gray-800 shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Live Engagement Timeline</h3>
            <div className="flex space-x-2">
               {engagement?.activeVector && (
                  <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full font-bold uppercase animate-pulse">
                    Testing: {engagement.activeVector}
                  </span>
               )}
               {engagement && onTerminate && (
                 <button 
                  onClick={onTerminate}
                  className="text-[9px] bg-red-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest hover:bg-red-500 transition-colors shadow-lg"
                 >
                   TERMINATE ALL
                 </button>
               )}
            </div>
          </div>
          
          {engagement ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-200">{engagement.name}</h4>
                  <p className="text-sm text-gray-500">Scope: {engagement.targets[0]}</p>
                  <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">Ignoring {engagement.excludedAssets.length} assets</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-indigo-400 block">{engagement.progress}%</span>
                  <span className="text-[9px] text-gray-600 uppercase font-bold">{engagement.status}</span>
                </div>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${engagement.progress}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-4 gap-4 pt-4">
                {['Recon', 'Scan', 'Exploit', 'Report'].map((phase, idx) => {
                  const phaseThreshold = (idx + 1) * 25;
                  const isCurrent = engagement.progress >= idx * 25 && engagement.progress < phaseThreshold;
                  const isCompleted = engagement.progress >= phaseThreshold;
                  
                  return (
                    <div key={phase} className="flex flex-col items-center">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 text-xs font-bold border-2 transition-all ${
                         isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : 
                         isCurrent ? 'border-indigo-400 text-indigo-400 bg-indigo-500/10 animate-pulse' : 
                         'border-gray-700 text-gray-600'
                       }`}>
                        {idx + 1}
                       </div>
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted || isCurrent ? 'text-gray-300' : 'text-gray-600'}`}>{phase}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                <i className="fas fa-radar text-gray-500 text-2xl"></i>
              </div>
              <p className="text-gray-400 font-medium mb-1">Infrastructure Standby</p>
              <p className="text-sm text-gray-600 max-w-xs">Define a target in the Scope Management tab to begin automated testing.</p>
            </div>
          )}
        </div>

        {/* Security Pulse */}
        <div className="bg-[#16191f] rounded-2xl border border-gray-800 shadow-xl p-8">
           <h3 className="text-lg font-bold text-white mb-6">Asset Intelligence</h3>
           <div className="space-y-6">
             {engagement?.excludedAssets.length ? (
               <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                 <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Exclusion Rules Active</p>
                 <div className="space-y-1">
                   {engagement.excludedAssets.slice(0, 3).map(e => (
                     <div key={e} className="text-[10px] text-gray-500 mono flex items-center">
                       <i className="fas fa-ban mr-2 text-red-500/40"></i> {e}
                     </div>
                   ))}
                   {engagement.excludedAssets.length > 3 && <div className="text-[9px] text-gray-600">+{engagement.excludedAssets.length - 3} more</div>}
                 </div>
               </div>
             ) : (
               <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                 <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Full Scope Testing</p>
                 <p className="text-[10px] text-gray-500 italic">No assets are currently blacklisted.</p>
               </div>
             )}
             
             <div className="pt-4 space-y-4">
               <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-shield-alt text-orange-500"></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">IPS Evasion Active</p>
                    <p className="text-xs text-gray-500">Agent-rotator: ON</p>
                  </div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
