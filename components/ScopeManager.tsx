import React, { useState, useEffect } from 'react';
import { EngagementType, AuthType, AuthConfig, AgentTuningConfig } from '../types';

interface ScopeManagerProps {
  onStart: (scope: string[], type: EngagementType, excluded: string[], auth: AuthConfig, tuning: AgentTuningConfig) => void;
  isActive: boolean;
  currentExclusions?: string[];
  onUpdateExclusions?: (newExclusions: string[]) => void;
}

const ScopeManager: React.FC<ScopeManagerProps> = ({ onStart, isActive, currentExclusions, onUpdateExclusions }) => {
  const [target, setTarget] = useState('');
  const [excludedInput, setExcludedInput] = useState('');
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<EngagementType>(EngagementType.WEB);
  
  // Tuning State
  const [tuning, setTuning] = useState<AgentTuningConfig>({
    recon: { maxIterations: 10, temperature: 0.2 },
    scanner: { maxIterations: 25, temperature: 0.1 },
    exploit: { maxIterations: 5, temperature: 0.4 }
  });

  // Auth State
  const [authType, setAuthType] = useState<AuthType>(AuthType.NONE);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [keyName, setKeyName] = useState('X-API-Key');
  const [keyValue, setKeyValue] = useState('');
  const [realm, setRealm] = useState('');
  const [kdc, setKdc] = useState('');

  // Sync internal exclusions with parent engagement if active
  useEffect(() => {
    if (isActive && currentExclusions) {
      setExclusions(currentExclusions);
    }
  }, [isActive, currentExclusions]);

  const typeIcons: Record<EngagementType, string> = {
    [EngagementType.WEB]: 'fa-globe',
    [EngagementType.API]: 'fa-plug',
    [EngagementType.MOBILE]: 'fa-mobile-alt',
    [EngagementType.INFRA]: 'fa-network-wired'
  };

  const addExclusion = () => {
    if (excludedInput && !exclusions.includes(excludedInput)) {
      const nextExclusions = [...exclusions, excludedInput];
      setExclusions(nextExclusions);
      setExcludedInput('');
      
      // If engagement is active, push live update
      if (isActive && onUpdateExclusions) {
        onUpdateExclusions(nextExclusions);
      }
    }
  };

  const removeExclusion = (item: string) => {
    const nextExclusions = exclusions.filter(e => e !== item);
    setExclusions(nextExclusions);
    
    // If engagement is active, push live update
    if (isActive && onUpdateExclusions) {
      onUpdateExclusions(nextExclusions);
    }
  };

  const updateTuning = (agent: keyof AgentTuningConfig, field: 'maxIterations' | 'temperature', value: number) => {
    setTuning(prev => ({
      ...prev,
      [agent]: { ...prev[agent], [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    
    const authConfig: AuthConfig = {
      type: authType,
      username,
      password,
      token,
      keyName,
      keyValue,
      realm,
      kdc
    };

    onStart([target], selectedType, exclusions, authConfig, tuning);
  };

  const renderAuthFields = () => {
    switch (authType) {
      case AuthType.BASIC:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Username</label>
              <input 
                type="text" value={username} onChange={e => setUsername(e.target.value)} disabled={isActive}
                className="w-full bg-[#0f1115] border border-gray-700 rounded-xl px-4 py-2 text-gray-200 text-sm mono outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={isActive}
                className="w-full bg-[#0f1115] border border-gray-700 rounded-xl px-4 py-2 text-gray-200 text-sm mono outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        );
      case AuthType.OAUTH:
        return (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bearer / JWT Token</label>
            <textarea 
              value={token} onChange={e => setToken(e.target.value)} disabled={isActive}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full h-20 bg-[#0f1115] border border-gray-700 rounded-xl px-4 py-3 text-gray-200 text-[10px] mono outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        );
      case AuthType.STATIC_KEY:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Header Name</label>
              <input 
                type="text" value={keyName} onChange={e => setKeyName(e.target.value)} disabled={isActive}
                className="w-full bg-[#0f1115] border border-gray-700 rounded-xl px-4 py-2 text-gray-200 text-sm mono outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">API Key Value</label>
              <input 
                type="password" value={keyValue} onChange={e => setKeyValue(e.target.value)} disabled={isActive}
                className="w-full bg-[#0f1115] border border-gray-700 rounded-xl px-4 py-2 text-gray-200 text-sm mono outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        );
      case AuthType.KERBEROS:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Principal / User</label>
              <input 
                type="text" value={username} onChange={e => setUsername(e.target.value)} disabled={isActive}
                className="w-full bg-[#0f1115] border border-gray-700 rounded-xl px-4 py-2 text-gray-200 text-sm mono outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Realm (e.g. CORP.LOCAL)</label>
              <input 
                type="text" value={realm} onChange={e => setRealm(e.target.value)} disabled={isActive}
                className="w-full bg-[#0f1115] border border-gray-700 rounded-xl px-4 py-2 text-gray-200 text-sm mono outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">KDC / Domain Controller</label>
              <input 
                type="text" value={kdc} onChange={e => setKdc(e.target.value)} disabled={isActive}
                className="w-full bg-[#0f1115] border border-gray-700 rounded-xl px-4 py-2 text-gray-200 text-sm mono outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password / NTLM Hash</label>
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={isActive}
                className="w-full bg-[#0f1115] border border-gray-700 rounded-xl px-4 py-2 text-gray-200 text-sm mono outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-800 rounded-2xl">
            <p className="text-xs text-gray-600 uppercase font-black tracking-widest">Agent will operate in unauthenticated mode</p>
          </div>
        );
    }
  };

  const renderTuningAgent = (id: keyof AgentTuningConfig, label: string, color: string) => (
    <div className="bg-black/20 border border-gray-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <i className="fas fa-sliders text-xs"></i>
        </div>
        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{label}</h4>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Brain Temp</span>
            <span className="text-[10px] font-mono text-indigo-400">{tuning[id].temperature.toFixed(2)}</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={tuning[id].temperature} 
            onChange={e => updateTuning(id, 'temperature', parseFloat(e.target.value))}
            disabled={isActive}
            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Recursion Limit</span>
            <span className="text-[10px] font-mono text-indigo-400">{tuning[id].maxIterations}</span>
          </div>
          <input 
            type="range" min="1" max="50" step="1" 
            value={tuning[id].maxIterations} 
            onChange={e => updateTuning(id, 'maxIterations', parseInt(e.target.value))}
            disabled={isActive}
            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="bg-[#16191f] border border-gray-800 rounded-2xl shadow-2xl p-8 lg:p-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <i className="fas fa-bullseye text-white text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Scope Definition</h2>
              <p className="text-gray-500 text-sm font-medium">Configure primary targets and access vectors.</p>
            </div>
          </div>
          {isActive && (
            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
               <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Updates Enabled</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Engagement Type */}
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">Engagement Profile</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.values(EngagementType).map((type) => (
                <button
                  key={type} type="button" disabled={isActive} onClick={() => setSelectedType(type)}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${
                    selectedType === type 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                      : 'bg-[#1c2128] border-gray-800 text-gray-500 hover:border-gray-700'
                  }`}
                >
                  <i className={`fas ${typeIcons[type]} text-xl mb-3`}></i>
                  <span className="text-[10px] font-black uppercase text-center tracking-widest">{type}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Target Definition */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">Root Entry Point</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 opacity-50">
                  <i className="fas fa-link text-xs"></i>
                </div>
                <input 
                  type="text" placeholder="https://app.client.com" value={target}
                  onChange={(e) => setTarget(e.target.value)} disabled={isActive}
                  className="w-full bg-[#0f1115] border border-gray-700 rounded-xl pl-10 pr-4 py-4 text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none transition-all mono text-sm disabled:opacity-50"
                />
              </div>
            </div>

            {/* Exclusions Section - Always active for dynamic updates */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">Exclusion Rules (Live Updateable)</label>
              <div className="flex space-x-2">
                <input 
                  type="text" placeholder="e.g. /logout, 192.168.1.0/24" value={excludedInput}
                  onChange={(e) => setExcludedInput(e.target.value)}
                  className="flex-1 bg-[#0f1115] border border-gray-700 rounded-xl px-4 py-4 text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none transition-all mono text-xs"
                />
                <button 
                  type="button" onClick={addExclusion}
                  className="px-6 bg-[#1c2128] text-indigo-400 rounded-xl hover:bg-gray-800 transition-colors border border-gray-700 shadow-sm"
                >
                  <i className="fas fa-ban"></i>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {exclusions.map((e) => (
                  <span key={e} className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg text-[10px] font-black flex items-center group">
                    <i className="fas fa-shield-slash mr-2 opacity-40"></i>
                    {e}
                    <button onClick={() => removeExclusion(e)} className="ml-2 hover:text-red-200">
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Hyperparameter Tuning Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                 <i className="fas fa-microchip text-sm"></i>
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Specialist Hyperparameters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {renderTuningAgent('recon', 'Recon Specialist', 'bg-blue-500/10 text-blue-400')}
               {renderTuningAgent('scanner', 'Scan Specialist', 'bg-purple-500/10 text-purple-400')}
               {renderTuningAgent('exploit', 'Exploit Specialist', 'bg-red-500/10 text-red-400')}
            </div>
          </div>

          {/* Authentication Section */}
          <div className="bg-[#1c2128]/50 border border-gray-800 rounded-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <i className="fas fa-lock text-sm"></i>
                 </div>
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Target Access & Credentials</h3>
               </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.values(AuthType).map((type) => (
                <button
                  key={type} type="button" disabled={isActive} onClick={() => setAuthType(type)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    authType === type 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                      : 'bg-[#0f1115] border-gray-800 text-gray-500 hover:border-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              {renderAuthFields()}
            </div>
          </div>

          <div className="pt-6">
             <button 
               type="submit" disabled={isActive || !target}
               className={`group w-full py-5 rounded-2xl font-black tracking-[0.3em] text-xs transition-all shadow-2xl relative overflow-hidden ${
                 isActive || !target 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-[0.98]'
               }`}
             >
               {isActive ? (
                 <span className="flex items-center justify-center">
                   <i className="fas fa-shield-halved mr-3 animate-pulse"></i>
                   FLEET ACTIVE: SCOPE LOCKED
                 </span>
               ) : (
                 <span className="flex items-center justify-center">
                   <i className="fas fa-shield-virus mr-3 group-hover:animate-pulse"></i>
                   INITIALIZE ADVANCED PENTEST ENGINE
                 </span>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScopeManager;