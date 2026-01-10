import { LOGO_DATA_URL } from '../config/logo';
import type { SidebarConfig } from '../config/hostStyles';

interface SidebarButtonProps {
  onClick: () => void;
  isOpen: boolean;
  sidebarConfig: SidebarConfig;
  /** Whether menu displays adjacent (inline) or as modal - affects button expansion */
  isAdjacentMode: boolean;
  /** Content to render when expanded in adjacent mode */
  children?: React.ReactNode;
}

export function SidebarButton({
  onClick,
  isOpen,
  sidebarConfig,
  isAdjacentMode,
  children,
}: SidebarButtonProps): React.ReactElement {
  const { position = 'center', side = 'left', collapsedWidth = 16 } = sidebarConfig;
  const isExpandedAdjacent = isOpen && isAdjacentMode;

  // Top/Bottom side: horizontal bar
  if (side === 'top' || side === 'bottom') {
    return (
      <HorizontalSidebarButton
        onClick={onClick}
        isOpen={isOpen}
        isExpandedAdjacent={isExpandedAdjacent}
        side={side}
        position={position}
        collapsedWidth={collapsedWidth}
      >
        {children}
      </HorizontalSidebarButton>
    );
  }

  // Left/Right side: vertical bar
  return (
    <VerticalSidebarButton
      onClick={onClick}
      isOpen={isOpen}
      isExpandedAdjacent={isExpandedAdjacent}
      side={side}
      position={position}
      collapsedWidth={collapsedWidth}
    >
      {children}
    </VerticalSidebarButton>
  );
}

interface HorizontalSidebarButtonProps {
  onClick: () => void;
  isOpen: boolean;
  isExpandedAdjacent: boolean;
  side: 'top' | 'bottom';
  position: 'top' | 'center' | 'bottom' | 'left' | 'right';
  collapsedWidth: number;
  children?: React.ReactNode;
}

