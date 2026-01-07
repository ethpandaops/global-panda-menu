import { Network } from '../types/networks';
import { SERVICE_CONFIG } from '../config/config';

export const TESTNETS_CATEGORY = 'testnets';

// Create a map for quick SERVICE_CONFIG lookup
const SERVICE_CONFIG_MAP = new Map(SERVICE_CONFIG.map((svc) => [svc.key, svc]));

// Helper to format camelCase/kebab-case keys into friendly names
function formatServiceKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to spaces
    .replace(/-/g, ' ') // kebab-case to spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize words
}

export interface ServiceInfo {
  key: string;
  name: string;
  icon: string;
}

// Get service display info with fallback for unknown services
export function getServiceInfo(key: string): ServiceInfo {
  const config = SERVICE_CONFIG_MAP.get(key);
  if (config) {
    return config;
  }
  return {
    key,
    name: formatServiceKey(key),
    icon: '🔗', // generic link icon for unknown services
  };
}

export function isStandaloneNetwork(networkKey: string): boolean {
  return !networkKey.includes('-');
}

export function extractCategory(networkKey: string): string {
  if (isStandaloneNetwork(networkKey)) {
    return TESTNETS_CATEGORY;
  }
  const parts = networkKey.split('-');
  if (parts.length >= 2) {
    return parts[0];
  }
  return 'other';
}

export interface CurrentLocation {
  networkKey: string | null;
  serviceKey: string | null;
  categoryKey: string | null;
}

export function detectCurrentLocation(
  networks: Record<string, Network>
): CurrentLocation {
  const currentOrigin = window.location.origin;
  const currentHostname = window.location.hostname;

  // Match against service URLs from discovery data
  for (const [networkKey, network] of Object.entries(networks)) {
    const serviceUrls = network.serviceUrls || {};

    for (const [serviceKey, serviceUrl] of Object.entries(serviceUrls)) {
      if (!serviceUrl) continue;

      // Check if current origin matches the service URL
      try {
        const url = new URL(serviceUrl);
        if (url.origin === currentOrigin) {
          const categoryKey = extractCategory(networkKey);
          return {
            networkKey,
            serviceKey,
            categoryKey,
          };
        }
      } catch {
        // Invalid URL, skip
      }
    }

    // Check if current origin matches the network's homepage URL
    if (network.url) {
      try {
        const url = new URL(network.url);
        if (url.origin === currentOrigin) {
          const categoryKey = extractCategory(networkKey);
          return {
            networkKey,
            serviceKey: null,
            categoryKey,
          };
        }
      } catch {
        // Invalid URL, skip
      }
    }

    // Check if hostname matches network key pattern (e.g., bal-devnet-1.ethpandaops.io)
    if (currentHostname.startsWith(networkKey + '.')) {
      const categoryKey = extractCategory(networkKey);
      return {
        networkKey,
        serviceKey: null,
        categoryKey,
      };
    }
  }

  return { networkKey: null, serviceKey: null, categoryKey: null };
}

export interface GroupedNetworks {
  [category: string]: { key: string; network: Network }[];
}

export function groupNetworksByCategory(
  networks: Record<string, Network>
): GroupedNetworks {
  const grouped: GroupedNetworks = {};

  for (const [key, network] of Object.entries(networks)) {
    const category = extractCategory(key);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({ key, network });
  }

  return grouped;
}

export function getNetworkDisplayName(networkKey: string, network: Network): string {
  return isStandaloneNetwork(networkKey)
    ? networkKey.charAt(0).toUpperCase() + networkKey.slice(1)
    : network.name || networkKey;
}

export function isExternalUrl(serviceUrl: string): boolean {
  try {
    const current = window.location.hostname.split('.').slice(-2).join('.');
    const target = new URL(serviceUrl).hostname.split('.').slice(-2).join('.');
    return current !== target;
  } catch {
    return false;
  }
}
