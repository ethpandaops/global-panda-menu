import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useNetworksData } from '../hooks/useNetworksData';
import { PandaButton } from './PandaButton';
import { SidebarButton } from './SidebarButton';
import { MenuDropdown } from './MenuDropdown';
import type { MenuMode, SidebarConfig, DisplayStyle, MenuSize } from '../config/hostStyles';
import { getMenuWidth } from '../config/hostStyles';

export interface MenuContainerHandle {
  toggle: () => void;
  open: () => void;
  close: () => void;
}

interface MenuContainerProps {
  /** Menu display mode */
  mode: MenuMode;
  /** Height of the attach target element for positioning the dropdown (attached mode only) */
  attachTargetHeight?: number;
  /** Sidebar configuration (sidebar mode only) */
  sidebarConfig?: SidebarConfig;
  /** Display style - 'adjacent' shows next to trigger, 'modal' shows centered with overlay */
  displayStyle?: DisplayStyle;
  /** Menu size preset */
  menuSize?: MenuSize;
}

const MODAL_BOX_SHADOW = '0 0 60px 15px rgba(0, 0, 0, 0.6), 0 25px 50px -12px rgba(0, 0, 0, 0.8)';

export const MenuContainer = forwardRef<MenuContainerHandle, MenuContainerProps>(function MenuContainer(
  { mode, attachTargetHeight = 0, sidebarConfig = {}, displayStyle = 'adjacent', menuSize = 'normal' },
  ref
) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuWidth = getMenuWidth(menuSize);
  const { loading, error, currentLocation, sortedCategories, retry } = useNetworksData(isOpen);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    toggle: () => setIsOpen((prev) => !prev),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl+M to toggle menu
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }
      // Escape to close menu
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isOpen]);

  const themeClass = theme === 'light' ? 'theme-light' : '';
  const handleClose = () => setIsOpen(false);
  const handleToggle = () => setIsOpen((prev) => !prev);
  const isModal = displayStyle === 'modal';

  // Shared menu dropdown props
  const menuDropdownProps = {
    loading,
    error,
    sortedCategories,
    currentLocation,
    onClose: handleClose,
    onRetry: retry,
  };

  // Modal menu wrapper (centered with shadow)
  const renderModalMenu = () => (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-none">
      <div
        className="panda-menu-dropdown pointer-events-auto max-h-[80vh] overflow-hidden rounded-sm border border-menu-border bg-menu-bg"
        style={{ width: menuWidth, boxShadow: MODAL_BOX_SHADOW }}
      >
        <MenuDropdown {...menuDropdownProps} />
      </div>
    </div>
  );

  // Dropdown menu wrapper (positioned)
  const renderDropdownMenu = (positionStyle: React.CSSProperties) => (
    <div
      className="panda-menu-dropdown absolute z-[999999] overflow-hidden rounded-sm border border-menu-border bg-menu-bg shadow-2xl"
      style={{ width: menuWidth, ...positionStyle }}
    >
      <MenuDropdown {...menuDropdownProps} />
    </div>
  );

  // Render function for floating non-attached mode
  const renderFloatingNonAttached = () => (
    <div className={`panda-menu-button fixed left-4 top-4 z-[999999] font-sans ${themeClass}`}>
      <PandaButton onClick={handleToggle} isOpen={isOpen} />

      {isOpen && (
        <>
          {/* Backdrop - darkened for modal, transparent for adjacent */}
          <div
            className={`fixed inset-0 ${isModal ? 'z-[999998] bg-black/50' : 'z-[-1]'}`}
            onClick={handleClose}
            aria-hidden="true"
          />
          {isModal ? renderModalMenu() : renderDropdownMenu({ left: 0, top: 56 })}
        </>
      )}
    </div>
  );

  // Render function for floating attached mode (menu attached to existing element)
  const renderFloatingAttached = () => (
    <div className={`font-sans ${themeClass}`}>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[999998]" onClick={handleClose} aria-hidden="true" />
          {renderDropdownMenu({ left: 0, top: attachTargetHeight + 4 })}
        </>
      )}
    </div>
  );

  // Render function for sidebar mode
  const renderSidebar = () => (
    <div className={`font-sans ${themeClass}`}>
      {/* Backdrop - darkened for modal, transparent for adjacent */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-[999998] ${isModal ? 'bg-black/50' : ''}`}
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Modal: centered dropdown */}
      {isModal && isOpen && renderModalMenu()}

      {/* Sidebar trigger - always visible, expands inline only in adjacent mode */}
      <SidebarButton onClick={handleToggle} isOpen={isOpen} sidebarConfig={sidebarConfig} isAdjacentMode={!isModal}>
        {/* Pass menu content for inline display in adjacent mode */}
        <MenuDropdown {...menuDropdownProps} hideHeader />
      </SidebarButton>
    </div>
  );

  // Render function for modal/hidden mode (keyboard-only toggle)
  const renderHiddenMode = () => (
    <div className={`font-sans ${themeClass}`}>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[999998] bg-black/50" onClick={handleClose} aria-hidden="true" />
          {renderModalMenu()}
        </>
      )}
    </div>
  );

  // Select render function based on mode
  switch (mode) {
    case 'attached':
      return renderFloatingAttached();
    case 'sidebar':
      return renderSidebar();
    case 'hidden':
      return renderHiddenMode();
    case 'floating':
    default:
      return renderFloatingNonAttached();
  }
});
