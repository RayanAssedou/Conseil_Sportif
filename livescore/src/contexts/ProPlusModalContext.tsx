"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ProPlusModalState {
  isOpen: boolean;
  whatsappLink: string;
  openProPlus: (whatsappLink?: string) => void;
  closeProPlus: () => void;
}

const ProPlusModalContext = createContext<ProPlusModalState>({
  isOpen: false,
  whatsappLink: "",
  openProPlus: () => {},
  closeProPlus: () => {},
});

export function ProPlusModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");

  const openProPlus = useCallback((link?: string) => {
    if (link) setWhatsappLink(link);
    setIsOpen(true);
  }, []);

  const closeProPlus = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ProPlusModalContext.Provider value={{ isOpen, whatsappLink, openProPlus, closeProPlus }}>
      {children}
    </ProPlusModalContext.Provider>
  );
}

export function useProPlusModal() {
  return useContext(ProPlusModalContext);
}
