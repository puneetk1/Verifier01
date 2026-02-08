
import React, { useState } from 'react';

interface Model {
  name: string;
  size: string;
  status: 'Loaded' | 'Available' | 'Pulling...';
  vram: string;
  updatedAt: string;
  progress?: number;
  // Metadata for details
  architecture: string;
  parameters: string;
  capabilities: string[];
  contextWindow: string;
}

const LLMStatus: React.FC = () => {
  const [models, setModels] = useState<Model[]>([
    { 
      name: 'mistral-small3.1', 
      size: '2.4 GB', 
      status: 'Loaded', 
      vram: '100%', 
      updatedAt: '2 mins ago',
      architecture: 'Transformer (Dense)',
      parameters: '7B',
      capabilities: ['Text Generation', 'Code Completion', 'Tool Calling'],
      contextWindow: '32k'
    },
    { 
      name: 'deepseek-r1', 
      size: '4.8 GB', 
      status: 'Available', 
      vram: '0%', 
      updatedAt: '1 day ago',
      architecture: 'Mixture of Experts (MoE)',
      parameters: '32B (8B Active)',
      capabilities: ['Chain-of-Thought Reasoning', 'Advanced Math', 'Logic Synthesis'],
      contextWindow: '128k'
    },
    { 
      name: 'llama3.1-8b', 
      size: '4.7 GB', 
      status: 'Loaded', 
      vram: '65%', 
      updatedAt: '1 hour ago',
      architecture: 'Llama Transformer',
      parameters: '8B',
      capabilities: ['Multilingual', 'Summarization', 'Zero-shot Prompting'],
      contextWindow: '128k'
    },
  ]);

  const [showPullInput, setShowPullInput] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [pullProgress, setPullProgress] = useState<number | null>(null);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const metrics = [
    { label: 'VRAM Utilization', value: '8.4 / 12 GB', percent: 70, color: 'bg-indigo-500' },
    { label: 'System RAM', value: '16.2 / 32 GB', percent: 50, color: 'bg-blue-500' },
    { label: 'Inference Latency', value: '45ms / token', percent: 25, color: 'bg-green-500' },
    { label: 'Active Context', value: '32k / 128k', percent: 25, color: 'bg-purple-500' },
  ];

  const handlePullModel = () => {
    const modelName = newModelName.trim().toLowerCase();
    if (!modelName) return;
    
    setPullProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
        const newModel: Model = {
          name: modelName,
          size: '4.2 GB',
          status: 'Available',
          vram: '0%',
          updatedAt: 'Just now',
          architecture: 'Unknown Transformer',
          parameters: 'N/A',
          capabilities: ['General Reasoning'],
          contextWindow: '8k'
        };
        setModels(prev => [...prev, newModel]);
        setPullProgress(null);
        setNewModelName('');
        setShowPullInput(false);
      } else {
        setPullProgress(progress);
      }
    }, 200);
  };

  const handleDeleteModel = (e: React.MouseEvent, modelName: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${modelName}?`)) {
      setModels(prev => prev.filter(m => m.name !== modelName));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ollama Intelligence Hub</h2>
          <p className="text-gray-500 text-sm">Real-time status of the local reasoning engine and model repository.</p>
        </div>
        <div className="flex items-center space-x-3">
           <button 
             onClick={() => setShowPullInput(!showPullInput)}
             className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
               showPullInput ? 'bg-red-500/10 text-red-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
             }`}
           >
             <i className={`fas ${showPullInput ? 'fa-times' : 'fa-download'} mr-2`}></i> 
             {showPullInput ? 'CANCEL PULL' : 'PULL NEW MODEL'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <div key={i} className="bg-[#16191f] p-6 rounded-2xl border border-gray-800">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">{metric.label}</p>
            <p className="text-xl font-bold text-white mb-4">{metric.value}</p>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`${metric.color} h-full rounded-full transition-all duration-1000`} 
                style={{ width: `${metric.percent}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#16191f] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#1c2128]">
          <h3 className="text-sm font-bold text-gray-200">Model Repository</h3>
          <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20 font-bold uppercase tracking-widest">
            Service Online
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Context Window</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Size</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">VRAM</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {models.map((model, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-gray-800/30 transition-colors group cursor-pointer"
                  onClick={() => setSelectedModel(model)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                       <i className="fas fa-microchip text-indigo-500 text-xs"></i>
                       <span className="text-sm font-semibold text-gray-200 mono group-hover:text-indigo-400">
                         {model.name}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-purple-400 mono bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                      {model.contextWindow}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs text-gray-400">{model.size}</td>
                  <td className="px-6 py-5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      model.status === 'Loaded' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700'
                    }`}>
                      {model.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2">
                       <span className="text-xs text-gray-300 mono">{model.vram}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2">
                       <button onClick={(e) => handleDeleteModel(e, model.name)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-all">
                         <i className="fas fa-trash-alt text-[10px]"></i>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-[#16191f] border border-gray-700 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1c2128] px-8 py-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                  <i className="fas fa-microchip text-indigo-500 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mono">{selectedModel.name}</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model Specification</p>
                </div>
              </div>
              <button onClick={() => setSelectedModel(null)} className="text-gray-500 hover:text-white transition-colors p-2">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Architecture</label>
                  <p className="text-sm font-semibold text-gray-200">{selectedModel.architecture}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Parameters</label>
                  <p className="text-sm font-semibold text-gray-200">{selectedModel.parameters}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Context Window</label>
                  <p className="text-sm font-semibold text-purple-400 mono bg-purple-500/10 px-2 py-0.5 rounded inline-block">{selectedModel.contextWindow}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Size on Disk</label>
                  <p className="text-sm font-semibold text-gray-200">{selectedModel.size}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Inference Capabilities</label>
                <div className="flex flex-wrap gap-2">
                  {selectedModel.capabilities.map((cap, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-[#0f1115] border-t border-gray-800 flex justify-end">
              <button onClick={() => setSelectedModel(null)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                CLOSE DETAILS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMStatus;
