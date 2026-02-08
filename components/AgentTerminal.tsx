
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AgentLog, Engagement, AgentStatus, EngagementType } from '../types';

interface AgentTerminalProps {
  logs: AgentLog[];
  engagement: Engagement | null;
  onUpdateExclusions?: (newExclusions: string[]) => void;
  onClearLogs?: () => void;
  onTerminate?: () => void;
}

interface TechInfo {
  name: string;
  version: string;
  icon: string;
  vectors: string[];
}

const AgentTerminal: React.FC<AgentTerminalProps> = ({ logs, engagement, onUpdateExclusions, onClearLogs, onTerminate }) => {
  const [filterAgent, setFilterAgent] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [activeProfile, setActiveProfile] = useState<EngagementType>(engagement?.type || EngagementType.WEB);
  const [dynamicExclusion, setDynamicExclusion] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Logs are usually prepended in simulation, but if they were appended it would be scrollHeight
      // Actually in this app, logs are often prepended. Let's handle both.
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const agentsList = useMemo(() => {
    const agents = Array.from(new Set(logs.map(log => log.agentName)));
    return ['ALL', ...agents];
  }, [logs]);

  const logTypes = ['ALL', 'OBSERVE', 'THINK', 'ACT', 'REFLECT', 'SYSTEM'];

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const agentMatch = filterAgent === 'ALL' || log.agentName === filterAgent;
      const typeMatch = filterType === 'ALL' || log.type === filterType;
      return agentMatch && typeMatch;
    });
  }, [logs, filterAgent, filterType]);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'OBSERVE': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'THINK': return 'bg-purple-500/20 text-purple-300 border-purple-500/30 font-medium italic';
      case 'ACT': return 'bg-orange-500/10 text-orange-400 border-orange-500/20 font-bold';
      case 'REFLECT': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'SYSTEM': return 'bg-gray-800 text-gray-400 border-gray-700';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'OBSERVE': return 'fa-eye';
      case 'THINK': return 'fa-brain';
      case 'ACT': return 'fa-bolt';
      case 'REFLECT': return 'fa-sync-alt';
      case 'SYSTEM': return 'fa-cog';
      default: return 'fa-info-circle';
    }
  };

  const handleQuickExclude = () => {
    if (dynamicExclusion && engagement && onUpdateExclusions) {
      const newExclusions = [...engagement.excludedAssets, dynamicExclusion];
      onUpdateExclusions(newExclusions);
      setDynamicExclusion('');
    }
  };

  const techStacks: Record<EngagementType, TechInfo[]> = {
    [EngagementType.WEB]: [
      { name: 'React', version: '18.2.0', icon: 'fa-brands fa-react', vectors: ['XSS in Props', 'State Leakage'] },
      { name: 'Node.js', version: '16.x', icon: 'fa-brands fa-node-js', vectors: ['Prototype Pollution', 'Insecure Deserialization'] },
      { name: 'Nginx', version: '1.24', icon: 'fa-globe', vectors: ['Proxy Misconfig', 'Buffer Overflow'] }
    ],
    [EngagementType.API]: [
      { name: 'GraphQL', version: 'v16', icon: 'fa-project-diagram', vectors: ['Complexity DOS', 'Introspection Leak'] },
      { name: 'Go', version: '1.21', icon: 'fa-brands fa-golang', vectors: ['Panic Bypass', 'Stack Trace Leaks'] },
      { name: 'PostgreSQL', version: '15.2', icon: 'fa-database', vectors: ['Blind SQLi', 'Config Exposure'] }
    ],
    [EngagementType.MOBILE]: [
      { name: 'Kotlin', version: '1.9', icon: 'fa-code', vectors: ['Intent Filters', 'Hardcoded API Keys'] },
      { name: 'Firebase', version: '9.x', icon: 'fa-fire', vectors: ['Open NoSQL Rules', 'Auth Bypass'] }
    ],
    [EngagementType.INFRA]: [
      { name: 'Docker', version: '24.x', icon: 'fa-brands fa-docker', vectors: ['Socket Exposure', 'Container Escape'] },
      { name: 'Kubernetes', version: '1.28', icon: 'fa-dharmachakra', vectors: ['Kubelet RCE', 'API Server Auth'] },
      { name: 'OpenSSH', version: '8.9p1', icon: 'fa-terminal', vectors: ['Auth Brute-force', 'Channel side-channels'] }
    ]
  };

  const currentTech = techStacks[activeProfile] || [];

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 lg:flex-row lg:space-x-6 lg:space-y-0">
      <div className="flex-1 flex flex-col bg-[#16191f] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Mission Status Bar Overlay */}
        {engagement && (
          <div className="bg-[#1c2128] border-b border-gray-800 px-6 py-3 flex items-center justify-between relative overflow-hidden">
             <div className="absolute top-0 left-0 h-full bg-red-500/5 transition-all duration-1000" style={{ width: `${engagement.progress}%` }}></div>
             <div className="absolute bottom-0 left-0 h-[1px] bg-red-500 transition-all duration-1000" style={{ width: `${engagement.progress}%` }}></div>

             <div className="flex items-center space-x-4 relative z-10">
                <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Attack Vector:</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-black/40 rounded border border-gray-700">
                   <span className="text-xs font-mono font-bold text-red-400">[{engagement.activeVector || 'PENDING'}]</span>
                </div>
             </div>

             <div className="flex items-center space-x-4 relative z-10">
                {onTerminate && (
                  <button 
                    onClick={onTerminate}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"
                  >
                    TERMINATE FLEET
                  </button>
                )}
                <div className="flex flex-col items-end">
                   <span className="text-[9px] font-bold text-gray-500 uppercase">Engine Status</span>
                   <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{engagement.status}</span>
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 border border-gray-800">
                   <i className={`fas ${engagement.status === AgentStatus.SCAN ? 'fa-satellite-dish' : 'fa-user-secret'} text-indigo-500 text-sm animate-pulse`}></i>
                </div>
             </div>
          </div>
        )}

        {/* Console Filters and Controls */}
        <div className="bg-[#0f1115] px-6 py-3 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Filters:</span>
             <div className="flex items-center bg-[#1c2128] rounded-lg border border-gray-700 p-0.5">
               <select 
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-gray-300 rounded-lg px-2 py-1 outline-none cursor-pointer uppercase border-r border-gray-700"
              >
                {agentsList.map(agent => (
                  <option key={agent} value={agent}>{agent === 'ALL' ? 'ALL AGENTS' : agent}</option>
                ))}
              </select>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-gray-300 rounded-lg px-2 py-1 outline-none cursor-pointer uppercase"
              >
                {logTypes.map(type => (
                  <option key={type} value={type}>{type === 'ALL' ? 'ALL TYPES' : type}</option>
                ))}
              </select>
             </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-[9px] font-bold px-3 py-1 rounded border uppercase tracking-widest transition-all ${
                autoScroll ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' : 'bg-gray-800 text-gray-500 border-gray-700'
              }`}
            >
              Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
            </button>
            <button 
              onClick={onClearLogs}
              className="text-[9px] font-bold px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-widest hover:bg-red-500/20 transition-all"
            >
              Clear Console
            </button>
          </div>
        </div>

        {/* Console Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 mono text-[13px] leading-relaxed scroll-smooth bg-[#0d0f14]"
        >
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-4 py-20">
              <i className="fas fa-terminal text-5xl opacity-5"></i>
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-30">Awaiting Agent Telemetry...</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className={`group border-l-2 pl-4 transition-all py-1 ${
                  log.type === 'THINK' ? 'bg-purple-500/5 border-purple-500/30' : 
                  log.type === 'REFLECT' ? 'bg-green-500/5 border-green-500/30' :
                  'border-transparent hover:border-indigo-500/30'
                }`}
              >
                <div className="flex items-center space-x-3 mb-1.5">
                  <span className="text-[10px] text-gray-600 font-bold">[{log.timestamp}]</span>
                  <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded border uppercase text-[9px] font-bold tracking-widest ${getTypeStyles(log.type)}`}>
                    <i className={`fas ${getTypeIcon(log.type)} text-[8px]`}></i>
                    <span>{log.type}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{log.agentName}</span>
                </div>
                
                {log.type === 'THINK' ? (
                  <div className="bg-[#1c1f26]/50 p-3 rounded-lg border border-purple-500/10 mt-2">
                    <p className="text-purple-300 italic">
                       {log.message}
                    </p>
                  </div>
                ) : log.type === 'ACT' ? (
                  <p className="text-indigo-400 font-bold ml-2">
                    <span className="text-indigo-500/50 mr-2">&gt;</span>
                    {log.message}
                  </p>
                ) : (
                  <p className="text-gray-400 ml-2">
                    {log.message}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="bg-[#0f1115] px-6 py-3 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
             <div className="flex items-center space-x-2 text-indigo-500 font-bold text-xs shrink-0">
               <i className="fas fa-angle-right"></i>
               <span className="mono">aegis:~$</span>
             </div>
             <input 
               type="text" 
               placeholder="Direct sub-agent command or strategy manual override..."
               className="bg-transparent border-none text-gray-400 mono text-xs w-full focus:ring-0 placeholder:text-gray-700"
             />
          </div>
          <div className="flex space-x-4 items-center pl-4 border-l border-gray-800 ml-4">
             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Exclusion:</span>
             <div className="flex space-x-2">
               <input 
                 type="text"
                 placeholder="URL/IP..."
                 value={dynamicExclusion}
                 onChange={(e) => setDynamicExclusion(e.target.value)}
                 className="bg-[#1c2128] border border-gray-700 rounded px-2 py-1 text-[10px] text-gray-300 mono outline-none focus:border-red-500/50 w-32"
               />
               <button 
                 onClick={handleQuickExclude}
                 className="bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded text-[9px] font-bold text-red-400 border border-red-500/20 uppercase transition-all"
               >
                 VOID
               </button>
             </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col space-y-6">
        <div className="bg-[#16191f] border border-gray-800 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-500">
           <div className="bg-[#1c2128] p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                <i className="fas fa-microchip text-indigo-500 mr-2"></i>
                Fingerprinting
              </h3>
              {engagement && <span className="text-[9px] text-green-400 font-bold">SYNCHRONIZED</span>}
           </div>
           <div className="p-4 space-y-4">
              {currentTech.length > 0 ? currentTech.map((tech, i) => (
                <div key={i} className="group bg-[#0f1115] rounded-xl border border-gray-800 overflow-hidden hover:border-indigo-500/50 transition-all">
                  <div className="p-3 flex items-center justify-between bg-[#1c2128]/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                        <i className={`${tech.icon} text-indigo-400 text-xs`}></i>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-200 block">{tech.name}</span>
                        <span className="text-[8px] mono text-gray-600 uppercase">Ver {tech.version}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-gray-800 bg-[#0d0f14]">
                    <div className="flex flex-wrap gap-1">
                      {tech.vectors.map((v, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-red-500/5 text-red-500 border border-red-500/10 rounded text-[8px] font-bold">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center">
                   <p className="text-[10px] text-gray-600 italic">No assets identified in current scope.</p>
                </div>
              )}
           </div>
        </div>
        
        <div className="bg-[#16191f] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
           <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Active Exclusions</h3>
           </div>
           <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {engagement?.excludedAssets.length ? (
                  engagement.excludedAssets.map(e => (
                    <span key={e} className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[9px] mono">
                      {e}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-600 italic">No blacklisted assets.</span>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <span>Strategy Override</span>
                  <i className="fas fa-lock text-[8px]"></i>
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed italic">
                  Agents are operating in "Stealth" mode. No active exploitation of critical infrastructure targets without manual confirmation.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AgentTerminal;
