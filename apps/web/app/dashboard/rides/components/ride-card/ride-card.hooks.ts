import { useState } from 'react';

export function useRideCardExpanded() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    setIsOpen,
  };
}
