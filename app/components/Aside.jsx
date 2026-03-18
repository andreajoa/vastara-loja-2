import {createContext, useContext, useState} from 'react';

const AsideContext = createContext(null);

export function Aside({}) {
  return null;
}

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');
  return (
    <AsideContext.Provider value={{
      type,
      open: setType,
      close: () => setType('closed'),
    }}>
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) throw new Error('useAside must be used within an AsideProvider');
  return aside;
}
