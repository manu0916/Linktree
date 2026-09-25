import React, { useState, useEffect, useCallback } from 'react';
import { useLinktree } from './hooks/useLinktree';
import { PublicView } from './components/PublicView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';

export default function App() {
  const {
    data,
    isAdmin,
    login,
    logout,
    addLink,
    updateLink,
    deleteLink,
    moveLink,
    toggleLinkActive,
    incrementClick,
    updateProfile,
    updateTheme,
    updateFeatures,
    addLead,
    deleteLead,
    setPresetTheme,
    resetToDefault,
    exportData,
    importData,
    totalClicks,
  } = useLinktree();

  // Current view: 'public' or 'admin'
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Check if URL specifies /admin (via pathname, hash, or search param)
  const checkAdminRoute = useCallback(() => {
    try {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      
      const isRouteAdmin =
        path === '/admin' ||
        path.endsWith('/admin') ||
        hash === '#admin' ||
        hash === '#/admin' ||
        search === '?admin' ||
        search.includes('admin');

      if (isRouteAdmin) {
        if (isAdmin) {
          setCurrentView('admin');
          setLoginModalOpen(false);
        } else {
          setCurrentView('public');
          setLoginModalOpen(true);
        }
      } else {
        if (!isAdmin) {
          setCurrentView('public');
          setLoginModalOpen(false);
        }
      }
    } catch {
      // ignore
    }
  }, [isAdmin]);

  // Listen for navigation and hash changes
  useEffect(() => {
    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, [checkAdminRoute]);

  // When admin logs in, switch view automatically and update URL
  const handleLogin = (email: string, pass: string): boolean => {
    const success = login(email, pass);
    if (success) {
      setCurrentView('admin');
      setLoginModalOpen(false);
      try {
        if (window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
      } catch {
        window.location.hash = '#admin';
      }
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setCurrentView('public');
    setLoginModalOpen(false);
    try {
      window.history.pushState(null, '', '/');
    } catch {
      window.location.hash = '';
    }
  };

  const handleCloseLoginModal = () => {
    setLoginModalOpen(false);
    // If closing without being logged in, remove /admin from the address bar
    if (!isAdmin) {
      try {
        window.history.pushState(null, '', '/');
      } catch {
        window.location.hash = '';
      }
    }
  };

  const handleViewPublic = () => {
    setCurrentView('public');
    try {
      window.history.pushState(null, '', '/');
    } catch {
      window.location.hash = '';
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 font-sans text-zinc-100">
      {currentView === 'admin' && isAdmin ? (
        <AdminDashboard
          state={data}
          onUpdateProfile={updateProfile}
          onAddLink={addLink}
          onUpdateLink={updateLink}
          onDeleteLink={deleteLink}
          onMoveLink={moveLink}
          onToggleLinkActive={toggleLinkActive}
          onSelectThemePreset={setPresetTheme}
          onUpdateTheme={updateTheme}
          onUpdateFeatures={updateFeatures}
          onAddLead={addLead}
          onDeleteLead={deleteLead}
          onExportData={exportData}
          onImportData={importData}
          onResetToDefault={resetToDefault}
          onLogout={handleLogout}
          onViewPublic={handleViewPublic}
          totalClicks={totalClicks}
        />
      ) : (
        <PublicView
          state={data}
          isAdmin={isAdmin}
          onLinkClick={incrementClick}
          onOpenAdminLogin={() => {
            setLoginModalOpen(true);
            try {
              window.history.pushState(null, '', '/admin');
            } catch {
              window.location.hash = '#admin';
            }
          }}
          onOpenAdminDashboard={() => {
            setCurrentView('admin');
            try {
              window.history.pushState(null, '', '/admin');
            } catch {
              window.location.hash = '#admin';
            }
          }}
          onAddLead={addLead}
        />
      )}

      {/* Admin Login Modal (Triggered exclusively when visiting /admin) */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={handleCloseLoginModal}
        onLogin={handleLogin}
      />
    </div>
  );
}
