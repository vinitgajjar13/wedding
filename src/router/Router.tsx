import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface RouteMatch {
  path: string;
  viewId: string;
}

// Canonical view mapping
export const ROUTE_MAP: Record<string, string> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/availability': 'availability',
  '/smart-search': 'availability',
  '/products': 'products',
  '/inventory': 'inventory',
  '/bookings': 'bookings',
  '/returns': 'returns',
  '/calendar': 'calendar',
  '/customers': 'customers',
  '/measurements': 'measurements',
  '/alterations': 'alterations',
  '/sales': 'sales',
  '/orders': 'sales',
  '/payments': 'payments',
  '/expenses': 'expenses',
  '/reports': 'reports',
  '/suppliers': 'suppliers',
  '/suppliers-staff': 'suppliers',
  '/audit': 'audit',
  '/audit-logs': 'audit',
  '/settings': 'settings',
};

// Reverse map from viewId to canonical URL path
export const VIEW_TO_PATH: Record<string, string> = {
  dashboard: '/dashboard',
  availability: '/availability',
  'smart-search': '/availability',
  products: '/products',
  inventory: '/inventory',
  bookings: '/bookings',
  returns: '/returns',
  calendar: '/calendar',
  customers: '/customers',
  measurements: '/measurements',
  alterations: '/alterations',
  sales: '/sales',
  orders: '/sales',
  payments: '/payments',
  expenses: '/expenses',
  reports: '/reports',
  suppliers: '/suppliers',
  'suppliers-staff': '/suppliers',
  audit: '/audit',
  'audit-logs': '/audit',
  settings: '/settings',
};

interface RouterContextType {
  currentPath: string;
  viewId: string;
  queryParams: URLSearchParams;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function extractPathAndSearch(): { pathname: string; search: string } {
  if (typeof window === 'undefined') {
    return { pathname: '/dashboard', search: '' };
  }

  // Support hash routing fallback (#/products?...) if used
  if (window.location.hash.startsWith('#/')) {
    const fullHash = window.location.hash.slice(1); // remove '#'
    const [pathPart, searchPart] = fullHash.split('?');
    return {
      pathname: pathPart || '/dashboard',
      search: searchPart ? `?${searchPart}` : '',
    };
  }

  return {
    pathname: window.location.pathname || '/dashboard',
    search: window.location.search || '',
  };
}

export function resolveViewId(path: string): string {
  // Normalize path by stripping trailing slash
  const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
  return ROUTE_MAP[normalized] || 'dashboard';
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [{ pathname, search }, setLocationState] = useState(extractPathAndSearch);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (typeof window === 'undefined') return;

    let targetPath = to;
    // Check if view name was passed (e.g. navigate('products') instead of navigate('/products'))
    if (!to.startsWith('/') && !to.startsWith('#') && VIEW_TO_PATH[to]) {
      targetPath = VIEW_TO_PATH[to];
    }

    const isHash = window.location.hash.startsWith('#/');
    if (isHash) {
      if (options?.replace) {
        window.location.replace(`#${targetPath}`);
      } else {
        window.location.hash = `#${targetPath}`;
      }
    } else {
      if (options?.replace) {
        window.history.replaceState(null, '', targetPath);
      } else {
        window.history.pushState(null, '', targetPath);
      }
    }

    setLocationState(extractPathAndSearch());
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setLocationState(extractPathAndSearch());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Also sync on initial mount if root path '/' to set canonical '/dashboard'
    if (window.location.pathname === '/') {
      window.history.replaceState(null, '', '/dashboard');
      setLocationState(extractPathAndSearch());
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const queryParams = new URLSearchParams(search);
  const viewId = resolveViewId(pathname);

  return (
    <RouterContext.Provider
      value={{
        currentPath: pathname,
        viewId,
        queryParams,
        navigate,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
  className?: string;
  children: ReactNode;
}

export const Link: React.FC<LinkProps> = ({ to, replace, className, children, onClick, ...rest }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (
      !e.defaultPrevented &&
      e.button === 0 && // Left click
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.shiftKey
    ) {
      e.preventDefault();
      navigate(to, { replace });
    }
  };

  const href = to.startsWith('/') || to.startsWith('#') ? to : VIEW_TO_PATH[to] || `/${to}`;

  return (
    <a href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
};
