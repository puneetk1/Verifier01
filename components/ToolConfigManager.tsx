
import React, { useState, useRef } from 'react';
import { ToolConfig, ToolParameter, ApiKeyConfig, InstallationStatus } from '../types';

interface ToolConfigManagerProps {
  configs: ToolConfig[];
  apiKeys: ApiKeyConfig[];
  onUpdate: (updated: ToolConfig) => void;
  onUpdateCategory: (category: string, enabled: boolean) => void;
  onUpdateApiKey: (id: string, newKey: string) => void;
  onImportConfigs?: (newConfigs: ToolConfig[]) => void;
  onInstallMissing?: () => void;
}

const ToolConfigManager: React.FC<ToolConfigManagerProps> = ({ 
  configs, 
  apiKeys, 
  onUpdate, 
  onUpdateCategory, 
  onUpdateApiKey, 
  onImportConfigs,
  onInstallMissing 
}) => {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [onboardingCategory, setOnboardingCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTool = (config: ToolConfig) => {
    if (config.installationStatus !== 'Installed') return;
    onUpdate({ ...config, enabled: !config.enabled });
  };

  const updateParam = (config: ToolConfig, index: number, newValue: string) => {
    const newParams = [...config.parameters];
    newParams[index] = { ...newParams[index], value: newValue };
    onUpdate({ ...config, parameters: newParams });
  };

  const toggleKeyVisibility = (id: string) => {
    const next = new Set(visibleKeys);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisibleKeys(next);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(configs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `aegis_tool_config_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json) && onImportConfigs) {
          onImportConfigs(json);
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Recon': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Scanner': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Exploitation': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Post-Exploitation': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusStyle = (status: InstallationStatus) => {
    switch (status) {
      case 'Installed': return 'text-green-400 border-green-500/30 bg-green-500/5';
      case 'Not Installed': return 'text-gray-500 border-gray-700 bg-gray-800/50';
      case 'Installing...': return 'text-blue-400 border-blue-500/30 bg-blue-500/5 animate-pulse';
      case 'Error': return 'text-red-400 border-red-500/30 bg-red-500/5';
      default: return 'text-gray-400 border-gray-700 bg-gray-800/50';
    }
  };

  const getNoiseColor = (level?: string) => {
    switch (level) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'High': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getToolIcon = (id: string) => {
    switch (id) {
      case 'nmap': return 'fa-network-wired';
      case 'amass': return 'fa-circle-nodes';
      case 'nuclei': return 'fa-bolt';
      case 'sqlmap': return 'fa-database';
      case 'metasploit': return 'fa-skull-crossbones';
      case 'mimikatz': return 'fa-id-card-clip';
      case 'strix': return 'fa-user-ninja';
      case 'cai': return 'fa-cloud-meatball';
      case 'zap': return 'fa-spider';
      default: return 'fa-wrench';
    }
  };

  const categories = ['Recon', 'Scanner', 'Exploitation', 'Post-Exploitation'] as const;
  const missingCount = configs.filter(t => t.installationStatus === 'Not Installed').length;
  const installingCount = configs.filter(t => t.installationStatus === 'Installing...').length;
  const isInstalling = installingCount > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Tools Workspace</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-xl">
            Configure the AI's tactical arsenal. Enable specialized agents and fine-tune their execution parameters for the current environment.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {(missingCount > 0 || isInstalling) && (
            <button 
              onClick={onInstallMissing}
              disabled={isInstalling}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border ${
                isInstalling 
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-indigo-500/20'
              }`}
            >
              <i className={`fas ${isInstalling ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
              <span>{isInstalling ? `INSTALLING ${installingCount} AGENTS...` : `REPAIR ALL (${missingCount})`}</span>
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
          <button 
            onClick={handleImportClick}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#1c2128] border border-gray-700 rounded-xl text-[10px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest"
          >
            <i className="fas fa-file-import"></i>
            <span>IMPORT</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#1c2128] border border-gray-700 rounded-xl text-[10px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest"
          >
            <i className="fas fa-file-export"></i>
            <span>BACKUP</span>
          </button>
        </div>
      </div>

      {/* Global Status Banner & Active Provisioning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#16191f] border border-gray-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Fleet Deployment Status</span>
            <span className="text-xs font-bold text-gray-300">
              {configs.filter(t => t.installationStatus === 'Installed').length} / {configs.length} Agents Ready
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800 p-0.5">
            <div 
              className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-in-out" 
              style={{ width: `${(configs.filter(t => t.installationStatus === 'Installed').length / configs.length) * 100}%` }}
            ></div>
          </div>
          <div className="mt-8 flex space-x-12">
            <div className="text-center">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Operational</p>
              <p className="text-2xl font-bold text-green-500">{configs.filter(t => t.installationStatus === 'Installed').length}</p>
            </div>
            <div className="text-center border-l border-gray-800 pl-12">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Deactivated</p>
              <p className="text-2xl font-bold text-red-500">{configs.filter(t => !t.enabled).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#16191f] border border-gray-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-center">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Active Provisioning</h3>
              <i className="fas fa-terminal text-[10px] text-indigo-500"></i>
           </div>
           <div className="space-y-4">
              {isInstalling ? (
                 configs.filter(t => t.installationStatus === 'Installing...').map(t => (
                    <div key={t.id} className="flex items-center justify-between animate-in slide-in-from-left-2 duration-300">
                       <div className="flex items-center space-x-3">
                          <i className={`fas ${getToolIcon(t.id)} text-[10px] text-indigo-400`}></i>
                          <span className="text-[10px] font-mono text-gray-300">{t.name}</span>
                       </div>
                       <div className="flex items-center space-x-2">
                          <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Downloading...</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>
                       </div>
                    </div>
                 ))
              ) : (
                 <div className="py-4 text-center">
                    <p className="text-[10px] text-gray-600 italic">No active installations. Fleet is synchronized.</p>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* API Integrations */}
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
             <i className="fas fa-key text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">External Intelligence APIs</h3>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">OSINT and Cloud service connectors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="bg-[#16191f] border border-gray-800 rounded-2xl p-6 shadow-xl hover:border-indigo-500/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{apiKey.service}</span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                  apiKey.status === 'Valid' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                  apiKey.status === 'Unset' ? 'text-gray-500 bg-gray-500/10 border-gray-500/20' :
                  'text-orange-400 bg-orange-500/10 border-orange-500/20'
                }`}>
                  {apiKey.status}
                </span>
              </div>
              <div className="relative">
                <input 
                  type={visibleKeys.has(apiKey.id) ? "text" : "password"}
                  placeholder={`${apiKey.service} API Key...`}
                  value={apiKey.key}
                  onChange={(e) => onUpdateApiKey(apiKey.id, e.target.value)}
                  className="w-full bg-black/40 border border-gray-800 rounded-xl pl-3 pr-10 py-2.5 text-[11px] text-gray-400 mono focus:border-indigo-500 outline-none transition-all"
                />
                <button 
                  onClick={() => toggleKeyVisibility(apiKey.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-indigo-400 transition-colors"
                >
                  <i className={`fas ${visibleKeys.has(apiKey.id) ? 'fa-eye-slash' : 'fa-eye'} text-[10px]`}></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-800/50"></div>

      {categories.map((category) => {
        const categoryTools = configs.filter(t => t.category === category);
        const allEnabled = categoryTools.every(t => t.enabled);
        const anyEnabled = categoryTools.some(t => t.enabled);

        return (
          <div key={category} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#1c2128]/50 p-6 rounded-3xl border border-gray-800 shadow-sm gap-4">
              <div className="flex items-center space-x-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${getCategoryColor(category)} shadow-lg`}>
                  <i className={`fas ${
                    category === 'Recon' ? 'fa-satellite' : 
                    category === 'Scanner' ? 'fa-crosshairs' : 
                    category === 'Exploitation' ? 'fa-biohazard' : 'fa-vault'
                  } text-lg`}></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-[0.2em]">{category} Core</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{categoryTools.length} Tactical Agents Configured</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onUpdateCategory(category, true)}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${
                    allEnabled 
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 cursor-default' 
                      : 'bg-[#0f1115] border-gray-700 text-gray-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500'
                  }`}
                >
                  {allEnabled ? 'Phase Fully Active' : `Activate ${category}`}
                </button>
                <button
                  onClick={() => onUpdateCategory(category, false)}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${
                    !anyEnabled 
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 cursor-default' 
                      : 'bg-[#0f1115] border-gray-700 text-gray-400 hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/50'
                  }`}
                >
                  {!anyEnabled ? 'Phase Dormant' : `Deactivate ${category}`}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryTools.map((tool) => (
                <div 
                  key={tool.id} 
                  className={`bg-[#16191f] border rounded-3xl p-6 shadow-xl transition-all duration-500 flex flex-col group relative overflow-hidden ${
                    tool.enabled ? 'border-gray-700 scale-[1.01]' : 'border-gray-800/30 opacity-60'
                  }`}
                >
                  {tool.enabled && tool.installationStatus === 'Installed' && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  )}
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                        tool.enabled ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 shadow-inner' : 'bg-gray-800 border-gray-700 text-gray-600'
                      }`}>
                        <i className={`fas ${getToolIcon(tool.id)} text-lg`}></i>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">{tool.name}</h4>
                          {tool.noiseLevel && (
                             <div className={`w-2 h-2 rounded-full ${getNoiseColor(tool.noiseLevel)}`} title={`Acoustics: ${tool.noiseLevel}`}></div>
                          )}
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border mt-2 inline-block ${getStatusStyle(tool.installationStatus)}`}>
                          {tool.installationStatus}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleTool(tool)}
                      disabled={tool.installationStatus !== 'Installed'}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all ${
                        tool.enabled ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'bg-gray-800'
                      } ${tool.installationStatus !== 'Installed' ? 'opacity-20 cursor-not-allowed' : ''}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tool.enabled ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex-1 space-y-6">
                    <p className="text-xs text-gray-500 leading-relaxed font-medium italic">{tool.description}</p>
                    
                    {tool.usageExample && (
                       <div className="p-4 bg-black/50 border border-gray-800 rounded-2xl shadow-inner group-hover:border-indigo-500/20 transition-all">
                          <div className="flex items-center justify-between mb-3">
                             <span className="text-[9px] font-black text-indigo-500/80 uppercase tracking-widest">CLI Snapshot</span>
                             <i className="fas fa-terminal text-[8px] text-gray-700"></i>
                          </div>
                          <code className="text-[11px] text-gray-400 mono break-all leading-relaxed">
                             {tool.usageExample}
                          </code>
                       </div>
                    )}

                    <div className="space-y-4">
                       <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] block px-1">Engine Parameters</span>
                       {tool.parameters.map((param, idx) => (
                        <div key={param.key} className="space-y-1.5">
                          <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-mono text-indigo-400 font-bold">{param.key}</label>
                            <span className="text-[8px] text-gray-700 uppercase font-black">{param.description.split(' ')[0]}</span>
                          </div>
                          <input 
                            type="text" 
                            value={param.value}
                            disabled={!tool.enabled || tool.installationStatus !== 'Installed'}
                            onChange={(e) => updateParam(tool, idx, e.target.value)}
                            className="w-full bg-black/30 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-400 mono outline-none focus:border-indigo-500 transition-all disabled:opacity-20"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              <div 
                onClick={() => setOnboardingCategory(category)}
                className="bg-[#16191f] border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center p-10 text-center hover:border-indigo-500/50 transition-all group cursor-pointer group shadow-xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:scale-110 transition-all shadow-lg">
                  <i className="fas fa-plus text-gray-500 group-hover:text-white text-xl"></i>
                </div>
                <p className="text-xs font-black text-gray-500 group-hover:text-indigo-400 uppercase tracking-[0.2em]">Deploy {category} Agent</p>
                <p className="text-[10px] text-gray-700 mt-2 max-w-[150px]">Custom containerized tool integration</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Onboarding Guidance Modal */}
      {onboardingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#16191f] border border-gray-700 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#1c2128] px-10 py-8 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-xl ${getCategoryColor(onboardingCategory)}`}>
                  <i className="fas fa-plus text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Expand {onboardingCategory} Arsenal</h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Architectural Integration Protocol</p>
                </div>
              </div>
              <button onClick={() => setOnboardingCategory(null)} className="text-gray-500 hover:text-white transition-colors p-3 bg-black/20 rounded-xl">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-10 space-y-10 overflow-y-auto max-h-[70vh] scrollbar-none">
              <section className="space-y-6">
                <div className="flex items-center space-x-4">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg">01</span>
                  <h4 className="text-base font-bold text-white uppercase tracking-wider">Payload Normalization</h4>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed pl-12">
                  To integrate a custom tool, ensure it outputs findings in **Aegis Standard JSON**. The orchestrator monitors the agent's stdout and automatically synchronizes discoveries with the global knowledge base.
                </p>
                <div className="ml-12 p-6 bg-black/60 border border-gray-800 rounded-2xl shadow-inner">
                  <div className="flex justify-between mb-4">
                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Protocol Blueprint</span>
                    <i className="fas fa-code text-indigo-500 opacity-40"></i>
                  </div>
                  <pre className="text-xs text-indigo-300 mono whitespace-pre-wrap leading-relaxed">
{`{
  "event": "finding_discovery",
  "tool_id": "custom-agent-v1",
  "payload": {
    "title": "Detected Insecure Service",
    "severity": "High",
    "target": "10.0.0.5:8080"
  }
}`}
                  </pre>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center space-x-4">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg">02</span>
                  <h4 className="text-base font-bold text-white uppercase tracking-wider">Sandbox Containerization</h4>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed pl-12">
                  All tools run within hardened **gVisor** runtime sandboxes. Update the local registry with your custom Dockerfile to make the agent available for mission deployment.
                </p>
                <div className="ml-12 p-6 bg-black/60 border border-gray-800 rounded-2xl shadow-inner border-l-4 border-l-green-500">
                  <pre className="text-xs text-green-400 mono whitespace-pre-wrap leading-relaxed">
{`# Example Aegis Agent Dockerfile
FROM aegis-base:latest
RUN apk add --update custom-tool-bin
ENTRYPOINT ["/usr/bin/custom-tool"]`}
                  </pre>
                </div>
              </section>
            </div>

            <div className="px-10 py-8 bg-[#0f1115] border-t border-gray-800 flex justify-between items-center">
              <span className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em]">Aegis Pro-Suite Integration Interface</span>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setOnboardingCategory(null)}
                  className="px-8 py-3 bg-gray-900 text-gray-400 rounded-2xl text-[10px] font-black hover:text-white transition-all border border-gray-800 uppercase tracking-widest"
                >
                  ABORT
                </button>
                <button 
                  className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest"
                >
                  INITIALIZE BOILERPLATE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolConfigManager;