function HorizontalSidebarButton({
  onClick,
  isOpen,
  isExpandedAdjacent,
  side,
  position,
  collapsedWidth,
  children,
}: HorizontalSidebarButtonProps): React.ReactElement {
  const isTop = side === 'top';
  const hPos = position === 'left' || position === 'center' || position === 'right' ? position : 'center';

  // Position classes for the container
  const horizontalPositionClasses = {
    left: 'left-8 items-start',
    center: 'inset-x-0 items-center',
    right: 'right-8 items-end',
  };

  // Chevron directions based on side
  const chevronCollapsed = isTop ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'; // down for top, up for bottom
  const chevronExpanded = isTop ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'; // up for top, down for bottom

  return (
    <div
      className={`panda-menu-sidebar fixed ${isTop ? 'top-0' : 'bottom-0'} ${horizontalPositionClasses[hPos]} z-[999999] flex flex-col ${!isTop ? 'flex-col-reverse' : ''}`}
    >
      <div
        className={`
          flex overflow-hidden
          ${isTop ? 'flex-col rounded-b-xs border-b' : 'flex-col-reverse rounded-t-xs border-t'} border-x border-menu-border
          bg-menu-bg/95 backdrop-blur-xs shadow-xl
          transition-all duration-200 ease-out
          ${isExpandedAdjacent ? 'panda-menu-dropdown' : ''}
        `}
        style={{
          width: isExpandedAdjacent ? 420 : 96,
          height: isExpandedAdjacent ? 'auto' : collapsedWidth,
          maxHeight: isExpandedAdjacent ? 'min(80vh, 600px)' : undefined,
        }}
      >
        {/* Toggle button / header area */}
        <button
          onClick={onClick}
          className={`
            group flex shrink-0 items-center
            transition-all hover:bg-menu-hover
            ${isExpandedAdjacent ? 'h-12 justify-between gap-2 px-3' : 'h-full w-full justify-center'}
          `}
          aria-label={isOpen ? 'Close Panda Menu' : 'Open Panda Menu'}
          aria-expanded={isOpen}
        >
          {/* Collapsed: chevron only */}
          {!isExpandedAdjacent && (
            <svg
              className="size-4 text-menu-text-muted transition-colors group-hover:text-menu-text"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={chevronCollapsed} />
            </svg>
          )}

          {/* Expanded adjacent: logo + title + chevron */}
          {isExpandedAdjacent && (
            <>
              <div className="flex items-center gap-2">
                <img src={LOGO_DATA_URL} alt="ethPandaOps" className="size-6" />
                <span className="text-sm font-medium text-menu-text">ethPandaOps</span>
              </div>
              <svg
                className="size-4 text-menu-text-muted transition-colors group-hover:text-menu-text"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={chevronExpanded} />
              </svg>
            </>
          )}
        </button>

        {/* Adjacent mode: inline expanded content */}
        {isExpandedAdjacent && children && (
          <div className={`min-h-0 flex-1 overflow-y-auto ${isTop ? 'border-t' : 'border-b'} border-menu-border`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

interface VerticalSidebarButtonProps {
  onClick: () => void;
  isOpen: boolean;
  isExpandedAdjacent: boolean;
  side: 'left' | 'right';
  position: 'top' | 'center' | 'bottom' | 'left' | 'right';
  collapsedWidth: number;
  children?: React.ReactNode;
}

function VerticalSidebarButton({
  onClick,
  isOpen,
  isExpandedAdjacent,
  side,
  position,
  collapsedWidth,
  children,
}: VerticalSidebarButtonProps): React.ReactElement {
  const isLeft = side === 'left';
  const vPos = position === 'top' || position === 'center' || position === 'bottom' ? position : 'center';

  // Chevron paths for different states
  const chevronExpand = isLeft ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7';
  const chevronCollapse = isLeft ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7';

  // For center position, use fixed positioning based on viewport height
  const getPositionStyle = () => {
    if (vPos === 'top') return { top: 32 };
    if (vPos === 'bottom') return { bottom: 32 };
    // Center: position from top, accounting for max menu height
    return { top: '50%', marginTop: isExpandedAdjacent ? -300 : -48 }; // -300 = half of 600px max, -48 = half of 96px
  };

  return (
    <div
      className={`panda-menu-sidebar fixed ${isLeft ? 'left-0' : 'right-0'} z-[999999] flex`}
      style={getPositionStyle()}
    >
      <div
        className={`
          flex flex-col overflow-hidden
          ${isLeft ? 'rounded-r-xs border-r' : 'rounded-l-xs border-l'} border-y border-menu-border
          bg-menu-bg/95 backdrop-blur-xs shadow-xl
          transition-all duration-200 ease-out
          ${isExpandedAdjacent ? 'panda-menu-dropdown' : ''}
        `}
        style={{
          width: isExpandedAdjacent ? 420 : collapsedWidth,
          height: isExpandedAdjacent ? 'auto' : 96,
          maxHeight: isExpandedAdjacent ? 'min(80vh, 600px)' : undefined,
        }}
      >
        {/* Toggle button / header area */}
        <button
          onClick={onClick}
          className={`
            group flex shrink-0 items-center
            transition-all hover:bg-menu-hover
            ${isExpandedAdjacent ? 'h-24 justify-between gap-2 px-3' : 'h-full w-full justify-center'}
          `}
          aria-label={isOpen ? 'Close Panda Menu' : 'Open Panda Menu'}
          aria-expanded={isOpen}
        >
          {/* Collapsed: chevron only */}
          {!isExpandedAdjacent && (
            <svg
              className="size-4 text-menu-text-muted transition-colors group-hover:text-menu-text"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={chevronExpand} />
            </svg>
          )}

          {/* Expanded adjacent: logo + title + chevron */}
          {isExpandedAdjacent && (
            <>
              <div className={`flex items-center gap-2 ${!isLeft ? 'order-2' : ''}`}>
                <img src={LOGO_DATA_URL} alt="ethPandaOps" className="size-8" />
                <span className="text-sm font-medium text-menu-text">ethPandaOps</span>
              </div>
              <svg
                className={`size-4 text-menu-text-muted transition-colors group-hover:text-menu-text ${!isLeft ? 'order-1' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={chevronCollapse} />
              </svg>
            </>
          )}
        </button>

        {/* Adjacent mode: inline expanded content */}
        {isExpandedAdjacent && children && (
          <div className="min-h-0 flex-1 overflow-y-auto border-t border-menu-border">{children}</div>
        )}
      </div>
    </div>
  );
}
