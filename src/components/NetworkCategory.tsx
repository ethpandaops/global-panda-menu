import { useState } from 'react';
import { Network } from '../types/networks';
import { NetworkItem } from './NetworkItem';

interface NetworkCategoryProps {
  categoryName: string;
  description: string;
  networks: { key: string; network: Network }[];
  defaultExpanded?: boolean;
  currentNetworkKey: string | null;
  currentServiceKey: string | null;
}

export function NetworkCategory({
  categoryName,
  description,
  networks,
  defaultExpanded = false,
  currentNetworkKey,
  currentServiceKey,
}: NetworkCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedNetwork, setExpandedNetwork] = useState<string | null>(
    currentNetworkKey
  );

  const activeNetworks = networks.filter((n) => n.network.status === 'active');

  if (activeNetworks.length === 0) return null;

  const isCurrentCategory = activeNetworks.some(
    (n) => n.key === currentNetworkKey
  );

  return (
    <div className="border-b border-menu-border last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-menu-hover ${
          isCurrentCategory && !isExpanded ? 'bg-menu-accent/10' : ''
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-menu-text">{categoryName}</span>
            <span className="rounded-full bg-menu-border/60 px-1.5 py-0.5 text-[10px] text-menu-text-muted">
              {activeNetworks.length}
            </span>
            {isCurrentCategory && (
              <span className="size-1.5 rounded-full bg-menu-accent" />
            )}
          </div>
          {description && (
            <p
              className="mt-0.5 line-clamp-1 text-[11px] text-menu-text-muted"
              title={description}
            >
              {description}
            </p>
          )}
        </div>
        <svg
          className={`size-4 shrink-0 text-menu-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="pb-1 pl-2">
          {activeNetworks.map(({ key, network }) => (
            <NetworkItem
              key={key}
              networkKey={key}
              network={network}
              isExpanded={expandedNetwork === key}
              onToggle={() =>
                setExpandedNetwork(expandedNetwork === key ? null : key)
              }
              isCurrent={key === currentNetworkKey}
              currentServiceKey={key === currentNetworkKey ? currentServiceKey : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
