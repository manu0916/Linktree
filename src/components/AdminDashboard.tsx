import React, { useState } from 'react';
import {
  LogOut,
  Eye,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Palette,
  BarChart3,
  User,
  Github,
  Upload,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  MessageCircle,
  Video,
  DollarSign,
  AlertCircle,
  Sliders,
  Mail,
  Volume2,
  Shield,
  Layers,
  LayoutGrid,
  Share2,
  Megaphone,
  Rocket,
  Star,
  Flame,
  Gift,
  Bell,
  Search,
  Paintbrush,
  Smartphone,
  Send,
  HelpCircle,
} from 'lucide-react';
import {
  LinktreeState,
  LinkItem,
  ProfileData,
  ThemeConfig,
  ThemePresetId,
  LinkType,
  FrontendFeaturesConfig,
  NewsletterLead,
} from '../types/linktree';
import { THEME_PRESETS } from '../data/defaultData';
import { IconRenderer } from './IconRenderer';

interface AdminDashboardProps {
  state: LinktreeState;
  onUpdateProfile: (profile: Partial<ProfileData>) => void;
  onAddLink: (link: Partial<LinkItem>) => void;
  onUpdateLink: (id: string, updated: Partial<LinkItem>) => void;
  onDeleteLink: (id: string) => void;
  onMoveLink: (index: number, direction: 'up' | 'down') => void;
  onToggleLinkActive: (id: string) => void;
  onSelectThemePreset: (presetId: ThemePresetId) => void;
  onUpdateTheme: (theme: ThemeConfig) => void;
  onUpdateFeatures: (features: Partial<FrontendFeaturesConfig>) => void;
  onAddLead?: (email: string, name?: string) => void;
  onDeleteLead?: (leadId: string) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onResetToDefault: () => void;
  onLogout: () => void;
  onViewPublic: () => void;
  totalClicks: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  state,
  onUpdateProfile,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onMoveLink,
  onToggleLinkActive,
  onSelectThemePreset,
  onUpdateTheme,
  onUpdateFeatures,
  onDeleteLead,
  onExportData,
  onImportData,
  onResetToDefault,
  onLogout,
  onViewPublic,
  totalClicks,
}) => {
  const [activeTab, setActiveTab] = useState<
    'links' | 'profile' | 'features' | 'appearance' | 'leads' | 'analytics' | 'deploy'
  >('features');
  const [editingLink, setEditingLink] = useState<Partial<LinkItem> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [soundTested, setSoundTested] = useState(false);

  const { profile, links, theme, features, leads } = state;

  // Calculate CTR
  const ctr = profile.views > 0 ? ((totalClicks / profile.views) * 100).toFixed(1) : '0';

  // Handle file upload for Avatar
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateProfile({ avatarUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Test sound effect
  const testClickSound = () => {
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
      setSoundTested(true);
      setTimeout(() => setSoundTested(false), 1500);
    } catch {
      // ignore
    }
  };

  // Export leads as CSV
  const exportLeadsCsv = () => {
    if (!leads || leads.length === 0) return;
    const header = 'Nome,Email,Data\n';
    const rows = leads
      .map((l) => `"${l.name || ''}","${l.email}","${new Date(l.createdAt).toLocaleString('pt-BR')}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_linktree_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Create Link modal
  const handleStartCreateLink = (type: LinkType = 'link') => {
    setIsCreatingNew(true);
    let initialTitle = 'Meu Novo Link';
    let initialUrl = 'https://';
    let initialIcon = 'link';

    if (type === 'header') {
      initialTitle = 'Nova Seção';
      initialUrl = '';
    } else if (type === 'whatsapp') {
      initialTitle = 'Conversar no WhatsApp';
      initialUrl = 'https://wa.me/55';
      initialIcon = 'message-circle';
    } else if (type === 'pix') {
      initialTitle = 'Chave Pix de Apoio';
      initialUrl = '#pix';
      initialIcon = 'sparkles';
    } else if (type === 'youtube') {
      initialTitle = 'Vídeo em Destaque';
      initialUrl = 'https://www.youtube.com/watch?v=';
      initialIcon = 'video';
    }

    setEditingLink({
      type,
      title: initialTitle,
      subtitle: '',
      url: initialUrl,
      icon: initialIcon,
      isActive: true,
      isHighlighted: false,
      highlightBadge: '',
      pixKey: type === 'pix' ? profile.socialLinks.email || 'manu4432d@gmail.com' : undefined,
      pixName: type === 'pix' ? profile.name : undefined,
      pixType: 'email',
      whatsappNumber: '55',
      whatsappMessage: 'Olá!',
    });
  };

  // Save Link Form
  const handleSaveLinkForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    let embedUrl = editingLink.embedUrl;
    if (editingLink.type === 'youtube' && editingLink.url) {
      try {
        if (editingLink.url.includes('watch?v=')) {
          const videoId = editingLink.url.split('watch?v=')[1]?.split('&')[0];
          if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (editingLink.url.includes('youtu.be/')) {
          const videoId = editingLink.url.split('youtu.be/')[1]?.split('?')[0];
          if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      } catch {
        // ignore
      }
    }

    let url = editingLink.url;
    if (editingLink.type === 'whatsapp' && editingLink.whatsappNumber) {
      const cleanNum = editingLink.whatsappNumber.replace(/\D/g, '');
      const encodedMsg = encodeURIComponent(editingLink.whatsappMessage || '');
      url = `https://wa.me/${cleanNum}?text=${encodedMsg}`;
    }

    if (isCreatingNew) {
      onAddLink({
        ...editingLink,
        url,
        embedUrl,
      });
    } else if (editingLink.id) {
      onUpdateLink(editingLink.id, {
        ...editingLink,
        url,
        embedUrl,
      });
    }

    setEditingLink(null);
    setIsCreatingNew(false);
  };

  const gitCommands = `# Passo a passo para subir no Cloudflare Pages:
git init
git remote add origin https://github.com/manu0916/Linktree.git
git add .
git commit -m "feat: linktree com painel admin completo e personalizacao front-end"
git branch -M main
git push -u origin main

# No Cloudflare Pages:
# 1. Acesse https://dash.cloudflare.com/ > Workers & Pages
# 2. Conecte sua conta do GitHub e selecione 'Linktree'
# 3. Framework preset: Vite
# 4. Build command: npm run build
# 5. Build output directory: dist`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-zinc-950 font-black text-lg shadow-md shadow-cyan-500/20">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white tracking-tight">
                  Painel de Controle
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Logado como: <span className="text-zinc-300 font-mono">manu4432d@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Visitas:</span>
              <strong className="text-white font-mono">{profile.views}</strong>
            </div>
            <div className="w-[1px] h-4 bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Cliques:</span>
              <strong className="text-cyan-400 font-mono">{totalClicks}</strong>
            </div>
            <div className="w-[1px] h-4 bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">CTR:</span>
              <strong className="text-emerald-400 font-mono">{ctr}%</strong>
            </div>
            <div className="w-[1px] h-4 bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Leads:</span>
              <strong className="text-purple-400 font-mono">{leads?.length || 0}</strong>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <a
              href="/site-linktree.zip"
              download="site-linktree.zip"
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              title="Baixar Arquivo ZIP do Projeto Completo"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar ZIP</span>
            </a>

            <button
              onClick={onViewPublic}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Página Pública</span>
            </button>

            <button
              onClick={onExportData}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Exportar Backup JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Importar Backup"
            >
              <Upload className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sair do Painel"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-zinc-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'features', label: 'Personalizar Front-end', icon: Sliders, highlight: true },
            { id: 'links', label: 'Gerenciar Links', icon: LinkIcon, badge: links.length },
            { id: 'profile', label: 'Meu Perfil & Redes', icon: User },
            { id: 'appearance', label: 'Temas & Cores', icon: Palette },
            { id: 'leads', label: 'Newsletter & Leads', icon: Mail, badge: leads?.length || 0 },
            { id: 'analytics', label: 'Analytics de Cliques', icon: BarChart3 },
            { id: 'deploy', label: 'Cloudflare & GitHub', icon: Github },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 shadow-md font-extrabold'
                    : tab.highlight
                    ? 'text-cyan-400 hover:text-cyan-300 bg-cyan-950/30 border border-cyan-800/40 hover:bg-cyan-900/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-zinc-300 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-5xl w-full mx-auto p-4 md:p-8 flex-1">
        {/* ======================================================== */}
        {/* TAB: FRONTEND FEATURES & CUSTOMIZATION */}
        {/* ======================================================== */}
        {activeTab === 'features' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header intro */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-zinc-900/60 to-purple-950/40 border border-cyan-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-bold text-white">
                    Personalização Completa do Front-end
                  </h2>
                </div>
                <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                  Controle cada detalhe visual e funcional da página pública: ative banners de destaque,
                  configure avatar, efeitos dos cards, formulário de newsletter, som de clique, alinhamento
                  e meta tags SEO.
                </p>
              </div>
              <button
                onClick={onViewPublic}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
              >
                <Eye className="w-4 h-4" />
                <span>Visualizar Mudanças</span>
              </button>
            </div>

            {/* SECTION 1: TOP BANNER DE AVISO */}
            <section className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Faixa Superior de Destaque (Banner)</h3>
                    <p className="text-xs text-zinc-400">
                      Exibe um aviso ou chamada para ação no topo da página.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={features?.bannerEnabled || false}
                    onChange={(e) => onUpdateFeatures({ bannerEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {features?.bannerEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-300">Texto da Mensagem</label>
                    <input
                      type="text"
                      value={features?.bannerText || ''}
                      onChange={(e) => onUpdateFeatures({ bannerText: e.target.value })}
                      placeholder="Ex: 🚀 Repositório oficial configurado para Cloudflare Pages! Veja abaixo."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Link de Destino (Opcional)</label>
                    <input
                      type="text"
                      value={features?.bannerLink || ''}
                      onChange={(e) => onUpdateFeatures({ bannerLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Ícone do Banner</label>
                    <select
                      value={features?.bannerIcon || 'sparkles'}
                      onChange={(e) => onUpdateFeatures({ bannerIcon: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                    >
                      <option value="sparkles">Brilho (Sparkles ✨)</option>
                      <option value="megaphone">Megafone (Aviso 📢)</option>
                      <option value="rocket">Foguete (Lançamento 🚀)</option>
                      <option value="star">Estrela (Destaque ⭐)</option>
                      <option value="fire">Fogo (Trending 🔥)</option>
                      <option value="gift">Presente (Bônus 🎁)</option>
                      <option value="bell">Sino (Notificação 🔔)</option>
                    </select>
                  </div>

                  {/* Colors */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Cor de Fundo da Faixa</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={features?.bannerBgColor || '#06b6d4'}
                        onChange={(e) => onUpdateFeatures({ bannerBgColor: e.target.value })}
                        className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={features?.bannerBgColor || '#06b6d4'}
                        onChange={(e) => onUpdateFeatures({ bannerBgColor: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Cor do Texto da Faixa</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={features?.bannerTextColor || '#09090b'}
                        onChange={(e) => onUpdateFeatures({ bannerTextColor: e.target.value })}
                        className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={features?.bannerTextColor || '#09090b'}
                        onChange={(e) => onUpdateFeatures({ bannerTextColor: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 2: CABEÇALHO & CONTROLES DA PÁGINA */}
            <section className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Controles e Indicadores do Topo</h3>
                  <p className="text-xs text-zinc-400">
                    Defina quais botões e medidores aparecem no topo da página.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
                {/* Share Button Toggle */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Botão de Compartilhar</span>
                    <span className="text-[11px] text-zinc-400">
                      Permite aos visitantes copiar o link e gerar QR Code.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={features?.showShareButton !== false}
                    onChange={(e) => onUpdateFeatures({ showShareButton: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
                  />
                </div>

                {/* Sound Effects Toggle */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Efeitos Sonoros de Clique</span>
                      <button
                        onClick={testClickSound}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold hover:bg-cyan-500/30 transition-colors"
                      >
                        {soundTested ? 'Tocando! 🔊' : 'Testar Som'}
                      </button>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      Feedback sonoro sutil gerado via Web Audio.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={features?.soundEffectsEnabled ?? true}
                    onChange={(e) => onUpdateFeatures({ soundEffectsEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
                  />
                </div>

                {/* Views Counter Toggle & Label */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 sm:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Contador de Visualizações Público</span>
                      <span className="text-[11px] text-zinc-400">
                        Mostra a contagem de visitas no topo da página.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={features?.showViewsCounter ?? true}
                      onChange={(e) => onUpdateFeatures({ showViewsCounter: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
                    />
                  </div>

                  {features?.showViewsCounter && (
                    <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/80">
                      <label className="text-xs text-zinc-400 shrink-0">Rótulo do contador:</label>
                      <input
                        type="text"
                        value={features?.viewsLabel || ''}
                        onChange={(e) => onUpdateFeatures({ viewsLabel: e.target.value })}
                        placeholder="visualizações totais"
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500 flex-1 max-w-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 3: AVATAR & IDENTIDADE VISUAL */}
            <section className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Avatar e Estilo de Identidade</h3>
                  <p className="text-xs text-zinc-400">
                    Defina tamanho, formato, aura brilhante, alinhamento e selo de verificação.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-zinc-800">
                {/* Avatar Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Tamanho do Avatar</label>
                  <select
                    value={features?.avatarSize || 'lg'}
                    onChange={(e) => onUpdateFeatures({ avatarSize: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="sm">Pequeno (64px)</option>
                    <option value="md">Médio (80px)</option>
                    <option value="lg">Grande (96px / 112px)</option>
                    <option value="xl">Extra Grande (128px / 144px)</option>
                  </select>
                </div>

                {/* Avatar Shape */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Formato do Avatar</label>
                  <select
                    value={features?.avatarShape || 'circle'}
                    onChange={(e) => onUpdateFeatures({ avatarShape: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="circle">Circular (Redondo Total)</option>
                    <option value="rounded-3xl">Squircle (Bordas Super Arredondadas)</option>
                    <option value="rounded-xl">Arredondado Suave (2xl)</option>
                    <option value="square">Quadrado Reto (Sharp)</option>
                  </select>
                </div>

                {/* Avatar Glow / Ring */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Efeito de Borda / Brilho</label>
                  <select
                    value={features?.avatarGlow || 'gradient'}
                    onChange={(e) => onUpdateFeatures({ avatarGlow: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="gradient">Gradiente Cósmico (Ciano + Roxo)</option>
                    <option value="neon-cyan">Neon Ciano Intenso</option>
                    <option value="neon-purple">Neon Roxo Elétrico</option>
                    <option value="gold">Resplendor Dourado Real</option>
                    <option value="soft">Vidro / Translúcido Suave</option>
                    <option value="none">Nenhum (Sem borda)</option>
                  </select>
                </div>

                {/* Verified Badge Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Cor do Selo de Verificado</label>
                  <select
                    value={features?.verifiedBadgeColor || 'cyan'}
                    onChange={(e) => onUpdateFeatures({ verifiedBadgeColor: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="cyan">Ciano Oficial</option>
                    <option value="blue">Azul Céu</option>
                    <option value="gold">Dourado / Ouro</option>
                    <option value="purple">Roxo Imperial</option>
                    <option value="emerald">Verde Esmeralda</option>
                  </select>
                </div>

                {/* Bio Alignment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Alinhamento dos Textos</label>
                  <select
                    value={features?.bioAlignment || 'center'}
                    onChange={(e) => onUpdateFeatures({ bioAlignment: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="center">Centralizado</option>
                    <option value="left">Alinhado à Esquerda</option>
                    <option value="right">Alinhado à Direita</option>
                  </select>
                </div>

                {/* Show Location Toggle */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-zinc-300">Exibir Localização</span>
                    <input
                      type="checkbox"
                      checked={features?.showLocation !== false}
                      onChange={(e) => onUpdateFeatures({ showLocation: e.target.checked })}
                      className="rounded text-cyan-500 focus:ring-cyan-500"
                    />
                  </label>
                </div>
              </div>
            </section>

            {/* SECTION 4: BARRA DE REDES SOCIAIS */}
            <section className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Barra de Redes Sociais</h3>
                  <p className="text-xs text-zinc-400">
                    Posição, estilo visual e tamanho dos ícones de redes sociais.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Posição na Página</label>
                  <select
                    value={features?.socialPosition || 'top'}
                    onChange={(e) => onUpdateFeatures({ socialPosition: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="top">No Topo (Abaixo da Bio)</option>
                    <option value="bottom">No Rodapé (Abaixo dos Links)</option>
                    <option value="both">Em Ambos (Topo e Rodapé)</option>
                    <option value="hidden">Ocultar Redes Sociais</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Estilo dos Botões</label>
                  <select
                    value={features?.socialStyle || 'glass'}
                    onChange={(e) => onUpdateFeatures({ socialStyle: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="glass">Vidro Fosco (Glassmorphism)</option>
                    <option value="filled">Preenchido Sólido</option>
                    <option value="minimal">Minimalista (Sem Borda)</option>
                    <option value="pills">Pílulas Circulares</option>
                    <option value="colorful">Cards Escuros com Cores</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Tamanho dos Ícones</label>
                  <select
                    value={features?.socialIconSize || 'md'}
                    onChange={(e) => onUpdateFeatures({ socialIconSize: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="sm">Pequeno</option>
                    <option value="md">Padrão (Médio)</option>
                    <option value="lg">Grande</option>
                  </select>
                </div>
              </div>
            </section>

            {/* SECTION 5: ESTRUTURA E COMPORTAMENTO DOS LINKS */}
            <section className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Layout e Comportamento dos Links</h3>
                  <p className="text-xs text-zinc-400">
                    Formato de colunas, animações de hover, contadores públicos e comportamento de abas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-zinc-800">
                {/* Layout Columns */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Estrutura de Colunas</label>
                  <select
                    value={features?.layoutColumns || '1'}
                    onChange={(e) => onUpdateFeatures({ layoutColumns: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="1">1 Coluna Central (Tradicional)</option>
                    <option value="2">2 Colunas em Grade (Grid)</option>
                  </select>
                </div>

                {/* Hover Effect */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Efeito ao Passar o Mouse (Hover)</label>
                  <select
                    value={features?.cardHoverEffect || 'scale'}
                    onChange={(e) => onUpdateFeatures({ cardHoverEffect: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="scale">Zoom Leve (Scale)</option>
                    <option value="lift">Elevação 3D (Lift)</option>
                    <option value="glow">Brilho Neon (Glow)</option>
                    <option value="bounce">Salto Elástico (Bounce)</option>
                    <option value="none">Estático (Nenhum)</option>
                  </select>
                </div>

                {/* Highlight Animation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Estilo de Destaque Animado</label>
                  <select
                    value={features?.highlightStyle || 'pulse'}
                    onChange={(e) => onUpdateFeatures({ highlightStyle: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="pulse">Pulso Suave (Padrão)</option>
                    <option value="shimmer">Shimmer Cristalino</option>
                    <option value="rainbow">Gradiente Colorido</option>
                    <option value="glow">Aura Neon Glow</option>
                  </select>
                </div>
              </div>

              {/* Toggles for Links Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-zinc-800">
                <label className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-zinc-300 font-medium">Exibir Ícones</span>
                  <input
                    type="checkbox"
                    checked={features?.showLinkIcons !== false}
                    onChange={(e) => onUpdateFeatures({ showLinkIcons: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-500"
                  />
                </label>

                <label className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-zinc-300 font-medium">Exibir Subtítulos</span>
                  <input
                    type="checkbox"
                    checked={features?.showLinkSubtitles !== false}
                    onChange={(e) => onUpdateFeatures({ showLinkSubtitles: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-500"
                  />
                </label>

                <label className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-zinc-300 font-medium">Abrir em Nova Aba</span>
                  <input
                    type="checkbox"
                    checked={features?.openInNewTab !== false}
                    onChange={(e) => onUpdateFeatures({ openInNewTab: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-500"
                  />
                </label>

                <label className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-zinc-300 font-medium">Cliques Públicos</span>
                  <input
                    type="checkbox"
                    checked={features?.showClicksPublicly || false}
                    onChange={(e) => onUpdateFeatures({ showClicksPublicly: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-500"
                  />
                </label>
              </div>
            </section>

            {/* SECTION 6: CAPTURA DE LEADS / NEWSLETTER */}
            <section className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Módulo de Newsletter e Captura de Leads</h3>
                    <p className="text-xs text-zinc-400">
                      Adiciona uma caixa interativa para os visitantes cadastrarem e-mails diretamente no seu site.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={features?.newsletterEnabled || false}
                    onChange={(e) => onUpdateFeatures({ newsletterEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {features?.newsletterEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Título da Caixa</label>
                    <input
                      type="text"
                      value={features?.newsletterTitle || ''}
                      onChange={(e) => onUpdateFeatures({ newsletterTitle: e.target.value })}
                      placeholder="💌 Fique por dentro das novidades"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Texto do Botão</label>
                    <input
                      type="text"
                      value={features?.newsletterButtonText || ''}
                      onChange={(e) => onUpdateFeatures({ newsletterButtonText: e.target.value })}
                      placeholder="Inscrever-se"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-300">Subtítulo Convidativo</label>
                    <input
                      type="text"
                      value={features?.newsletterSubtitle || ''}
                      onChange={(e) => onUpdateFeatures({ newsletterSubtitle: e.target.value })}
                      placeholder="Receba lançamentos de novos projetos e atualizações exclusivas no seu e-mail."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-300">Mensagem de Sucesso</label>
                    <input
                      type="text"
                      value={features?.newsletterSuccessMessage || ''}
                      onChange={(e) => onUpdateFeatures({ newsletterSuccessMessage: e.target.value })}
                      placeholder="Obrigado por se inscrever! Entraremos em contato em breve."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 7: RODAPÉ & ACESSO RESTRITO */}
            <section className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Rodapé & Acesso Restrito</h3>
                  <p className="text-xs text-zinc-400">
                    O acesso ao painel de administração é exclusivo pela URL <code className="text-cyan-400 font-mono font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded">/admin</code>. Nenhum botão público é exibido aos visitantes.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 text-xs text-cyan-300 flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>
                  Para entrar no painel: basta digitar <strong>/admin</strong> no final da URL no navegador.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300">Texto do Rodapé</label>
                  <input
                    type="text"
                    value={profile.footerText || ''}
                    onChange={(e) => onUpdateProfile({ footerText: e.target.value })}
                    placeholder="Criado com Linktree • Feito para você"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2 sm:col-span-2">
                  <label className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between flex-1 cursor-pointer">
                    <span className="text-xs text-zinc-300 font-medium">
                      Repetir Ícones Sociais no Rodapé
                    </span>
                    <input
                      type="checkbox"
                      checked={features?.footerSocials || false}
                      onChange={(e) => onUpdateFeatures({ footerSocials: e.target.checked })}
                      className="rounded text-cyan-500 focus:ring-cyan-500"
                    />
                  </label>
                </div>
              </div>
            </section>

            {/* SECTION 8: SEO & METADADOS DO NAVEGADOR */}
            <section className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SEO & Metadados do Navegador</h3>
                  <p className="text-xs text-zinc-400">
                    Otimize como sua página aparece na aba do navegador e nos mecanismos de busca.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Título da Página na Aba do Navegador (&lt;title&gt;)
                  </label>
                  <input
                    type="text"
                    value={features?.pageTitle || ''}
                    onChange={(e) => onUpdateFeatures({ pageTitle: e.target.value })}
                    placeholder="Manu | Árvore de Links Oficial"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Meta Descrição SEO (&lt;meta name="description"&gt;)
                  </label>
                  <textarea
                    rows={2}
                    value={features?.metaDescription || ''}
                    onChange={(e) => onUpdateFeatures({ metaDescription: e.target.value })}
                    placeholder="Confira todos os links, projetos, redes sociais e chave pix de Manu."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: LINKS MANAGER */}
        {/* ======================================================== */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Seus Links Cadastrados</span>
                  <span className="text-xs font-normal text-zinc-400">
                    ({links.filter((l) => l.isActive).length} ativos)
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Adicione, edite, reorganize e ative ou desative links na sua árvore em tempo real.
                </p>
              </div>

              {/* Add Link Dropdown / Quick Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleStartCreateLink('link')}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Link</span>
                </button>

                <button
                  onClick={() => handleStartCreateLink('pix')}
                  className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Adicionar Chave Pix"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pix</span>
                </button>

                <button
                  onClick={() => handleStartCreateLink('whatsapp')}
                  className="px-3 py-2 rounded-xl bg-emerald-700/20 hover:bg-emerald-700/30 text-emerald-400 border border-emerald-600/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Adicionar WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => handleStartCreateLink('youtube')}
                  className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Vídeo YouTube"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                </button>

                <button
                  onClick={() => handleStartCreateLink('header')}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                  title="Novo Cabeçalho de Seção"
                >
                  <span>+ Seção</span>
                </button>
              </div>
            </div>

            {/* Links List */}
            <div className="space-y-3">
              {links.map((link, index) => {
                const isHeader = link.type === 'header';
                return (
                  <div
                    key={link.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      link.isActive
                        ? 'bg-zinc-900/80 border-zinc-800'
                        : 'bg-zinc-950/60 border-zinc-900 opacity-60'
                    }`}
                  >
                    {/* Left Reorder & Icon */}
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-0.5">
                        <button
                          disabled={index === 0}
                          onClick={() => onMoveLink(index, 'up')}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === links.length - 1}
                          onClick={() => onMoveLink(index, 'down')}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-cyan-400 shrink-0">
                        <IconRenderer iconName={link.icon || 'link'} className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {link.title}
                        </span>
                        {link.highlightBadge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-cyan-400 text-zinc-950">
                            {link.highlightBadge}
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {link.type}
                        </span>
                      </div>
                      {!isHeader && (
                        <div className="text-xs text-zinc-400 truncate mt-0.5 flex items-center gap-3">
                          <span className="truncate">{link.url}</span>
                          <span className="text-cyan-400 font-mono shrink-0">
                            {link.clicks || 0} cliques
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle Active */}
                      <button
                        onClick={() => onToggleLinkActive(link.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          link.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                        }`}
                      >
                        {link.isActive ? 'Ativo' : 'Oculto'}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingLink(link);
                          setIsCreatingNew(false);
                        }}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Editar Link"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja excluir "${link.title}"?`)) {
                            onDeleteLink(link.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Excluir Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PROFILE & SOCIALS */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                <span>Informações Pessoais & Apresentação</span>
              </h2>

              {/* Avatar Uploader & Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border-2 border-cyan-400 shadow-md shrink-0">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Foto do Perfil (URL ou Arquivo)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={profile.avatarUrl}
                      onChange={(e) => onUpdateProfile({ avatarUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-cyan-500 font-mono"
                    />
                    <label className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Name, Handle, Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Seu Nome</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => onUpdateProfile({ name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">@Handle / Usuário</label>
                  <input
                    type="text"
                    value={profile.handle}
                    onChange={(e) => onUpdateProfile({ handle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Localização</label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => onUpdateProfile({ location: e.target.value })}
                    placeholder="Brasil 🇧🇷"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Verified Badge Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verified-check"
                  checked={profile.verified}
                  onChange={(e) => onUpdateProfile({ verified: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="verified-check"
                  className="text-xs text-zinc-300 font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Exibir Selo de Verificado ao lado da foto</span>
                </label>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Biografia / Apresentação</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => onUpdateProfile({ bio: e.target.value })}
                  placeholder="Escreva algo sobre você..."
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* Social Links Form */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Redes Sociais & Contatos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/seuuser' },
                    { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/55...' },
                    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/seuuser' },
                    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/seuuser' },
                    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@seuuser' },
                    { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/seuuser' },
                    { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/seuuser' },
                    { key: 'email', label: 'E-mail de Contato', placeholder: 'seuemail@gmail.com' },
                    { key: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/...' },
                    { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@seuuser' },
                    { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/...' },
                    { key: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/...' },
                  ].map((s) => (
                    <div key={s.key} className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300 capitalize flex items-center gap-1.5">
                        <IconRenderer iconName={s.key} className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{s.label}</span>
                      </label>
                      <input
                        type="text"
                        value={(profile.socialLinks as any)[s.key] || ''}
                        onChange={(e) =>
                          onUpdateProfile({
                            socialLinks: {
                              ...profile.socialLinks,
                              [s.key]: e.target.value,
                            },
                          })
                        }
                        placeholder={s.placeholder}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: THEMES & CUSTOM DESIGN STUDIO */}
        {/* ======================================================== */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-cyan-400" />
                  <span>Temas Prontos Exclusivos</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Selecione um dos 9 temas profissionais otimizados para alta legibilidade e conversão.
                </p>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(THEME_PRESETS).map((t) => {
                  const isSelected = theme.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelectThemePreset(t.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-zinc-900 border-cyan-400 ring-2 ring-cyan-400/40 shadow-xl shadow-cyan-500/10'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{t.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>

                      {/* Mini preview card */}
                      <div
                        className={`w-full p-2.5 rounded-xl ${t.backgroundClass} border border-white/10 flex flex-col items-center gap-1.5 shadow-inner`}
                      >
                        <div className="w-6 h-6 rounded-full bg-white/20" />
                        <div
                          className={`w-full p-1.5 rounded-md ${t.cardClass} text-[10px] text-center font-bold truncate`}
                        >
                          Exemplo de Link
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Button Shape */}
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Formato dos Botões de Links
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'rounded-full', label: 'Pílula (Arredondado Total)' },
                    { id: 'rounded-2xl', label: 'Moderno (Arredondado 2xl)' },
                    { id: 'rounded-lg', label: 'Suave (Arredondado lg)' },
                    { id: 'rounded-none', label: 'Retangular (Sharp)' },
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => onUpdateTheme({ ...theme, buttonShape: shape.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                        theme.buttonShape === shape.id
                          ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-md'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Background Image URL */}
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Imagem de Fundo Customizada (Opcional)
                </label>
                <input
                  type="text"
                  value={theme.customBgUrl || ''}
                  onChange={(e) => onUpdateTheme({ ...theme, customBgUrl: e.target.value })}
                  placeholder="https://exemplo.com/imagem-fundo.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* CUSTOM COLORS STUDIO */}
              <div className="pt-6 border-t border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="w-4 h-4 text-purple-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Estúdio de Cores Livres</h3>
                      <p className="text-xs text-zinc-400">
                        Substitua as cores do preset por cores personalizadas.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={features?.customDesign?.useCustomColors || false}
                      onChange={(e) =>
                        onUpdateFeatures({
                          customDesign: {
                            ...features.customDesign,
                            useCustomColors: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {features?.customDesign?.useCustomColors && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-zinc-800 animate-fadeIn">
                    {/* Background Type */}
                    <div className="space-y-1.5 sm:col-span-2 md:col-span-3">
                      <label className="text-xs font-semibold text-zinc-300">Tipo de Fundo</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateFeatures({
                              customDesign: {
                                ...features.customDesign,
                                backgroundType: 'solid',
                              },
                            })
                          }
                          className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                            features.customDesign.backgroundType === 'solid'
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                          }`}
                        >
                          Cor Sólida
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateFeatures({
                              customDesign: {
                                ...features.customDesign,
                                backgroundType: 'gradient',
                              },
                            })
                          }
                          className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                            features.customDesign.backgroundType === 'gradient'
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                          }`}
                        >
                          Gradiente em Ângulo
                        </button>
                      </div>
                    </div>

                    {features.customDesign.backgroundType === 'solid' ? (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-300">Cor de Fundo Sólida</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={features.customDesign.solidBgColor}
                            onChange={(e) =>
                              onUpdateFeatures({
                                customDesign: {
                                  ...features.customDesign,
                                  solidBgColor: e.target.value,
                                },
                              })
                            }
                            className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={features.customDesign.solidBgColor}
                            onChange={(e) =>
                              onUpdateFeatures({
                                customDesign: {
                                  ...features.customDesign,
                                  solidBgColor: e.target.value,
                                },
                              })
                            }
                            className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono uppercase"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-300">Início do Gradiente</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={features.customDesign.gradientStart}
                              onChange={(e) =>
                                onUpdateFeatures({
                                  customDesign: {
                                    ...features.customDesign,
                                    gradientStart: e.target.value,
                                  },
                                })
                              }
                              className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={features.customDesign.gradientStart}
                              onChange={(e) =>
                                onUpdateFeatures({
                                  customDesign: {
                                    ...features.customDesign,
                                    gradientStart: e.target.value,
                                  },
                                })
                              }
                              className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono uppercase"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-300">Fim do Gradiente</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={features.customDesign.gradientEnd}
                              onChange={(e) =>
                                onUpdateFeatures({
                                  customDesign: {
                                    ...features.customDesign,
                                    gradientEnd: e.target.value,
                                  },
                                })
                              }
                              className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={features.customDesign.gradientEnd}
                              onChange={(e) =>
                                onUpdateFeatures({
                                  customDesign: {
                                    ...features.customDesign,
                                    gradientEnd: e.target.value,
                                  },
                                })
                              }
                              className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono uppercase"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Card Bg Color */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Fundo dos Cards</label>
                      <input
                        type="text"
                        value={features.customDesign.cardBgColor}
                        onChange={(e) =>
                          onUpdateFeatures({
                            customDesign: {
                              ...features.customDesign,
                              cardBgColor: e.target.value,
                            },
                          })
                        }
                        placeholder="rgba(24, 24, 27, 0.8)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
                      />
                    </div>

                    {/* Card Text Color */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Texto dos Cards</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={features.customDesign.cardTextColor}
                          onChange={(e) =>
                            onUpdateFeatures({
                              customDesign: {
                                ...features.customDesign,
                                cardTextColor: e.target.value,
                              },
                            })
                          }
                          className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={features.customDesign.cardTextColor}
                          onChange={(e) =>
                            onUpdateFeatures({
                              customDesign: {
                                ...features.customDesign,
                                cardTextColor: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono uppercase"
                        />
                      </div>
                    </div>

                    {/* Card Border Color */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Borda dos Cards</label>
                      <input
                        type="text"
                        value={features.customDesign.cardBorderColor}
                        onChange={(e) =>
                          onUpdateFeatures({
                            customDesign: {
                              ...features.customDesign,
                              cardBorderColor: e.target.value,
                            },
                          })
                        }
                        placeholder="#27272a"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: LEADS & NEWSLETTER SUBSCRIBERS */}
        {/* ======================================================== */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <span>Contatos & Leads Capturados ({leads?.length || 0})</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Visitantes que se inscreveram através da caixa de newsletter na sua página pública.
                  </p>
                </div>

                {leads && leads.length > 0 && (
                  <button
                    onClick={exportLeadsCsv}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar CSV</span>
                  </button>
                )}
              </div>

              {/* Leads Table */}
              {leads && leads.length > 0 ? (
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        <th className="py-2.5 px-3 font-semibold">Nome</th>
                        <th className="py-2.5 px-3 font-semibold">E-mail</th>
                        <th className="py-2.5 px-3 font-semibold">Data de Inscrição</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-white">
                            {lead.name || <span className="text-zinc-500 italic">Não informado</span>}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-cyan-300">{lead.email}</td>
                          <td className="py-2.5 px-3 text-zinc-400">
                            {new Date(lead.createdAt).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {onDeleteLead && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Excluir o lead ${lead.email}?`)) {
                                    onDeleteLead(lead.id);
                                  }
                                }}
                                className="p-1 rounded-lg hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Excluir Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2 border border-dashed border-zinc-800 rounded-2xl">
                  <Mail className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs font-medium text-zinc-400">Nenhum lead capturado ainda.</p>
                  <p className="text-[11px] text-zinc-500">
                    Certifique-se de que o Módulo de Newsletter está ativado na aba "Personalizar Front-end".
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: ANALYTICS */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total de Visitas</span>
                <div className="text-3xl font-black text-white font-mono mt-1">
                  {profile.views}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total de Cliques</span>
                <div className="text-3xl font-black text-cyan-400 font-mono mt-1">
                  {totalClicks}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Taxa de Clique (CTR)</span>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                  {ctr}%
                </div>
              </div>
            </div>

            {/* Links Performance Ranking */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span>Desempenho por Link</span>
              </h3>

              <div className="space-y-3">
                {links
                  .filter((l) => l.type !== 'header')
                  .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
                  .map((link) => {
                    const percent =
                      totalClicks > 0 ? (((link.clicks || 0) / totalClicks) * 100).toFixed(1) : '0';
                    return (
                      <div key={link.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white truncate max-w-md">
                            {link.title}
                          </span>
                          <span className="font-mono text-cyan-400 font-bold">
                            {link.clicks || 0} cliques ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: DEPLOY TO CLOUDFLARE PAGES & GITHUB */}
        {/* ======================================================== */}
        {activeTab === 'deploy' && (
          <div className="space-y-6">
            {/* Download ZIP Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-zinc-900/60 to-zinc-900/60 border border-emerald-800/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Download className="w-5 h-5" />
                    <h2 className="text-base font-bold text-white">
                      Baixar Arquivo ZIP do Site Completo
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Código-fonte 100% pronto para rodar localmente com <code className="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded">npm install</code> e <code className="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded">npm run dev</code> ou hospedar em Cloudflare Pages, Vercel ou Netlify.
                  </p>
                </div>
                <a
                  href="/site-linktree.zip"
                  download="site-linktree.zip"
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar site-linktree.zip</span>
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5">
              <div className="flex items-center gap-2 text-cyan-400">
                <Github className="w-6 h-6" />
                <h2 className="text-base font-bold text-white">
                  Instruções para Subir no GitHub e Cloudflare Pages
                </h2>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Este projeto foi configurado com suporte total para <strong>Cloudflare Pages</strong>.
                Você pode clonar ou vincular o repositório remoto informado pelo usuário:
              </p>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs text-cyan-300 truncate select-all">
                https://github.com/manu0916/Linktree.git
              </div>

              {/* Terminal Code Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold">Comandos para executar no seu terminal:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(gitCommands);
                      setCopiedGit(true);
                      setTimeout(() => setCopiedGit(false), 2000);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {copiedGit ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGit ? 'Copiado!' : 'Copiar Comandos'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                  {gitCommands}
                </pre>
              </div>

              {/* Cloudflare Pages Checklist */}
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-900/40 space-y-2">
                <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  Configuração no painel da Cloudflare:
                </h3>
                <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong>Framework Preset:</strong> Vite
                  </li>
                  <li>
                    <strong>Build Command:</strong>{' '}
                    <code className="bg-zinc-900 px-1 py-0.5 rounded text-cyan-300">
                      npm run build
                    </code>
                  </li>
                  <li>
                    <strong>Build Output Directory:</strong>{' '}
                    <code className="bg-zinc-900 px-1 py-0.5 rounded text-cyan-300">dist</code>
                  </li>
                  <li>
                    <strong>Node.js Version:</strong> 18 ou superior
                  </li>
                </ul>
              </div>
            </div>

            {/* Backup & Reset */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Resetar para Padrão</h3>
                <p className="text-xs text-zinc-400">
                  Restaura os links, configurações e perfil padrão de Manu caso deseje recomeçar.
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja restaurar as configurações originais?')) {
                    onResetToDefault();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Restaurar Padrão
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* EDIT / CREATE LINK MODAL */}
      {/* ======================================================== */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden text-zinc-100 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                <span>{isCreatingNew ? 'Adicionar Novo Link' : 'Editar Link'}</span>
              </h3>
              <button
                onClick={() => setEditingLink(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLinkForm} className="space-y-4">
              {/* Type selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Tipo de Item</label>
                <select
                  value={editingLink.type || 'link'}
                  onChange={(e) => setEditingLink({ ...editingLink, type: e.target.value as LinkType })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                >
                  <option value="link">Link Padrão (Website / URL)</option>
                  <option value="header">Cabeçalho / Divisor de Seção</option>
                  <option value="whatsapp">Botão WhatsApp Direto</option>
                  <option value="pix">Chave Pix Interativa</option>
                  <option value="youtube">Vídeo do YouTube (Player)</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Título</label>
                <input
                  type="text"
                  required
                  value={editingLink.title || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  placeholder="Ex: Meu Portfólio, Chave Pix, Instagram"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              {/* Subtitle (only for non-headers) */}
              {editingLink.type !== 'header' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Subtítulo / Descrição</label>
                  <input
                    type="text"
                    value={editingLink.subtitle || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, subtitle: e.target.value })}
                    placeholder="Ex: Orçamentos, novos artigos, etc."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* URL input */}
              {editingLink.type !== 'header' && editingLink.type !== 'whatsapp' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    {editingLink.type === 'youtube' ? 'URL do Vídeo no YouTube' : 'Destino (URL)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLink.url || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                    placeholder={
                      editingLink.type === 'youtube'
                        ? 'https://www.youtube.com/watch?v=...'
                        : 'https://...'
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              )}

              {/* WhatsApp specific fields */}
              {editingLink.type === 'whatsapp' && (
                <div className="space-y-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">
                      Número do WhatsApp (com DDD)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingLink.whatsappNumber || ''}
                      onChange={(e) => setEditingLink({ ...editingLink, whatsappNumber: e.target.value })}
                      placeholder="Ex: 5511999999999"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">
                      Mensagem Inicial Pré-preenchida
                    </label>
                    <input
                      type="text"
                      value={editingLink.whatsappMessage || ''}
                      onChange={(e) => setEditingLink({ ...editingLink, whatsappMessage: e.target.value })}
                      placeholder="Olá Manu! Gostaria de conversar..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Pix specific fields */}
              {editingLink.type === 'pix' && (
                <div className="space-y-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Chave Pix</label>
                    <input
                      type="text"
                      required
                      value={editingLink.pixKey || ''}
                      onChange={(e) => setEditingLink({ ...editingLink, pixKey: e.target.value })}
                      placeholder="manu4432d@gmail.com ou CPF/celular"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Nome do Beneficiário</label>
                    <input
                      type="text"
                      value={editingLink.pixName || ''}
                      onChange={(e) => setEditingLink({ ...editingLink, pixName: e.target.value })}
                      placeholder="Manu"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Icon & Highlight */}
              {editingLink.type !== 'header' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Ícone ou Emoji</label>
                    <input
                      type="text"
                      value={editingLink.icon || ''}
                      onChange={(e) => setEditingLink({ ...editingLink, icon: e.target.value })}
                      placeholder="github, globe, 🚀, pix..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Selo (Ex: NOVO)</label>
                    <input
                      type="text"
                      value={editingLink.highlightBadge || ''}
                      onChange={(e) =>
                        setEditingLink({
                          ...editingLink,
                          highlightBadge: e.target.value,
                          isHighlighted: !!e.target.value,
                        })
                      }
                      placeholder="DESTAQUE, NOVO"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500 uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Highlight Glow Checkbox */}
              {editingLink.type !== 'header' && (
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={editingLink.isHighlighted || false}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, isHighlighted: e.target.checked })
                    }
                    className="rounded text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>Efeito de Destaque Animado (Glow / Pulso)</span>
                </label>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-cyan-600/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* IMPORT JSON MODAL */}
      {/* ======================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden text-zinc-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Restaurar Backup JSON</span>
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={5}
              placeholder="Cole aqui o conteúdo JSON do seu backup..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 focus:border-cyan-500 outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                disabled={!importText.trim()}
                onClick={() => {
                  const ok = onImportData(importText);
                  if (ok) {
                    setShowImportModal(false);
                    setImportText('');
                    alert('Backup importado com sucesso!');
                  } else {
                    alert('JSON inválido.');
                  }
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold disabled:opacity-50"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
