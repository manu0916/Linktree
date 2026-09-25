import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LinktreeState,
  LinkItem,
  ProfileData,
  ThemeConfig,
  FrontendFeaturesConfig,
  NewsletterLead,
} from '../types/linktree';
import { INITIAL_STATE, ADMIN_CREDENTIALS, THEME_PRESETS } from '../data/defaultData';

const STORAGE_KEY = 'linktree_custom_state_v1';
const SESSION_KEY = 'linktree_admin_auth_v1';
const VISITOR_KEY = 'linktree_visited_session';

export function useLinktree() {
  // Load Linktree state from localStorage
  const [data, setData] = useState<LinktreeState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STATE,
          ...parsed,
          profile: {
            ...INITIAL_STATE.profile,
            ...parsed.profile,
            socialLinks: {
              ...INITIAL_STATE.profile.socialLinks,
              ...(parsed.profile?.socialLinks || {}),
            },
          },
          theme: parsed.theme || INITIAL_STATE.theme,
          features: {
            ...INITIAL_STATE.features,
            ...(parsed.features || {}),
            customDesign: {
              ...INITIAL_STATE.features.customDesign,
              ...(parsed.features?.customDesign || {}),
            },
          },
          leads: Array.isArray(parsed.leads) ? parsed.leads : INITIAL_STATE.leads,
          links: Array.isArray(parsed.links) ? parsed.links : INITIAL_STATE.links,
        };
      }
    } catch (e) {
      console.error('Error loading Linktree state:', e);
    }
    return INITIAL_STATE;
  });

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Save to localStorage on data change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving Linktree state:', e);
    }
  }, [data]);

  // Sync Document Title & Meta Description with custom settings
  useEffect(() => {
    if (data.features?.pageTitle) {
      document.title = data.features.pageTitle;
    }
    if (data.features?.metaDescription) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', data.features.metaDescription);
      }
    }
  }, [data.features?.pageTitle, data.features?.metaDescription]);

  // Track profile visitor once per session
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(VISITOR_KEY)) {
        sessionStorage.setItem(VISITOR_KEY, 'true');
        setData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            views: (prev.profile.views || 0) + 1,
          },
        }));
      }
    } catch (e) {
      console.error('Error tracking visit:', e);
    }
  }, []);

  // Admin Login
  const login = useCallback((emailInput: string, passwordInput: string): boolean => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (
      cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() &&
      cleanPass === ADMIN_CREDENTIALS.password
    ) {
      setIsAdmin(true);
      try {
        sessionStorage.setItem(SESSION_KEY, 'true');
      } catch (e) {
        console.error(e);
      }
      return true;
    }
    return false;
  }, []);

  // Admin Logout
  const logout = useCallback(() => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Play subtle feedback click sound if enabled
  const playClickSound = useCallback(() => {
    if (!data.features?.soundEffectsEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // ignore
    }
  }, [data.features?.soundEffectsEnabled]);

  // Increment click count for a link
  const incrementClick = useCallback((linkId: string) => {
    playClickSound();
    setData((prev) => ({
      ...prev,
      links: prev.links.map((link) =>
        link.id === linkId ? { ...link, clicks: (link.clicks || 0) + 1 } : link
      ),
      lastUpdated: Date.now(),
    }));
  }, [playClickSound]);

  // Add Link
  const addLink = useCallback((newLinkData: Partial<LinkItem>) => {
    setData((prev) => {
      const highestOrder = prev.links.reduce((max, l) => Math.max(max, l.order || 0), 0);
      const newLink: LinkItem = {
        id: 'link-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        type: newLinkData.type || 'link',
        title: newLinkData.title || 'Novo Link',
        subtitle: newLinkData.subtitle || '',
        url: newLinkData.url || 'https://',
        icon: newLinkData.icon || 'link',
        isActive: newLinkData.isActive ?? true,
        isHighlighted: newLinkData.isHighlighted ?? false,
        highlightBadge: newLinkData.highlightBadge || '',
        clicks: 0,
        order: highestOrder + 1,
        createdAt: Date.now(),
        pixKey: newLinkData.pixKey,
        pixType: newLinkData.pixType,
        pixName: newLinkData.pixName,
        whatsappNumber: newLinkData.whatsappNumber,
        whatsappMessage: newLinkData.whatsappMessage,
        embedUrl: newLinkData.embedUrl,
      };

      return {
        ...prev,
        links: [...prev.links, newLink],
        lastUpdated: Date.now(),
      };
    });
  }, []);

  // Update Link
  const updateLink = useCallback((id: string, updatedFields: Partial<LinkItem>) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.map((link) =>
        link.id === id ? { ...link, ...updatedFields } : link
      ),
      lastUpdated: Date.now(),
    }));
  }, []);

  // Delete Link
  const deleteLink = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== id),
      lastUpdated: Date.now(),
    }));
  }, []);

  // Toggle Link Active Status
  const toggleLinkActive = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.map((l) =>
        l.id === id ? { ...l, isActive: !l.isActive } : l
      ),
      lastUpdated: Date.now(),
    }));
  }, []);

  // Reorder Links (Move link up or down)
  const moveLink = useCallback((index: number, direction: 'up' | 'down') => {
    setData((prev) => {
      const linksCopy = [...prev.links];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= linksCopy.length) return prev;

      const [movedItem] = linksCopy.splice(index, 1);
      linksCopy.splice(targetIndex, 0, movedItem);

      // Re-assign order numbers
      const reordered = linksCopy.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));

      return {
        ...prev,
        links: reordered,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  // Update Profile Info
  const updateProfile = useCallback((profileFields: Partial<ProfileData>) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profileFields,
      },
      lastUpdated: Date.now(),
    }));
  }, []);

  // Update Theme
  const updateTheme = useCallback((newTheme: ThemeConfig) => {
    setData((prev) => ({
      ...prev,
      theme: newTheme,
      lastUpdated: Date.now(),
    }));
  }, []);

  // Update Frontend Features Configuration
  const updateFeatures = useCallback((featuresFields: Partial<FrontendFeaturesConfig>) => {
    setData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        ...featuresFields,
      },
      lastUpdated: Date.now(),
    }));
  }, []);

  // Add Newsletter Lead
  const addLead = useCallback((email: string, name?: string) => {
    const newLead: NewsletterLead = {
      id: 'lead-' + Date.now(),
      email: email.trim(),
      name: name?.trim(),
      createdAt: Date.now(),
    };
    setData((prev) => ({
      ...prev,
      leads: [newLead, ...prev.leads],
      lastUpdated: Date.now(),
    }));
  }, []);

  // Delete Lead
  const deleteLead = useCallback((leadId: string) => {
    setData((prev) => ({
      ...prev,
      leads: prev.leads.filter((l) => l.id !== leadId),
      lastUpdated: Date.now(),
    }));
  }, []);

  // Set preset theme by ID
  const setPresetTheme = useCallback((presetId: keyof typeof THEME_PRESETS) => {
    if (THEME_PRESETS[presetId]) {
      setData((prev) => ({
        ...prev,
        theme: THEME_PRESETS[presetId],
        lastUpdated: Date.now(),
      }));
    }
  }, []);

  // Reset to initial state
  const resetToDefault = useCallback(() => {
    setData(INITIAL_STATE);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STATE));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Export JSON file
  const exportData = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `linktree_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [data]);

  // Import JSON file
  const importData = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.profile && Array.isArray(parsed.links)) {
        setData({
          ...INITIAL_STATE,
          ...parsed,
          features: {
            ...INITIAL_STATE.features,
            ...(parsed.features || {}),
          },
        });
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON import:', e);
    }
    return false;
  }, []);

  // Computed statistics
  const totalClicks = useMemo(() => {
    return data.links.reduce((acc, l) => acc + (l.clicks || 0), 0);
  }, [data.links]);

  const activeLinks = useMemo(() => {
    return data.links.filter((l) => l.isActive);
  }, [data.links]);

  return {
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
    activeLinks,
    playClickSound,
  };
}
