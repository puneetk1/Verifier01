import React, { useState, useEffect } from 'react';
import { ServiceHealth } from '../types';

const SystemMonitor: React.FC = () => {
  const [services, setServices] = useState<ServiceHealth[]>([
    {
      id: 'ollama',
      name: 'Ollama Intelligence',
      status: 'Healthy',
      cpu: 12,
      ram: 8400,
      gpu: 65,
      uptime: '4d 12h',
      lastCheck: 'Just now',
      endpoint: 'http://localhost:11434/api/tags'
    },
    {
      id: 'orchestrator',
      name: 'Agent Orchestrator',
      status: 'Healthy',
      cpu: 4,
      ram: 1200,
      uptime: '4d 12h',
      lastCheck: '12s ago',
      endpoint: 'http://localhost:8000/health'
    },
    {
      id: 'defectdojo',
      name: 'Vulnerability Hub',
      status: 'Degraded',
      cpu: 28,
      ram: 4200,
      uptime: '1d 0h',
      lastCheck: '1s ago',
      endpoint: 'http://localhost:8080/health'
    },
    {
      id: 'sandbox',
      name: 'Sandbox Manager',
      status: 'Healthy',
      cpu: 1,
      ram: 400,
      uptime: '4d 12h',
      lastCheck: '30s ago',
      endpoint: 'IPC Socket'
    },
    {
      id: 'db',
      name: 'Primary Database',
      status: 'Healthy',
      cpu: 2,
      ram: 2100,
      uptime: '4d 12h',
      lastCheck: '5s ago',
      endpoint: 'tcp://db:5432'
    },
    {
      id: 'redis',
      name: 'In-Memory Cache',
      status: 'Healthy',
      cpu: 0.5,
      ram: 128,
      uptime: '4d 12h',
      lastCheck: '5s ago',
      endpoint: 'tcp://redis:6379'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(s => ({
        ...s,
        cpu: Math.max(0, s.cpu + (Math.random() * 4 - 2)),
        ram: Math.max(0, s.ram + (Math.random() * 20 - 10)),
        gpu: s.gpu !== undefined ? Math.max(0, Math.min(100, s.gpu + (Math.random() * 8 - 4))) : undefined,
        lastCheck: 'Just now'
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshAll = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Degraded': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Failing': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Infrastructure Monitor</h2>
          <p className="text-gray-500 text-sm">Real-time health telemetry from distributed agent nodes and support services.</p>
        </div>
        <button 
          onClick={refreshAll}
          disabled={isRefreshing}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-indigo-500/30 flex items-center space-x-2 ${
            isRefreshing ? 'bg-indigo-600/10 text-indigo-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
          }`}
        >
          <i className={`fas fa-sync-alt ${isRefreshing ? 'animate-spin' : ''}`}></i>
          <span>Check Heartbeats</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-[#16191f] border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all shadow-xl group">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#1c2128]/50">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  service.status === 'Healthy' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
                  service.status === 'Degraded' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 
                  'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <i className={`fas ${
                    service.id === 'db' ? 'fa-database' : 
                    service.id === 'redis' ? 'fa-bolt' : 
                    service.id === 'ollama' ? 'fa-brain' : 
                    service.id === 'orchestrator' ? 'fa-network-wired' : 'fa-server'
                  }`}></i>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{service.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Node ID: {service.id}</p>
                </div>
              </div>
              <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getStatusColor(service.status)}`}>
                {service.status}
              </span>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/40 rounded-xl border border-gray-800">
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-1">CPU Usage</span>
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-bold text-gray-200">{service.cpu.toFixed(1)}%</span>
                    <div className="w-16 h-1 bg-gray-900 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, service.cpu * 5)}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-gray-800">
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-1">RAM Consumption</span>
                  <span className="text-sm font-bold text-gray-200">{(service.ram / 1024).toFixed(1)} GB</span>
                </div>
                {service.gpu !== undefined && (
                  <div className="p-3 bg-black/40 rounded-xl border border-gray-800 col-span-2">
                    <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest block mb-1">GPU Compute / NvEncoder</span>
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-bold text-gray-200">{service.gpu.toFixed(1)}%</span>
                      <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)] transition-all duration-500" style={{ width: `${service.gpu}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-gray-600 uppercase">Health Check Target</span>
                  <span className="font-mono text-gray-400">{service.endpoint}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-gray-600 uppercase">System Uptime</span>
                  <span className="text-gray-400 font-bold">{service.uptime}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-gray-800/50">
                <span className="text-[9px] text-gray-600 italic">Checked: {service.lastCheck}</span>
                <button className="text-[9px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors">
                  View Logs
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Resource Graph (Simulated) */}
      <div className="bg-[#16191f] border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Fleet Resource Telemetry</h3>
            <div className="flex items-center space-x-6">
               <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Aggregated Load</span>
               </div>
               <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Threshold</span>
               </div>
            </div>
         </div>
         <div className="h-32 flex items-end justify-between space-x-1">
            {[...Array(40)].map((_, i) => {
              const height = 20 + Math.random() * 60;
              return (
                <div 
                  key={i} 
                  className="w-full bg-indigo-500/20 rounded-t transition-all duration-500 group relative"
                  style={{ height: `${height}%` }}
                >
                   <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              );
            })}
         </div>
         <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/10 border-t border-dashed border-red-500/30 z-0"></div>
         <div className="mt-6 flex justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest">
            <span>Last 60 Minutes</span>
            <span>Current Throughput: 42.1 MB/s</span>
         </div>
      </div>
    </div>
  );
};

export default SystemMonitor;