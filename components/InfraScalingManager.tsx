import React, { useState } from 'react';
import { FleetInfraConfig, InfraResourceConfig, ClusterNode } from '../types';

const InfraScalingManager: React.FC = () => {
  const [config, setConfig] = useState<FleetInfraConfig>({
    ollama: { cpuCores: 8, ramGb: 16, gpuUnits: 1, storageGb: 100, replicas: 1 },
    orchestrator: { cpuCores: 4, ramGb: 8, gpuUnits: 0, storageGb: 20, replicas: 2 },
    database: { cpuCores: 2, ramGb: 4, gpuUnits: 0, storageGb: 50, replicas: 1 },
    sandboxes: { maxConcurrent: 10, memoryLimitMb: 1024 },
    clusterNodes: [
      { id: 'node-01', hostname: 'aegis-primary', ip: '10.0.0.1', role: 'Manager', status: 'Online', resources: { cpu: 16, ram: 32 } },
      { id: 'node-02', hostname: 'aegis-worker-01', ip: '10.0.0.2', role: 'Worker', status: 'Online', resources: { cpu: 32, ram: 64 } }
    ]
  });

  const [isApplying, setIsApplying] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  const updateResource = (service: keyof FleetInfraConfig, field: keyof InfraResourceConfig, value: number) => {
    setConfig(prev => {
        const target = prev[service];
        if (typeof target !== 'object' || Array.isArray(target)) return prev;
        return {
            ...prev,
            [service]: {
                ...target,
                [field]: value
            }
        };
    });
  };

  const addNode = () => {
    setIsProvisioning(true);
    setTimeout(() => {
      const newNode: ClusterNode = {
        id: `node-${Date.now().toString().slice(-4)}`,
        hostname: `aegis-worker-${(config.clusterNodes.length).toString().padStart(2, '0')}`,
        ip: `10.0.0.${config.clusterNodes.length + 1}`,
        role: 'Worker',
        status: 'Online',
        resources: { cpu: 16, ram: 32 }
      };
      setConfig(prev => ({
        ...prev,
        clusterNodes: [...prev.clusterNodes, newNode]
      }));
      setIsProvisioning(false);
    }, 1500);
  };

  const removeNode = (id: string) => {
    if (config.clusterNodes.length <= 1) {
        alert("Cannot remove the primary manager node.");
        return;
    }
    setConfig(prev => ({
      ...prev,
      clusterNodes: prev.clusterNodes.filter(n => n.id !== id)
    }));
  };

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      alert("Horizontal and Vertical Scaling Parameters Applied. Orchestrator re-shuffling service replicas across the cluster.");
    }, 2000);
  };

  const ResourceCard = ({ title, service, icon, color }: { title: string, service: keyof FleetInfraConfig, icon: string, color: string }) => {
    const srv = config[service] as InfraResourceConfig;
    if (!srv) return null;

    return (
      <div className="bg-[#16191f] border border-gray-800 rounded-3xl p-6 shadow-xl hover:border-indigo-500/30 transition-all space-y-6 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg ${color}`}>
              <i className={`fas ${icon} text-sm`}></i>
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest">{title}</h4>
              <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Capacity Config</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
              REPLICAS: {srv.replicas}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[9px] font-black text-gray-600 uppercase">CPU / Limit</span>
              <span className="text-[10px] font-mono text-white">{srv.cpuCores} vCPU</span>
            </div>
            <input 
              type="range" min="1" max="64" step="1" 
              value={srv.cpuCores} 
              onChange={e => updateResource(service, 'cpuCores', parseInt(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[9px] font-black text-gray-600 uppercase">RAM / Limit</span>
              <span className="text-[10px] font-mono text-white">{srv.ramGb} GB</span>
            </div>
            <input 
              type="range" min="2" max="256" step="2" 
              value={srv.ramGb} 
              onChange={e => updateResource(service, 'ramGb', parseInt(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          <div className="space-y-2 col-span-2 border-t border-gray-800 pt-4">
            <div className="flex justify-between">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Scale (Instances)</span>
              <span className="text-[10px] font-mono text-white">{srv.replicas} Pods</span>
            </div>
            <input 
              type="range" min="1" max="20" step="1" 
              value={srv.replicas} 
              onChange={e => updateResource(service, 'replicas', parseInt(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          {service === 'ollama' && (
            <div className="space-y-2 col-span-2">
              <div className="flex justify-between">
                <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">vGPU Sharding</span>
                <span className="text-[10px] font-mono text-white">{srv.gpuUnits} Units</span>
              </div>
              <input 
                type="range" min="0" max="8" step="1" 
                value={srv.gpuUnits} 
                onChange={e => updateResource(service, 'gpuUnits', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">Fleet Infrastructure Elasticity</h2>
          <p className="text-gray-500 text-sm max-w-2xl">
            Provision additional compute nodes or scale service replicas horizontally. AegisAI handles the distribution logic while maintaining the simplicity of one-click deployment.
          </p>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={addNode}
             disabled={isProvisioning}
             className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center space-x-3 border ${
               isProvisioning ? 'bg-black/40 border-gray-800 text-gray-600' : 'bg-[#1c2128] border-gray-700 text-white hover:border-indigo-500'
             }`}
           >
             <i className={`fas ${isProvisioning ? 'fa-spinner fa-spin' : 'fa-plus'}`}></i>
             <span>{isProvisioning ? 'EXPANDING CLUSTER...' : 'ADD COMPUTE NODE'}</span>
           </button>
           <button 
             onClick={handleApply}
             disabled={isApplying}
             className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center space-x-3 ${
               isApplying ? 'bg-indigo-600/20 text-indigo-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-indigo-600/30'
             }`}
           >
             <i className={`fas ${isApplying ? 'fa-spinner fa-spin' : 'fa-rocket'}`}></i>
             <span>{isApplying ? 'REDEPLOYING...' : 'SYNC CLUSTER STATE'}</span>
           </button>
        </div>
      </div>

      {/* Cluster Node Map */}
      <div className="bg-[#16191f] border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <i className="fas fa-layer-group"></i>
               </div>
               <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Node Inventory</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{config.clusterNodes.length} Active Servers</p>
               </div>
            </div>
            <div className="flex items-center space-x-8">
               <div className="text-center">
                  <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">Total vCPU</span>
                  <span className="text-xl font-bold text-white">{config.clusterNodes.reduce((acc, n) => acc + n.resources.cpu, 0)}</span>
               </div>
               <div className="text-center border-l border-gray-800 pl-8">
                  <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">Total RAM</span>
                  <span className="text-xl font-bold text-white">{config.clusterNodes.reduce((acc, n) => acc + n.resources.ram, 0)} GB</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.clusterNodes.map(node => (
               <div key={node.id} className="bg-black/40 border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/40 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                     <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                        node.status === 'Online' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'
                     }`}>
                        {node.status}
                     </span>
                     <button onClick={() => removeNode(node.id)} className="text-gray-700 hover:text-red-500 transition-colors">
                        <i className="fas fa-times-circle text-xs"></i>
                     </button>
                  </div>
                  <h4 className="text-xs font-bold text-gray-200 mono mb-1">{node.hostname}</h4>
                  <p className="text-[9px] text-gray-600 mono mb-4">{node.ip}</p>
                  
                  <div className="flex items-center justify-between text-[10px] border-t border-gray-800/50 pt-4">
                     <div className="flex items-center space-x-2">
                        <i className="fas fa-microchip text-gray-700"></i>
                        <span className="text-gray-400 font-bold">{node.resources.cpu} Cores</span>
                     </div>
                     <div className="flex items-center space-x-2">
                        <i className="fas fa-memory text-gray-700"></i>
                        <span className="text-gray-400 font-bold">{node.resources.ram} GB</span>
                     </div>
                  </div>
                  
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                     <i className={`fas ${node.role === 'Manager' ? 'fa-crown' : 'fa-server'} text-4xl`}></i>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ResourceCard 
          title="Intelligence Engine" 
          service="ollama" 
          icon="fa-brain" 
          color="bg-orange-500/10 border-orange-500/20 text-orange-400" 
        />
        <ResourceCard 
          title="Tactical Orchestrator" 
          service="orchestrator" 
          icon="fa-network-wired" 
          color="bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
        />
        <ResourceCard 
          title="Persistence Stack" 
          service="database" 
          icon="fa-database" 
          color="bg-purple-500/10 border-purple-500/20 text-purple-400" 
        />
      </div>

      {/* Advanced Provisioning Overlay */}
      <div className="bg-[#16191f] border border-gray-800 rounded-3xl p-8 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <i className="fas fa-microchip text-xs"></i>
             </div>
             <h3 className="text-xs font-black text-white uppercase tracking-widest">Global Sandbox Limits</h3>
          </div>
          <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[9px] font-black text-gray-600 uppercase">Max Concurrent Fleet Containers</span>
                  <span className="text-[10px] font-mono text-green-400">{config.sandboxes.maxConcurrent} Ephemeral</span>
                </div>
                <input 
                  type="range" min="1" max="200" step="1" 
                  value={config.sandboxes.maxConcurrent} 
                  onChange={e => setConfig(prev => ({ ...prev, sandboxes: { ...prev.sandboxes, maxConcurrent: parseInt(e.target.value) }}))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
             </div>
             <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[9px] font-black text-gray-600 uppercase">Per-Agent Resource Isolation</span>
                  <span className="text-[10px] font-mono text-green-400">{config.sandboxes.memoryLimitMb} MB</span>
                </div>
                <input 
                  type="range" min="128" max="8192" step="128" 
                  value={config.sandboxes.memoryLimitMb} 
                  onChange={e => setConfig(prev => ({ ...prev, sandboxes: { ...prev.sandboxes, memoryLimitMb: parseInt(e.target.value) }}))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
             </div>
          </div>
          <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl flex items-center space-x-4">
             <i className="fas fa-info-circle text-indigo-500 opacity-50"></i>
             <p className="text-[10px] text-gray-500 italic">
               Cluster management utilizes **Docker Swarm** or **K3s** logic to maintain high availability across all registered compute nodes.
             </p>
          </div>
        </div>

        <div className="bg-black/40 border border-gray-800 rounded-2xl p-6 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">One-Click Scaling Manifest</h3>
            <span className="text-[8px] font-black text-green-500 uppercase">COMPOSE OVERLAY READY</span>
          </div>
          <div className="flex-1 bg-black/60 rounded-xl p-4 border border-gray-700 font-mono text-[10px] text-gray-400 overflow-y-auto max-h-64 scrollbar-none">
            <pre className="whitespace-pre-wrap leading-relaxed">
{`version: '3.8'

services:
  ollama:
    deploy:
      replicas: ${config.ollama.replicas}
      resources:
        limits:
          cpus: '${config.ollama.cpuCores}'
          memory: ${config.ollama.ramGb}G
        reservations:
          devices:
            - driver: nvidia
              count: ${config.ollama.gpuUnits}

  orchestrator:
    deploy:
      replicas: ${config.orchestrator.replicas}
      resources:
        limits:
          cpus: '${config.orchestrator.cpuCores}'
          memory: ${config.orchestrator.ramGb}G

  db:
    deploy:
      replicas: ${config.database.replicas}
    volumes:
      - type: volume
        target: /var/lib/postgresql/data
        size: ${config.database.storageGb}G

# Cluster Node Registration (Internal Registry)
# Nodes: ${config.clusterNodes.length}
# Manager: ${config.clusterNodes.find(n => n.role === 'Manager')?.hostname} (${config.clusterNodes.find(n => n.role === 'Manager')?.ip})`}
            </pre>
          </div>
          <div className="mt-4 flex items-center justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest">
             <span>deployment/manifest.yaml</span>
             <button className="text-indigo-400 hover:text-white transition-colors">
                <i className="fas fa-copy"></i>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfraScalingManager;