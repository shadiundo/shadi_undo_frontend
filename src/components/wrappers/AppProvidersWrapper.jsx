import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { DEFAULT_PAGE_TITLE } from '@/context/constants';
import { AuthProvider } from '@/context/useAuthContext';
import { LayoutProvider } from '@/context/useLayoutContext';
import { NotificationProvider } from '@/context/useNotificationContext';
import { HelmetProvider } from 'react-helmet-async';
const handleChangeTitle = () => {
  if (document.visibilityState == 'hidden') document.title = '';else document.title = DEFAULT_PAGE_TITLE;
};
const AppProvidersWrapper = ({
  children
}) => {
  useEffect(() => {
    // Non-blocking background backend pre-warm (wakes up Render container if idle)
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      fetch(`${apiUrl}/api/health`, { method: "GET", keepalive: true }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleChangeTitle);
    return () => {
      document.removeEventListener('visibilitychange', handleChangeTitle);
    };
  }, []);
  return <HelmetProvider>
      <AuthProvider>
        <LayoutProvider>
          <NotificationProvider>
            {children}
            <ToastContainer theme="colored" />
          </NotificationProvider>
        </LayoutProvider>
      </AuthProvider>
    </HelmetProvider>;
};
export default AppProvidersWrapper;