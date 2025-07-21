import { createContext, useContext } from 'react';

export const SessionContext = createContext<string>('');
export const useSessionId = () => useContext(SessionContext);
