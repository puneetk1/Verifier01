
import React, { useState, useEffect, useMemo } from 'react';

interface EcosystemTool {
  name: string;
  framework: string;
  category: string;
  tags: string[];
  icon: string;
  description: string;
  integrationStatus: 'Native' | 'Available' | 'Enterprise' | 'External';
  link: string;
}

interface ThreatAlert {
  id: string;
  cve: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
  unixTime: number;
  affectedVersions: string;
  exploitStatus: 'PoC Available' | 'Weaponized' | 'No Known Exploit' | 'Under Investigation';
  advisoryLink: string;
}

const EcosystemCatalog: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Web' | 'Net' | 'Audit'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [lastSync, setLastSync] = useState<string>('Never');

  // Threat Feed States
  const [feedSeverityFilter, setFeedSeverityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium'>('All');
  const [feedSortBy, setFeedSortBy] = useState<'time' | 'severity'>('time');

  const tools: EcosystemTool[] = [
    {
      name: 'OWASP ZAP',
      framework: 'OWASP',
      category: 'Web Application',
      tags: ['Web'],
      icon: 'fa-shield-halved',
      description: 'The world’s most widely used web application scanner. Free and open source.',
      integrationStatus: 'Native',
      link: 'https://www.zaproxy.org/'
    },
    {
      name: 'Metasploit Framework',
      framework: 'Rapid7',
      category: 'Exploitation',
      icon: 'fa-skull-crossbones',
      tags: ['Net'],
      description: 'The premier open-source penetration testing framework used for exploit development and delivery.',
      integrationStatus: 'Native',
      link: 'https://www.metasploit.com/'
    },
    {
      name: 'Nuclei',
      framework: 'Project Discovery',
      category: 'Scanner',
      icon: 'fa-bolt',
      tags: ['Web', 'Net'],
      description: 'Fast and customizable vulnerability scanner based on simple YAML templates.',
      integrationStatus: 'Native',
      link: 'https://projectdiscovery.io/'
    },
    {
      name: 'Burp Suite',
      framework: 'PortSwigger',
      category: 'Web Application',
      icon: 'fa-spider',
      tags: ['Web'],
      description: 'Industry standard for web application security testing. Enterprise features available via API.',
      integrationStatus: 'Enterprise',
      link: 'https://portswigger.net/burp'
    },
    {
      name: 'OWASP Amass',
      framework: 'OWASP',
      category: 'Reconnaissance',
      icon: 'fa-circle-nodes',
      tags: ['Net'],
      description: 'In-depth attack surface mapping and external asset discovery.',
      integrationStatus: 'Native',
      link: 'https://github.com/owasp-amass/amass'
    },
    {
      name: 'DefectDojo',
      framework: 'OWASP',
      category: 'Vulnerability Management',
      icon: 'fa-bug',
      tags: ['Audit'],
      description: 'An open-source vulnerability management tool that streamlines the testing process.',
      integrationStatus: 'Native',
      link: 'https://www.defectdojo.org/'
    },
    {
      name: 'BloodHound',
      framework: 'Active Directory',
      category: 'Infrastructure',
      icon: 'fa-diagram-project',
      tags: ['Net', 'Audit'],
      description: 'A tool used to reveal the hidden relationships within an Active Directory environment.',
      integrationStatus: 'Available',
      link: 'https://github.com/BloodHoundAD/BloodHound'
    },
    {
      name: 'BeEF',
      framework: 'Browser Exploitation',
      category: 'Exploitation',
      icon: 'fa-ghost',
      tags: ['Web'],
      description: 'The Browser Exploitation Framework focusing on the web browser client side.',
      integrationStatus: 'Available',
      link: 'https://beefproject.com/'
    },
    {
      name: 'CIS Benchmarks',
      framework: 'Compliance',
      category: 'Audit',
      icon: 'fa-check-double',
      tags: ['Audit'],
      description: 'Consensus-based best practices for securely configuring IT systems.',
      integrationStatus: 'External',
      link: 'https://www.cisecurity.org/benchmark'
    },
    {
      name: 'NIST Framework',
      framework: 'Compliance',
      category: 'Policy',
      icon: 'fa-file-shield',
      tags: ['Audit'],
      description: 'Guidelines for assessing and improving ability to prevent and respond to cyber attacks.',
      integrationStatus: 'External',
      link: 'https://www.nist.gov/cyberframework'
    }
  ];

  const initialAlerts: ThreatAlert[] = [
    { 
      id: '1', 
      cve: 'CVE-2024-4533', 
      title: 'Remote Code Execution in Nginx', 
      severity: 'Critical', 
      timestamp: '2m ago',
      unixTime: Date.now() - 120000,
      affectedVersions: 'v1.18.0 - v1.25.3',
      exploitStatus: 'Weaponized',
      advisoryLink: 'https://nginx.org/en/security_advisories.html'
    },
    { 
      id: '2', 
      cve: 'CVE-2024-2111', 
      title: 'SQL Injection in Laravel Framework', 
      severity: 'High', 
      timestamp: '15m ago',
      unixTime: Date.now() - 900000,
      affectedVersions: 'v10.0.0 - v10.32.1',
      exploitStatus: 'PoC Available',
      advisoryLink: 'https://laravel.com/docs/security'
    },
    { 
      id: '4', 
      cve: 'CVE-2024-3321', 
      title: 'Privilege Escalation in Ubuntu Kernel', 
      severity: 'High', 
      timestamp: '4h ago',
      unixTime: Date.now() - 14400000,
      affectedVersions: 'Kernel 5.15 - 6.2',
      exploitStatus: 'PoC Available',
      advisoryLink: 'https://ubuntu.com/security/notices'
    },
    { 
      id: '3', 
      cve: 'CVE-2024-1002', 
      title: 'Auth Bypass in WordPress Plugin', 
      severity: 'Medium', 
      timestamp: '1h ago',
      unixTime: Date.now() - 3600000,
      affectedVersions: 'All versions < 4.5.2',
      exploitStatus: 'No Known Exploit',
      advisoryLink: 'https://wordpress.org/news/'
    }
  ];

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesFilter = activeFilter === 'All' || tool.tags.includes(activeFilter);
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const sortedAndFilteredAlerts = useMemo(() => {
    let filtered = initialAlerts.filter(alert => {
      if (feedSeverityFilter === 'All') return true;
      return alert.severity === feedSeverityFilter;
    });

    return filtered.sort((a, b) => {
      if (feedSortBy === 'time') {
        return b.unixTime - a.unixTime;
      } else {
        const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
      }
    });
  }, [feedSeverityFilter, feedSortBy]);

  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncLogs(['[INIT] Connecting to global threat intelligence nodes...']);
    
    const steps = [
      '[AUTH] Handshake successful with MITRE database.',
      '[FETCH] Pulling latest CVE-2024 definitions...',
      '[SCAN] Matching signatures with Exploit-DB PoC payloads...',
      '[INTEL] Cross-referencing CISA Known Exploited Vulnerabilities catalog.',
      '[PARSE] Processing 4,128 new security signatures...',
      '[SUCCESS] Local intelligence database updated.'
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setSyncLogs(prev => [...prev, steps[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsSyncing(false);
        setLastSync(new Date().toLocaleTimeString());
      }
    }, 800);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Native': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Available': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Enterprise': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'External': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-800 text-gray-500';
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500';
    }
  };

  const getExploitStatusColor = (status: string) => {
    switch (status) {
      case 'Weaponized': return 'text-red-400';
      case 'PoC Available': return 'text-orange-400';
      case 'Under Investigation': return 'text-yellow-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-24">
      {/* Header & Search */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex-1 space-y-2">
          <h2 className="text-4xl font-extrabold text-white tracking-tight">Ecosystem Intelligence</h2>
          <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">
            AegisAI bridges the gap between raw toolsets and operational security. Manage integrations 
            with industry frameworks and stay ahead of the curve with real-time threat feeds.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-64">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
            <input 
              type="text" 
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1c2128] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-xs text-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>
          <div className="flex items-center space-x-1 bg-[#1c2128] border border-gray-800 rounded-xl p-1 w-full md:w-auto overflow-x-auto scrollbar-none">
            {['All', 'Web', 'Net', 'Audit'].map((f) => (
              <button 
                key={f} 
                onClick={() => setActiveFilter(f as any)}
                className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Tool Grid */}
        <div className="xl:col-span-3">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, idx) => (
                <div key={idx} className="bg-[#16191f] border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col group shadow-xl">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                        <i className={`fas ${tool.icon} text-xl`}></i>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-1 rounded border uppercase tracking-[0.2em] ${getStatusColor(tool.integrationStatus)}`}>
                        {tool.integrationStatus}
                      </span>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">{tool.framework}</span>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{tool.name}</h3>
                    </div>
                    
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                      {tool.description}
                    </p>
                  </div>
                  
                  <div className="px-6 py-4 bg-[#0f1115] border-t border-gray-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{tool.category}</span>
                    <a 
                      href={tool.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-white transition-colors flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest group/link"
                    >
                      <span>DOCS</span>
                      <i className="fas fa-arrow-up-right-from-square text-[8px] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"></i>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-[#16191f] border-2 border-dashed border-gray-800 rounded-3xl text-center p-12">
              <i className="fas fa-search-minus text-3xl text-gray-700 mb-4"></i>
              <p className="text-gray-400 font-medium">No tools matching your current search parameters.</p>
              <button onClick={() => {setSearchQuery(''); setActiveFilter('All')}} className="mt-4 text-xs font-bold text-indigo-400 hover:text-white underline uppercase">Clear all filters</button>
            </div>
          )}
        </div>

        {/* Sidebar: Threat Intelligence & Live Feed */}
        <div className="space-y-8">
          {/* Enhanced Threat Feed */}
          <div className="bg-[#16191f] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-800 bg-[#1c2128]/50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
                  Vulnerability Stream
                </h3>
                <i className="fas fa-rss text-gray-600 text-xs"></i>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <select 
                  value={feedSeverityFilter}
                  onChange={(e) => setFeedSeverityFilter(e.target.value as any)}
                  className="flex-1 bg-black/40 border border-gray-800 rounded-lg px-2 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
                <select 
                  value={feedSortBy}
                  onChange={(e) => setFeedSortBy(e.target.value as any)}
                  className="flex-1 bg-black/40 border border-gray-800 rounded-lg px-2 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="time">Sort: Time</option>
                  <option value="severity">Sort: Severity</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] p-4 space-y-4 divide-y divide-gray-800/50">
              {sortedAndFilteredAlerts.length > 0 ? (
                sortedAndFilteredAlerts.map(alert => (
                  <div key={alert.id} className="pt-4 first:pt-0 group animate-in slide-in-from-right-2 duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[9px] text-gray-600 font-bold uppercase">{alert.timestamp}</span>
                    </div>
                    
                    <h4 className="text-xs font-bold text-gray-200 group-hover:text-indigo-400 transition-colors mb-1">{alert.title}</h4>
                    
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-indigo-500/80 mb-3">
                      <span>{alert.cve}</span>
                    </div>

                    <div className="bg-black/30 rounded-xl p-3 border border-gray-800 space-y-2 group-hover:bg-black/50 transition-all">
                      <div className="flex items-center justify-between">
                         <span className="text-[8px] text-gray-500 uppercase font-black">Versions</span>
                         <span className="text-[9px] text-gray-300 font-mono truncate ml-2" title={alert.affectedVersions}>{alert.affectedVersions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[8px] text-gray-500 uppercase font-black">Exploit</span>
                         <span className={`text-[9px] font-black uppercase ${getExploitStatusColor(alert.exploitStatus)}`}>
                            {alert.exploitStatus}
                         </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end">
                      <a 
                        href={alert.advisoryLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-[0.2em] flex items-center group/link"
                      >
                        Technical Advisory
                        <i className="fas fa-external-link-alt ml-2 text-[7px] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"></i>
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-[10px] text-gray-600 italic uppercase tracking-widest">No matching alerts found</p>
                </div>
              )}
            </div>
            <button className="w-full py-4 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest bg-[#0f1115] transition-colors border-t border-gray-800">
              Access Full Vulnerability Archive
            </button>
          </div>

          {/* Sync Box */}
          <div className="bg-[#1c2128]/50 border border-indigo-500/10 rounded-3xl p-6 space-y-4">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-sm font-bold text-white">Cloud Intelligence</h3>
                   <p className="text-[10px] text-gray-500">Last Synced: {lastSync}</p>
                </div>
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isSyncing ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                  }`}
                >
                   <i className={`fas fa-sync-alt ${isSyncing ? 'animate-spin' : ''}`}></i>
                </button>
             </div>
             
             {syncLogs.length > 0 && (
                <div className="bg-black/40 rounded-xl p-4 border border-gray-800 h-48 flex flex-col justify-end">
                   <div className="space-y-1 overflow-hidden">
                      {syncLogs.slice(-6).map((log, i) => (
                        <p key={i} className={`text-[9px] font-mono leading-tight ${log.includes('[SUCCESS]') ? 'text-green-400' : log.includes('[FETCH]') ? 'text-blue-400' : 'text-gray-500'}`}>
                          {log}
                        </p>
                      ))}
                      {isSyncing && <div className="w-2 h-4 bg-indigo-500 animate-pulse inline-block ml-1"></div>}
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* External Repositories Visual Section */}
      <div className="bg-gradient-to-br from-indigo-600/10 via-[#1c2128] to-[#16191f] border border-gray-800 rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">
               Pro-Feature Integration
            </div>
            <h3 className="text-3xl font-extrabold text-white mb-6">Autonomous Threat Harvesting</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-lg">
              AegisAI agents autonomously pull real-time vulnerability data and zero-day payloads from trusted 
              global repositories. Configure secure webhooks to notify your security team when a signature 
              matching your stack is released.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-black/40 rounded-2xl border border-gray-800 hover:border-orange-500/50 transition-all group cursor-default">
                <i className="fas fa-database text-orange-400 group-hover:scale-125 transition-transform"></i>
                <div>
                   <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">Exploit-DB</span>
                   <span className="text-[8px] text-gray-600 uppercase">Synced 14m ago</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-black/40 rounded-2xl border border-gray-800 hover:border-red-500/50 transition-all group cursor-default">
                <i className="fas fa-shield-virus text-red-400 group-hover:scale-125 transition-transform"></i>
                <div>
                   <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">CISA KEV</span>
                   <span className="text-[8px] text-gray-600 uppercase">Auto-updating</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-black/40 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all group cursor-default">
                <i className="fas fa-code-branch text-blue-400 group-hover:scale-125 transition-transform"></i>
                <div>
                   <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">GH Advisories</span>
                   <span className="text-[8px] text-gray-600 uppercase">Push mode enabled</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-black/40 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all group cursor-default">
                <i className="fas fa-bug text-green-400 group-hover:scale-125 transition-transform"></i>
                <div>
                   <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">HackerOne</span>
                   <span className="text-[8px] text-gray-600 uppercase">API Connected</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
             <div className="relative w-full max-w-md aspect-video bg-black/80 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-indigo-600/0 transition-colors"></div>
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                   <div className="flex space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
                   </div>
                   <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Global Intelligence Monitor</span>
                </div>
                <div className="p-6 space-y-4">
                   <div className="flex items-start space-x-3 animate-pulse">
                      <i className="fas fa-satellite-dish text-indigo-500 text-xs mt-1"></i>
                      <div className="space-y-1">
                         <div className="h-1.5 w-48 bg-gray-800 rounded"></div>
                         <div className="h-1.5 w-32 bg-gray-800/50 rounded"></div>
                      </div>
                   </div>
                   <div className="flex items-start space-x-3">
                      <i className="fas fa-shield-halved text-green-500 text-xs mt-1"></i>
                      <div className="space-y-1">
                         <div className="h-1.5 w-40 bg-gray-800 rounded"></div>
                         <div className="h-1.5 w-24 bg-gray-800/50 rounded"></div>
                      </div>
                   </div>
                   <div className="pt-8 flex flex-col items-center">
                      <div className="text-[10px] font-mono text-indigo-400/50 mb-2">SCANNING GLOBAL REPOS...</div>
                      <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500/50 animate-shimmer" style={{ width: '40%', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)' }}></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcosystemCatalog;
