import React, { useState, useEffect } from 'react';
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
    setPresetTheme,
    resetToDefault,
    exportData,
    importData,
    totalClicks,
  } = useLinktree();

  // Current view: 'public' or 'admin'
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Check URL hash for direct #admin route or auto-switch to admin if logged in
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        if (isAdmin) {
          setCurrentView('admin');
        } else {
          setLoginModalOpen(true);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isAdmin]);

  // When admin logs in, switch view automatically
  const handleLogin = (email: string, pass: string): boolean => {
    const success = login(email, pass);
    if (success) {
      setCurrentView('admin');
      window.location.hash = '#admin';
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setCurrentView('public');
    window.location.hash = '';
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950">
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
          onExportData={exportData}
          onImportData={importData}
          onResetToDefault={resetToDefault}
          onLogout={handleLogout}
          onViewPublic={() => {
            setCurrentView('public');
            window.location.hash = '';
          }}
          totalClicks={totalClicks}
        />
      ) : (
        <PublicView
          state={data}
          isAdmin={isAdmin}
          onLinkClick={incrementClick}
          onOpenAdminLogin={() => setLoginModalOpen(true)}
          onOpenAdminDashboard={() => setCurrentView('admin')}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
