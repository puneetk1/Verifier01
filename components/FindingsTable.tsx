
import React, { useState } from 'react';
import { Finding } from '../types';

interface FindingsTableProps {
  findings: Finding[];
}

const FindingsTable: React.FC<FindingsTableProps> = ({ findings }) => {
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const blueprintFindings: Finding[] = [
    {
      id: 'V-001',
      title: 'Broken Authentication via Session Token Fixation',
      severity: 'High',
      cvss: 8.2,
      epss: 0.15,
      status: 'Verified',
      tool: 'OWASP ZAP',
      target: 'api.target.com',
      timestamp: '2025-05-12 14:22',
      description: 'The application fails to invalidate the existing session ID when a user logs in.',
      remediation: 'Regenerate session ID on successful login.'
    },
    {
      id: 'V-002',
      title: 'Unauthenticated RCE (CVE-2023-XXXX)',
      severity: 'Critical',
      cvss: 9.8,
      epss: 0.89,
      status: 'Open',
      tool: 'Nuclei',
      target: 'legacy.target.com',
      timestamp: '2025-05-12 15:45',
      description: 'Critical vulnerability in OGNL processing logic.',
      remediation: 'Update Apache Struts to latest patched version.'
    }
  ];

  const displayFindings = findings.length > 0 ? findings : blueprintFindings;

  if (selectedFinding) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSelectedFinding(null)}
            className="w-10 h-10 rounded-xl bg-[#1c2128] border border-gray-700 flex items-center justify-center text-gray-400"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white uppercase">{selectedFinding.id}</h2>
            <p className="text-gray-500 text-xs">Vulnerability Management Lifecycle: Assessment Stage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[#16191f] border border-gray-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Discovery Evidence [Agenda 06]</h3>
              <h2 className="text-xl font-bold text-white mb-4">{selectedFinding.title}</h2>
              <div className="bg-black/40 p-5 rounded-2xl border border-gray-800 text-gray-400 text-sm font-mono">
                {selectedFinding.description}
              </div>
            </section>
            
            <section className="bg-[#16191f] border border-gray-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4">Remediation Roadmap</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedFinding.remediation}</p>
            </section>
          </div>

          <div className="space-y-6">
             <div className="bg-[#16191f] border border-gray-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Verification Status</h3>
                <div className={`flex items-center space-x-3 p-4 rounded-2xl border ${
                  selectedFinding.status === 'Verified' ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
                }`}>
                   <i className={`fas ${selectedFinding.status === 'Verified' ? 'fa-check-circle' : 'fa-hourglass-start'} text-lg`}></i>
                   <span className="text-xs font-black uppercase tracking-widest">{selectedFinding.status}</span>
                </div>
                {selectedFinding.status !== 'Verified' && (
                  <button className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20">
                    REQUEST HUMAN QA [Agenda 06]
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase">Vulnerability Hub</h2>
          <p className="text-gray-500 text-xs">Lifecycle stage: Discovery → Assessment → Prioritisation</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20">
          PUSH TO DEFECTDOJO [Agenda 03]
        </button>
      </div>

      <div className="bg-[#16191f] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#0f1115] border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Finding</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Severity</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Target</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {displayFindings.map(f => (
              <tr 
                key={f.id} 
                className="hover:bg-gray-800/20 transition-colors cursor-pointer group"
                onClick={() => setSelectedFinding(f)}
              >
                <td className="px-6 py-5 text-[10px] font-mono text-gray-600">{f.id}</td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-gray-200 group-hover:text-indigo-400 transition-colors">{f.title}</p>
                  <p className="text-[9px] text-gray-600 uppercase font-black mt-1">Tool: {f.tool}</p>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-lg border uppercase ${
                    f.severity === 'Critical' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-orange-500 border-orange-500/20 bg-orange-500/5'
                  }`}>
                    {f.severity}
                  </span>
                </td>
                <td className="px-6 py-5 text-xs text-gray-500 font-mono">{f.target}</td>
                <td className="px-6 py-5">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${f.status === 'Verified' ? 'text-green-500' : 'text-gray-600'}`}>
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FindingsTable;
