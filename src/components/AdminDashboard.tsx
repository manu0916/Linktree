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
  Settings,
  Github,
  Globe,
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
  RefreshCw,
} from 'lucide-react';
import { LinktreeState, LinkItem, ProfileData, ThemeConfig, ThemePresetId, LinkType } from '../types/linktree';
import { THEME_PRESETS, ADMIN_CREDENTIALS } from '../data/defaultData';
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
  onExportData,
  onImportData,
  onResetToDefault,
  onLogout,
  onViewPublic,
  totalClicks,
}) => {
  const [activeTab, setActiveTab] = useState<'links' | 'profile' | 'appearance' | 'analytics' | 'deploy'>('links');
  const [editingLink, setEditingLink] = useState<Partial<LinkItem> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [previewMobile, setPreviewMobile] = useState(false);

  const { profile, links, theme } = state;

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

    // Format embed url if youtube
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

    // Format WhatsApp url
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
git commit -m "feat: linktree com painel admin e temas"
git branch -M main
git push -u origin main

# No Cloudflare Pages:
# 1. Conecte sua conta do GitHub
# 2. Selecione o repositório 'Linktree'
# 3. Framework preset: Vite
# 4. Build command: npm run build
# 5. Build output directory: dist`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Admin Indicator */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-cyan-500/20">
                LT
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-extrabold text-white tracking-wide">
                    PAINEL ADMINISTRATIVO
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono truncate max-w-[200px]">
                  {ADMIN_CREDENTIALS.email}
                </p>
              </div>
            </div>

            {/* View Public Button on Mobile */}
            <div className="flex sm:hidden items-center gap-1.5">
              <button
                onClick={onViewPublic}
                className="p-2 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden md:flex items-center gap-4 bg-zinc-950/80 px-4 py-1.5 rounded-2xl border border-zinc-800 text-xs">
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
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onViewPublic}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Página Pública</span>
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
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-zinc-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'links', label: 'Gerenciar Links', icon: LinkIcon, badge: links.length },
            { id: 'profile', label: 'Meu Perfil & Redes', icon: User },
            { id: 'appearance', label: 'Temas & Estilo', icon: Palette },
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
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-zinc-300 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
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
        {/* TAB 1: LINKS MANAGER */}
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

              {/* Add Link Dropdown / Presets */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <button
                  onClick={() => handleStartCreateLink('link')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Link</span>
                </button>

                <button
                  onClick={() => handleStartCreateLink('header')}
                  className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Criar Divisor / Título de Seção"
                >
                  <span>+ Divisor</span>
                </button>

                <button
                  onClick={() => handleStartCreateLink('pix')}
                  className="px-3 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Criar Link Pix"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Pix</span>
                </button>
              </div>
            </div>

            {/* Links List */}
            {links.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
                <LinkIcon className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-300">Nenhum link adicionado ainda</h3>
                <p className="text-xs text-zinc-500">
                  Clique no botão acima para adicionar seu primeiro link ou divisor.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {links.map((link, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === links.length - 1;

                  return (
                    <div
                      key={link.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        link.isActive
                          ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-950/60 border-zinc-900 opacity-60'
                      }`}
                    >
                      {/* Left info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Drag / Reorder Controls */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            disabled={isFirst}
                            onClick={() => onMoveLink(idx, 'up')}
                            className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                            title="Mover para cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={isLast}
                            onClick={() => onMoveLink(idx, 'down')}
                            className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Icon badge */}
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0">
                          <IconRenderer iconName={link.icon || (link.type === 'header' ? 'file-text' : 'link')} className="w-5 h-5" />
                        </div>

                        {/* Text info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white truncate">
                              {link.title}
                            </h4>
                            {link.type === 'header' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
                                SEÇÃO
                              </span>
                            )}
                            {link.isHighlighted && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                {link.highlightBadge || 'DESTAQUE'}
                              </span>
                            )}
                            {link.type === 'pix' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                PIX
                              </span>
                            )}
                          </div>
                          {link.subtitle && (
                            <p className="text-xs text-zinc-400 truncate mt-0.5">
                              {link.subtitle}
                            </p>
                          )}
                          {link.url && link.type !== 'header' && (
                            <span className="text-[11px] text-zinc-500 font-mono truncate block mt-0.5">
                              {link.url}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60 shrink-0">
                        {/* Clicks counter */}
                        {link.type !== 'header' && (
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-cyan-400">
                              {link.clicks || 0}
                            </span>
                            <span className="text-[10px] text-zinc-500 block">cliques</span>
                          </div>
                        )}

                        {/* Active toggle */}
                        <button
                          onClick={() => onToggleLinkActive(link.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            link.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {link.isActive ? 'Ativo' : 'Pausado'}
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() => {
                            setIsCreatingNew(false);
                            setEditingLink({ ...link });
                          }}
                          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Editar Link"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja realmente excluir "${link.title}"?`)) {
                              onDeleteLink(link.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Excluir Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE & SOCIAL NETWORKS */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                <span>Informações do Perfil</span>
              </h2>

              {/* Avatar Uploader / URL */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-zinc-800">
                <div className="relative group">
                  <img
                    src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400 shadow-xl"
                  />
                  <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold">
                    <Upload className="w-4 h-4 mb-0.5" />
                    <span>Alterar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    URL da Foto de Perfil
                  </label>
                  <input
                    type="text"
                    value={profile.avatarUrl}
                    onChange={(e) => onUpdateProfile({ avatarUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-cyan-500"
                  />
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span>Ou selecione um preset:</span>
                    <button
                      type="button"
                      onClick={() => onUpdateProfile({ avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80' })}
                      className="text-cyan-400 hover:underline"
                    >
                      Avatar 1
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => onUpdateProfile({ avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80' })}
                      className="text-cyan-400 hover:underline"
                    >
                      Avatar 2
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => onUpdateProfile({ avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' })}
                      className="text-cyan-400 hover:underline"
                    >
                      Avatar 3
                    </button>
                  </div>
                </div>
              </div>

              {/* Name, Handle, Verified */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => onUpdateProfile({ name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Handle (@usuário)
                  </label>
                  <input
                    type="text"
                    value={profile.handle}
                    onChange={(e) => onUpdateProfile({ handle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Biografia Curta
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => onUpdateProfile({ bio: e.target.value })}
                  placeholder="Escreva algo sobre você, seus projetos ou propósito..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              {/* Location & Verified Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Localização (Opcional)
                  </label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => onUpdateProfile({ location: e.target.value })}
                    placeholder="Brasil 🇧🇷 ou São Paulo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-xs">
                    <span className="font-semibold text-white block">Selo de Verificado</span>
                    <span className="text-[11px] text-zinc-400">Exibe ícone azul ao lado da foto</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateProfile({ verified: !profile.verified })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      profile.verified
                        ? 'bg-cyan-500 text-zinc-950 shadow-md'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {profile.verified ? 'Ativado' : 'Desativado'}
                  </button>
                </div>
              </div>

              {/* Footer text */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Texto do Rodapé
                </label>
                <input
                  type="text"
                  value={profile.footerText}
                  onChange={(e) => onUpdateProfile({ footerText: e.target.value })}
                  placeholder="Criado com Linktree • Feito para você"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Social Media Links Box */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>Ícones de Redes Sociais no Perfil</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Os ícones das redes preenchidas aparecerão logo abaixo da sua biografia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/seuuser' },
                  { key: 'whatsapp', label: 'WhatsApp (Link Direto)', placeholder: 'https://wa.me/55...' },
                  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/seuuser' },
                  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/seuuser' },
                  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@seuuser' },
                  { key: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/seuuser' },
                  { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/seuuser' },
                  { key: 'email', label: 'E-mail de Contato', placeholder: 'seuemail@gmail.com' },
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
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-cyan-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: THEMES & APPEARANCE */}
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
                      <div className={`w-full p-2.5 rounded-xl ${t.backgroundClass} border border-white/10 flex flex-col items-center gap-1.5 shadow-inner`}>
                        <div className="w-6 h-6 rounded-full bg-white/20" />
                        <div className={`w-full p-1.5 rounded-md ${t.cardClass} text-[10px] text-center font-bold truncate`}>
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS */}
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
                    const percent = totalClicks > 0 ? (((link.clicks || 0) / totalClicks) * 100).toFixed(1) : '0';
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

        {/* TAB 5: DEPLOY TO CLOUDFLARE PAGES & GITHUB */}
        {activeTab === 'deploy' && (
          <div className="space-y-6">
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
                  <li><strong>Framework Preset:</strong> Vite</li>
                  <li><strong>Build Command:</strong> <code className="bg-zinc-900 px-1 py-0.5 rounded text-cyan-300">npm run build</code></li>
                  <li><strong>Build Output Directory:</strong> <code className="bg-zinc-900 px-1 py-0.5 rounded text-cyan-300">dist</code></li>
                  <li><strong>Node.js Version:</strong> 18 ou superior</li>
                </ul>
              </div>
            </div>

            {/* Backup & Reset */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Resetar para Padrão</h3>
                <p className="text-xs text-zinc-400">
                  Restaura os links e perfil padrão de Manu caso deseje recomeçar.
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

      {/* EDIT / CREATE LINK MODAL */}
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
                    placeholder={editingLink.type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://...'}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              )}

              {/* WhatsApp specific fields */}
              {editingLink.type === 'whatsapp' && (
                <div className="space-y-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Número do WhatsApp (com DDD)</label>
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
                    <label className="text-xs font-semibold text-zinc-300">Mensagem Inicial Pré-preenchida</label>
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
                    onChange={(e) => setEditingLink({ ...editingLink, isHighlighted: e.target.checked })}
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

      {/* IMPORT JSON MODAL */}
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
