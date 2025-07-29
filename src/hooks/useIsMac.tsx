import { useEffect, useState } from 'react';

export function useIsMac() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
    }
  }, []);

  return isMac;
}
