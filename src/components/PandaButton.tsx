import { LOGO_DATA_URL } from '../config/logo';

interface PandaButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function PandaButton({ onClick, isOpen }: PandaButtonProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`group flex size-11 items-center justify-center rounded-sm bg-transparent transition-all hover:scale-105 ${isOpen ? 'scale-105' : ''}`}
      aria-label={isOpen ? 'Close Panda Menu' : 'Open Panda Menu'}
      aria-expanded={isOpen}
    >
      <img
        src={LOGO_DATA_URL}
        alt="ethPandaOps"
        className="size-10 transition-transform group-hover:scale-110"
      />
    </button>
  );
}
