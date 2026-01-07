export const NETWORKS_URL =
  'https://ethpandaops-platform-production-cartographoor.ams3.digitaloceanspaces.com/networks.json';

export interface GenericLink {
  name: string;
  url: string;
  icon: string;
}

export const GENERIC_LINKS: GenericLink[] = [
  { name: 'GitHub', url: 'https://github.com/ethpandaops', icon: '📦' },
  { name: 'Website', url: 'https://ethpandaops.io', icon: '📚' },
  { name: 'Lab', url: 'https://lab.ethpandaops.io/', icon: '🧪' },
];

export interface ServiceConfig {
  key: string;
  name: string;
  icon: string;
}

export const SERVICE_CONFIG: ServiceConfig[] = [
  { key: 'dora', name: 'Dora', icon: '🔍' },
  { key: 'explorer', name: 'Explorer', icon: '🌐' },
  { key: 'beaconRpc', name: 'Beacon RPC', icon: '📡' },
  { key: 'executionRpc', name: 'Execution RPC', icon: '⚡' },
  { key: 'forkmon', name: 'Forkmon', icon: '🍴' },
  { key: 'assertoor', name: 'Assertoor', icon: '✅' },
  { key: 'tracoor', name: 'Tracoor', icon: '📊' },
  { key: 'syncoor', name: 'Syncoor', icon: '🔄' },
  { key: 'ethstats', name: 'Ethstats', icon: '📈' },
  { key: 'checkpointSync', name: 'Checkpoint Sync', icon: '🎯' },
  { key: 'blobscan', name: 'Blobscan', icon: '🫧' },
  { key: 'spamoor', name: 'Spamoor', icon: '📨' },
  { key: 'devnetSpec', name: 'Specs', icon: '📋' },
];
