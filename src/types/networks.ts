export interface ServiceUrls {
  beaconRpc?: string;
  executionRpc?: string;
  explorer?: string;
  forkmon?: string;
  assertoor?: string;
  dora?: string;
  checkpointSync?: string;
  blobscan?: string;
  ethstats?: string;
  devnetSpec?: string;
  tracoor?: string;
  syncoor?: string;
  spamoor?: string;
  [key: string]: string | undefined;
}

export interface Network {
  name: string;
  repository?: string;
  path?: string;
  url?: string;
  status: 'active' | 'inactive' | 'scheduled';
  lastUpdated?: string;
  chainId?: number;
  serviceUrls?: ServiceUrls;
  genesisConfig?: {
    genesisTime?: number;
  };
}

export interface NetworkMetadata {
  displayName: string;
  description: string;
  image?: string;
  links?: { title: string; url: string }[];
  stats?: {
    totalNetworks: number;
    activeNetworks: number;
    inactiveNetworks: number;
    networkNames: string[];
  };
}

export interface NetworksResponse {
  networkMetadata: Record<string, NetworkMetadata>;
  networks: Record<string, Network>;
  lastUpdate: string;
}

