import type { ReactNode } from 'react';

const DigimonDetailsDrawer = ({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} />
    <div className="fixed z-40 bottom-0 left-0 right-0 max-h-[85vh] md:bottom-auto md:top-0 md:left-auto md:right-0 md:w-[360px] md:h-full md:max-h-none bg-white dark:bg-dark-300 shadow-2xl flex flex-col rounded-t-2xl md:rounded-none overflow-hidden animate-slide-up md:animate-slide-left">
      {children}
    </div>
  </>
);

export default DigimonDetailsDrawer;
