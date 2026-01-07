import { useState, useEffect, useMemo } from 'react';
import { NetworksResponse } from '../types/networks';
import { NETWORKS_URL } from '../config/config';
import { getNativeFetch } from '../utils/nativeFetch';
import {
  detectCurrentLocation,
  groupNetworksByCategory,
  CurrentLocation,
  GroupedNetworks,
  TESTNETS_CATEGORY,
} from '../services/networkService';

export interface CategoryData {
  categoryKey: string;
  categoryName: string;
  description: string;
  networks: { key: string; network: import('../types/networks').Network }[];
  activeCount: number;
}

export interface UseNetworksDataResult {
  data: NetworksResponse | null;
  loading: boolean;
  error: string | null;
  currentLocation: CurrentLocation;
  groupedNetworks: GroupedNetworks | null;
  sortedCategories: CategoryData[];
  retry: () => void;
}

export function useNetworksData(isOpen: boolean): UseNetworksDataResult {
  const [data, setData] = useState<NetworksResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retry = () => setData(null);

  useEffect(() => {
    if (isOpen && !data && !loading) {
      setLoading(true);
      getNativeFetch()(NETWORKS_URL)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch networks');
          return res.json();
        })
        .then((json: NetworksResponse) => {
          setData(json);
          setError(null);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, data, loading]);

  const currentLocation = useMemo(() => {
    if (!data) return { networkKey: null, serviceKey: null, categoryKey: null };
    return detectCurrentLocation(data.networks);
  }, [data]);

  const groupedNetworks = useMemo(() => {
    if (!data) return null;
    return groupNetworksByCategory(data.networks);
  }, [data]);

  const sortedCategories = useMemo(() => {
    if (!groupedNetworks || !data) return [];

    return Object.entries(groupedNetworks)
      .map(([categoryKey, networks]) => {
        const metadata = data.networkMetadata[categoryKey];
        const activeCount = networks.filter(
          (n) => n.network.status === 'active'
        ).length;
        return {
          categoryKey,
          categoryName:
            categoryKey === TESTNETS_CATEGORY
              ? 'Testnets'
              : metadata?.displayName || categoryKey,
          description:
            categoryKey === TESTNETS_CATEGORY
              ? 'Public Testnets'
              : metadata?.description || '',
          networks,
          activeCount,
        };
      })
      .filter((cat) => cat.activeCount > 0)
      .sort((a, b) => {
        // Current category first
        if (a.categoryKey === currentLocation.categoryKey) return -1;
        if (b.categoryKey === currentLocation.categoryKey) return 1;
        // Then testnets
        if (a.categoryKey === TESTNETS_CATEGORY) return -1;
        if (b.categoryKey === TESTNETS_CATEGORY) return 1;
        return b.activeCount - a.activeCount;
      });
  }, [groupedNetworks, data, currentLocation.categoryKey]);

  return {
    data,
    loading,
    error,
    currentLocation,
    groupedNetworks,
    sortedCategories,
    retry,
  };
}
