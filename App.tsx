import React, { useState, useEffect } from 'react';
import { AgentStatus, Finding, Engagement, AgentLog, EngagementType, ToolConfig, ApiKeyConfig, AuthConfig, AgentTuningConfig } from './types';
import Dashboard from './components/Dashboard';
import ScopeManager from './components/ScopeManager';
import AgentTerminal from './components/AgentTerminal';
import FindingsTable from './components/FindingsTable';
import Sidebar from './components/Sidebar';
import LLMStatus from './components/LLMStatus';
import ToolConfigManager from './components/ToolConfigManager';
import EcosystemCatalog from './components/EcosystemCatalog';
import SystemMonitor from './components/SystemMonitor';
import InfraScalingManager from './components/InfraScalingManager';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scope' | 'tools' | 'agents' | 'findings' | 'docs' | 'llm-status' | 'ecosystem' | 'system-health' | 'infrastructure'>('dashboard');
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([
    { id: 'shodan-01', service: 'Shodan', key: 'SHODAN_KEY_••••••••', status: 'Valid', lastUsed: '12m ago' },
    { id: 'virustotal-01', service: 'VirusTotal', key: '', status: 'Unset' },
    { id: 'censys-01', service: 'Censys', key: 'CENSYS_ID_••••••••', status: 'Valid', lastUsed: '2h ago' },
  ]);

  const [toolConfigs, setToolConfigs] = useState<ToolConfig[]>([
    {
      id: 'cai',
      name: 'CAI (Cloud AI Inspector)',
      category: 'Recon',
      enabled: true,
      description: 'Cloud Asset Inventory and AI-driven posture auditor. Use Case: Auditing multi-cloud tenants for IAM leaks, unencrypted storage, and shadow IT discovery. Risk: Excessive API calls may trigger billing alerts, service-level throttling, or security team notifications. Recommended Environment: Corporate AWS, Azure, and GCP environments during the initial discovery and footprinting phase.',
      usageExample: 'cai audit --provider aws --region us-east-1',
      noiseLevel: 'Low',
      installationStatus: 'Installed',
      parameters: [{ key: '--depth', value: 'thorough', description: 'Search depth' }]
    },
    {
      id: 'nmap',
      name: 'Nmap',
      category: 'Recon',
      enabled: true,
      description: 'The industry-standard network exploration and service auditing tool. Use Case: Port scanning, service version detection, and OS fingerprinting to map network architecture. Risk: Aggressive timing templates (-T4 or -T5) can crash legacy embedded devices, trigger IDS/IPS blocks, or cause network congestion. Recommended Environment: Highly versatile; suitable for both internal corporate networks and external-facing perimeters.',
      usageExample: 'nmap -sV -O -T4 <target>',
      noiseLevel: 'Medium',
      installationStatus: 'Installed',
      parameters: [{ key: '-sV', value: 'true', description: 'Service Version Detection' }]
    },
    {
      id: 'nuclei',
      name: 'Nuclei',
      category: 'Scanner',
      enabled: true,
      description: 'Fast, template-based vulnerability scanner specializing in complex CVE detection. Use Case: Rapidly scanning large-scale perimeters for specific known exposures. Risk: Template execution can result in high traffic volume, potentially leading to IP blacklisting. Recommended Environment: Large cloud perimeters and distributed web application architectures.',
      usageExample: 'nuclei -u <target> -t cves/',
      noiseLevel: 'Medium',
      installationStatus: 'Installed',
      parameters: [{ key: '-severity', value: 'critical,high', description: 'Filter severity' }]
    },
    {
      id: 'zap',
      name: 'OWASP ZAP',
      category: 'Scanner',
      enabled: true,
      description: 'The most widely used open-source DAST tool for web application security. Use Case: Deep crawling and automated fuzzing of web application forms and APIs. Risk: Automated crawlers may inadvertently interact with state-changing functions (e.g., delete/submit). Recommended Environment: Development or staging environments before production deployments.',
      usageExample: 'zap-baseline.py -t <target>',
      noiseLevel: 'High',
      installationStatus: 'Installed',
      parameters: [{ key: '--mode', value: 'attack', description: 'Scanning mode' }]
    },
    {
      id: 'sqlmap',
      name: 'SQLmap',
      category: 'Exploitation',
      enabled: false,
      description: 'Advanced automated SQL injection discovery and exploitation tool. Use Case: Validating and exploiting injection flaws to demonstrate database takeover. Risk: Heavy payload volume can lead to database performance degradation or data corruption. Recommended Environment: Isolated database testing instances with pre-configured recovery points.',
      usageExample: 'sqlmap -u <target> --batch',
      noiseLevel: 'High',
      installationStatus: 'Installed',
      parameters: [{ key: '--level', value: '3', description: 'Detection level' }]
    },
    {
      id: 'metasploit',
      name: 'Metasploit',
      category: 'Exploitation',
      enabled: false,
      description: 'Premier penetration testing framework for exploit verification and payload delivery. Use Case: Testing known vulnerabilities with public exploits to verify remediation success. Risk: Exploitation attempts can cause system crashes or kernel panics on unpatched systems. Recommended Environment: Verified test environments and segments where system downtime is permissible.',
      usageExample: 'msfconsole -q -x "use exploit/..."',
      noiseLevel: 'High',
      installationStatus: 'Installed',
      parameters: [{ key: 'PAYLOAD', value: 'reverse_tcp', description: 'Lhost payload' }]
    },
    {
      id: 'strix',
      name: 'Strix',
      category: 'Post-Exploitation',
      enabled: false,
      description: 'Specialized Breach and Attack Simulation (BAS) agent for lateral movement. Use Case: Simulating threat actor behavior to test detection and response (EDR/SOC) capabilities. Risk: High probability of triggering high-severity SOC alerts; risk of leaving persistent artifacts. Recommended Environment: Live production networks with pre-notified SOC/Blue Teams for detection testing.',
      usageExample: 'strix simulate --vector smb-relay',
      noiseLevel: 'High',
      installationStatus: 'Not Installed',
      parameters: [{ key: '--domain', value: 'CORP.LOCAL', description: 'AD Domain' }]
    }
  ]);

  useEffect(() => {
    if (!engagement) return;
    let timer: any;
    if (engagement.status === AgentStatus.RECON) {
      timer = setTimeout(() => {
        const newLogs: AgentLog[] = [
          {
            id: `r-obs-${Date.now()}`,
            type: 'OBSERVE',
            agentName: 'CAI / Recon Specialist',
            message: `Target endpoint ${engagement.targets[0]} identified. Running initial fingerprinting.`,
            timestamp: new Date().toLocaleTimeString()
          },
          {
            id: `r-thk-${Date.now()}`,
            type: 'THINK',
            agentName: 'Orchestrator',
            message: `Recon shows Port 443 active. Chain of thought: Scan for web vulnerabilities via Nuclei and ZAP.`,
            timestamp: new Date().toLocaleTimeString()
          }
        ];
        setLogs(prev => [...newLogs.reverse(), ...prev]);
        setEngagement(prev => prev ? { ...prev, progress: 25, status: AgentStatus.SCAN, activeVector: 'Web Asset Audit' } : null);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [engagement?.status]);

  const startPentest = (scope: string[], type: EngagementType, excluded: string[], auth: AuthConfig, tuning: AgentTuningConfig) => {
    const newEngagement: Engagement = {
      id: `ENG-${Date.now().toString().slice(-4)}`,
      name: `${type} Blueprint Audit`,
      status: AgentStatus.RECON,
      type: type,
      progress: 5,
      targets: scope,
      excludedAssets: excluded,
      activeVector: 'Target Initialization',
      findingsCount: 0,
      startTime: new Date().toLocaleString(),
      authConfig: auth,
      tuning: tuning
    };
    setEngagement(newEngagement);
    setLogs([{
      id: 'init',
      type: 'SYSTEM',
      agentName: 'Orchestrator',
      message: `[AGENDA 01-04] Full Stack Engaged. Reasoning via Ollama Mistral-Small. Target: ${scope[0]}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
    setActiveTab('agents');
  };

  const terminateEngagement = () => {
    if (!engagement) return;
    if (window.confirm("CRITICAL: Terminate all active agents and kill testing processes immediately?")) {
      setEngagement(null);
      setLogs([{
        id: `sys-term-${Date.now()}`,
        type: 'SYSTEM',
        agentName: 'Orchestrator',
        message: `EMERGENCY STOP: SIGKILL sent to all child processes. Fleet disengaged.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setActiveTab('dashboard');
    }
  };

  const handleUpdateExclusions = (newExclusions: string[]) => {
    if (!engagement) return;
    setEngagement({ ...engagement, excludedAssets: newExclusions });
    setLogs([{
      id: `sys-excl-${Date.now()}`,
      type: 'SYSTEM',
      agentName: 'Orchestrator',
      message: `Dynamic Scope Update: Exclusions synchronized. Fleet updated with ${newExclusions.length} forbidden targets.`,
      timestamp: new Date().toLocaleTimeString()
    }, ...logs]);
  };

  const updateToolConfig = (updated: ToolConfig) => {
    setToolConfigs(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const updateToolCategory = (category: string, enabled: boolean) => {
    setToolConfigs(prev => prev.map(t => t.category === category ? { ...t, enabled } : t));
  };

  const updateApiKey = (id: string, newKey: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, key: newKey, status: newKey ? 'Valid' : 'Unset' } : k));
  };

  const installMissingTools = () => {
    const missingTools = toolConfigs.filter(t => t.installationStatus === 'Not Installed');
    if (missingTools.length === 0) return;

    // Set all missing to 'Installing...'
    setToolConfigs(prev => prev.map(t => 
      t.installationStatus === 'Not Installed' ? { ...t, installationStatus: 'Installing...' } : t
    ));

    // Simulate sequential installation for real-time feedback
    missingTools.forEach((tool, index) => {
      setTimeout(() => {
        setToolConfigs(prev => prev.map(t => 
          t.id === tool.id ? { ...t, installationStatus: 'Installed', enabled: true } : t
        ));
      }, (index + 1) * 2500); // 2.5 seconds per tool
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1115]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} engagementActive={!!engagement} onTerminate={terminateEngagement} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#16191f]">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold tracking-tight text-white uppercase">
               {activeTab.replace('-', ' ')}
            </h2>
            {engagement && (
              <div className="flex items-center space-x-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">{engagement.status}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-6">
            {engagement && (
              <button 
                onClick={terminateEngagement}
                className="hidden md:flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 border border-red-400/20"
              >
                <i className="fas fa-stop-circle"></i>
                <span>Stop Engine</span>
              </button>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Stack Architecture</p>
              <p className="text-xs font-bold text-green-500 uppercase">Ollama + DefectDojo Ready</p>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-red-600 flex items-center justify-center text-xs font-black shadow-lg border border-white/10">
              AI
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#0d0f14]">
          {activeTab === 'dashboard' && <Dashboard engagement={engagement} findings={findings} onTerminate={terminateEngagement} />}
          {activeTab === 'scope' && (
            <ScopeManager 
              onStart={startPentest} 
              isActive={!!engagement} 
              currentExclusions={engagement?.excludedAssets}
              onUpdateExclusions={handleUpdateExclusions}
            />
          )}
          {activeTab === 'tools' && (
            <ToolConfigManager 
              configs={toolConfigs} 
              apiKeys={apiKeys}
              onUpdate={updateToolConfig} 
              onUpdateCategory={updateToolCategory}
              onUpdateApiKey={updateApiKey}
              onInstallMissing={installMissingTools}
            />
          )}
          {activeTab === 'agents' && (
            <AgentTerminal 
              logs={logs} 
              engagement={engagement} 
              onClearLogs={() => setLogs([])} 
              onUpdateExclusions={handleUpdateExclusions}
              onTerminate={terminateEngagement}
            />
          )}
          {activeTab === 'findings' && <FindingsTable findings={findings} />}
          {activeTab === 'ecosystem' && <EcosystemCatalog />}
          {activeTab === 'system-health' && <SystemMonitor />}
          {activeTab === 'infrastructure' && <InfraScalingManager />}
          {activeTab === 'llm-status' && <LLMStatus />}
          {activeTab === 'docs' && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-24">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl">
                  <i className="fas fa-server text-white text-xl"></i>
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase">Blueprint Deployment</h1>
                  <p className="text-gray-500 text-sm">One-line automated installation for customer environments.</p>
                </div>
              </div>
              
              <div className="bg-[#16191f] border border-gray-800 rounded-3xl p-10 shadow-2xl space-y-10">
                <section>
                  <h3 className="text-indigo-400 text-sm font-black uppercase tracking-[0.3em] mb-4">One-Line Deployment [Agenda 05]</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    Automates Docker setup, NVIDIA drivers, Pulls the LLM brain (Ollama), and launches the orchestrator.
                  </p>
                  <div className="bg-black/60 p-5 rounded-2xl border border-gray-700 flex items-center justify-between">
                    <code className="text-green-400 text-xs mono">curl -sSL https://aegis.io/install.sh | sudo bash</code>
                    <button className="text-gray-500 hover:text-white"><i className="fas fa-copy"></i></button>
                  </div>
                </section>
                
                <section>
                   <h3 className="text-indigo-400 text-sm font-black uppercase tracking-[0.3em] mb-4">Export Infrastructure [GitHub Handover]</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-black/20 border border-gray-800 rounded-2xl space-y-2">
                        <p className="text-xs font-bold text-gray-200">1. Clone & Config</p>
                        <p className="text-[10px] text-gray-500">Includes all tactical scripts and agent blueprints.</p>
                      </div>
                      <div className="p-6 bg-black/20 border border-gray-800 rounded-2xl space-y-2">
                        <p className="text-xs font-bold text-gray-200">2. GitHub Push</p>
                        <p className="text-[10px] text-gray-500">Ready for enterprise VCS integration.</p>
                      </div>
                   </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Global Floating Panic Button */}
      {engagement && (
        <button 
          onClick={terminateEngagement}
          className="fixed bottom-10 right-10 z-50 group flex items-center space-x-4 bg-red-600 hover:bg-red-700 text-white pl-5 pr-7 py-5 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-all duration-300 transform hover:scale-110 active:scale-95 border-2 border-white/20"
          title="Kill all testing processes immediately"
        >
          <div className="relative">
            <i className="fas fa-skull text-2xl animate-pulse"></i>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </span>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Emergency Kill</span>
            <span className="text-sm font-bold uppercase tracking-widest">Terminate All</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default App;