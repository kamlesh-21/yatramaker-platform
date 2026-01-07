// // src/contexts/NavigationContext.tsx
// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// type NavigationSource = 'search' | 'saved' | 'dashboard' | 'home' | 'unknown';

// interface NavigationContextType {
//   source: NavigationSource;
//   setSource: (source: NavigationSource) => void;
//   navigateFrom: (destination: string, source: NavigationSource) => void;
// }

// const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [source, setSource] = useState<NavigationSource>('unknown');
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Track navigation source based on route changes
//   useEffect(() => {
//     const state = location.state as any;
    
//     if (state?.fromSaved) {
//       setSource('saved');
//       sessionStorage.setItem('navSource', 'saved');
//     } else if (location.pathname.includes('/results')) {
//       setSource('search');
//       sessionStorage.setItem('navSource', 'search');
//     } else if (location.pathname.includes('/dashboard')) {
//       setSource('dashboard');
//       sessionStorage.setItem('navSource', 'dashboard');
//     } else if (location.pathname === '/') {
//       setSource('home');
//       sessionStorage.setItem('navSource', 'home');
//     }
//   }, [location]);

//   const navigateFrom = (destination: string, source: NavigationSource) => {
//     setSource(source);
//     sessionStorage.setItem('navSource', source);
//     navigate(destination);
//   };

//   return (
//     <NavigationContext.Provider value={{ source, setSource, navigateFrom }}>
//       {children}
//     </NavigationContext.Provider>
//   );
// };

// export const useNavigation = () => {
//   const context = useContext(NavigationContext);
//   if (!context) {
//     throw new Error('useNavigation must be used within NavigationProvider');
//   }
//   return context;
// };

// src/contexts/NavigationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type NavigationSource = 'search' | 'saved' | 'dashboard' | 'home' | 'unknown';

interface NavigationContextType {
  source: NavigationSource;
  setSource: (source: NavigationSource) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [source, setSource] = useState<NavigationSource>(() => {
    // Initialize from sessionStorage — survives refresh
    return (sessionStorage.getItem('navSource') as NavigationSource) || 'unknown';
  });

  const location = useLocation();

  useEffect(() => {
    let inferredSource: NavigationSource = 'unknown';

    // 1. Check location.state (most reliable during active navigation)
    const state = location.state as any;
    if (state?.fromSaved) {
      inferredSource = 'saved';
    } else if (location.pathname.includes('/results')) {
      inferredSource = 'search';
    } else if (location.pathname === '/dashboard') {
      inferredSource = 'dashboard';
    } else if (location.pathname === '/itineraries') {
      inferredSource = 'saved';
    } else if (location.pathname === '/') {
      inferredSource = 'home';
    }

    // Only update if changed
    if (inferredSource !== source) {
      setSource(inferredSource);
      sessionStorage.setItem('navSource', inferredSource);
    }
  }, [location, source]);

  return (
    <NavigationContext.Provider value={{ source, setSource }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};