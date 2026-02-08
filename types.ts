export enum AgentStatus {
  IDLE = 'IDLE',
  RECON = 'RECONNAISSANCE',
  SCAN = 'SCANNING',
  EXPLOIT = 'EXPLOITATION',
  REPORTING = 'REPORTING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum EngagementType {
  WEB = 'Web Application',
  API = 'API Service',
  MOBILE = 'Mobile Application',
  INFRA = 'Infrastructure'
}

export enum AuthType {
  NONE = 'No Auth',
  BASIC = 'Basic / Form',
  OAUTH = 'OAuth / Bearer',
  STATIC_KEY = 'Static API Key',
  KERBEROS = 'Kerberos / NTLM'
}

export interface AuthConfig {
  type: AuthType;
  username?: string;
  password?: string;
  token?: string;
  keyName?: string;
  keyValue?: string;
  realm?: string;
  kdc?: string;
}

export interface AgentTuningConfig {
  recon: { maxIterations: number; temperature: number };
  scanner: { maxIterations: number; temperature: number };
  exploit: { maxIterations: number; temperature: number };
}

export interface InfraResourceConfig {
  cpuCores: number;
  ramGb: number;
  gpuUnits: number;
  storageGb: number;
  replicas: number;
}

export interface ClusterNode {
  id: string;
  hostname: string;
  ip: string;
  role: 'Worker' | 'Manager' | 'Storage';
  status: 'Online' | 'Provisioning' | 'Offline';
  resources: {
    cpu: number;
    ram: number;
  };
}

export interface FleetInfraConfig {
  ollama: InfraResourceConfig;
  orchestrator: InfraResourceConfig;
  database: InfraResourceConfig;
  sandboxes: {
    maxConcurrent: number;
    memoryLimitMb: number;
  };
  clusterNodes: ClusterNode[];
}

export interface ToolParameter {
  key: string;
  value: string;
  description: string;
}

export interface ApiKeyConfig {
  id: string;
  service: string;
  key: string;
  status: 'Valid' | 'Unset' | 'Expiring';
  lastUsed?: string;
}

export type InstallationStatus = 'Installed' | 'Not Installed' | 'Installing...' | 'Error';

export interface ToolConfig {
  id: string;
  name: string;
  category: 'Recon' | 'Scanner' | 'Exploitation' | 'Post-Exploitation';
  enabled: boolean;
  description: string;
  usageExample?: string;
  parameters: ToolParameter[];
  noiseLevel?: 'Low' | 'Medium' | 'High';
  environmentStatus?: 'Healthy' | 'Isolated' | 'Degraded';
  installationStatus: InstallationStatus;
}

export interface Finding {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  cvss: number;
  epss: number;
  status: 'Open' | 'Verified' | 'Remediated';
  tool: string;
  target: string;
  timestamp: string;
  description?: string;
  remediation?: string;
}

export interface AgentLog {
  id: string;
  type: 'OBSERVE' | 'THINK' | 'ACT' | 'REFLECT' | 'SYSTEM';
  message: string;
  timestamp: string;
  agentName: string;
}

export interface Engagement {
  id: string;
  name: string;
  status: AgentStatus;
  type: EngagementType;
  progress: number;
  targets: string[];
  excludedAssets: string[];
  activeVector?: string;
  findingsCount: number;
  startTime: string;
  authConfig?: AuthConfig;
  tuning?: AgentTuningConfig;
}

export interface ServiceHealth {
  id: string;
  name: string;
  status: 'Healthy' | 'Degraded' | 'Failing';
  cpu: number;
  ram: number;
  gpu?: number;
  uptime: string;
  lastCheck: string;
  endpoint: string;
}