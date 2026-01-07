import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useNetworksData } from '../hooks/useNetworksData';
import { LOGO_DATA_URL } from '../config/logo';
import { MenuDropdown } from './MenuDropdown';

export interface PandaMenuHandle {
  toggle: () => void;
  open: () => void;
  close: () => void;
}

interface PandaMenuProps {
  /** When true, menu is attached to an existing DOM element instead of floating */
  attached?: boolean;
  /** Height of the attach target element for positioning the dropdown */
  attachTargetHeight?: number;
}

export const PandaMenu = forwardRef<PandaMenuHandle, PandaMenuProps>(
  function PandaMenu({ attached = false, attachTargetHeight = 0 }, ref) {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const { loading, error, currentLocation, sortedCategories, retry } =
      useNetworksData(isOpen);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      toggle: () => setIsOpen((prev) => !prev),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

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

    // In attached mode, render only the dropdown (no button)
    if (attached) {
      if (!isOpen) return null;

      return (
        <div className={`font-sans ${themeClass}`}>
          <div
            className="fixed inset-0 z-[999998]"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div
            className="absolute left-0 z-[999999] w-80 overflow-hidden rounded-lg border border-menu-border bg-menu-bg shadow-2xl"
            style={{ top: `${attachTargetHeight + 4}px` }}
          >
            <MenuDropdown
              loading={loading}
              error={error}
              sortedCategories={sortedCategories}
              currentLocation={currentLocation}
              onClose={handleClose}
              onRetry={retry}
            />
          </div>
        </div>
      );
    }

    // Default floating button mode
    return (
      <div
        className={`panda-menu-button fixed left-4 top-4 z-[999999] font-sans ${themeClass}`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex size-11 items-center justify-center rounded-lg bg-transparent transition-all hover:scale-105 ${isOpen ? 'scale-105' : ''}`}
          aria-label="Open Panda Menu"
          aria-expanded={isOpen}
        >
          <img
            src={LOGO_DATA_URL}
            alt="ethPandaOps"
            className="size-10 transition-transform group-hover:scale-110"
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[-1]"
              onClick={handleClose}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-14 w-80 overflow-hidden rounded-lg border border-menu-border bg-menu-bg shadow-2xl">
              <MenuDropdown
                loading={loading}
                error={error}
                sortedCategories={sortedCategories}
                currentLocation={currentLocation}
                onClose={handleClose}
                onRetry={retry}
              />
            </div>
          </>
        )}
      </div>
    );
  }
);
