import React, { useState } from 'react';
import {
  CheckCircle2,
  MapPin,
  Share2,
  ExternalLink,
  Lock,
  Sparkles,
  Play,
  MessageCircle,
  QrCode,
  Shield,
  Sliders,
} from 'lucide-react';
import { LinktreeState, LinkItem } from '../types/linktree';
import { IconRenderer } from './IconRenderer';
import { PixModal } from './PixModal';
import { ShareModal } from './ShareModal';

interface PublicViewProps {
  state: LinktreeState;
  isAdmin: boolean;
  onLinkClick: (linkId: string) => void;
  onOpenAdminLogin: () => void;
  onOpenAdminDashboard: () => void;
}

export const PublicView: React.FC<PublicViewProps> = ({
  state,
  isAdmin,
  onLinkClick,
  onOpenAdminLogin,
  onOpenAdminDashboard,
}) => {
  const { profile, links, theme } = state;

  const [activePixLink, setActivePixLink] = useState<LinkItem | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);

  // Active sorted links
  const activeLinks = links
    .filter((l) => l.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleLinkAction = (e: React.MouseEvent, link: LinkItem) => {
    onLinkClick(link.id);

    if (link.type === 'pix') {
      e.preventDefault();
      setActivePixLink(link);
      return;
    }

    if (link.type === 'youtube' && link.embedUrl) {
      e.preventDefault();
      setExpandedVideoId(expandedVideoId === link.id ? null : link.id);
      return;
    }

    // Standard links will open naturally via <a>
  };

  const socialItems = [
    { key: 'instagram', icon: 'instagram', url: profile.socialLinks.instagram, label: 'Instagram' },
    { key: 'whatsapp', icon: 'whatsapp', url: profile.socialLinks.whatsapp, label: 'WhatsApp' },
    { key: 'github', icon: 'github', url: profile.socialLinks.github, label: 'GitHub' },
    { key: 'linkedin', icon: 'linkedin', url: profile.socialLinks.linkedin, label: 'LinkedIn' },
    { key: 'youtube', icon: 'youtube', url: profile.socialLinks.youtube, label: 'YouTube' },
    { key: 'twitter', icon: 'twitter', url: profile.socialLinks.twitter, label: 'X (Twitter)' },
    { key: 'telegram', icon: 'telegram', url: profile.socialLinks.telegram, label: 'Telegram' },
    { key: 'email', icon: 'email', url: profile.socialLinks.email ? `mailto:${profile.socialLinks.email}` : '', label: 'E-mail' },
  ].filter((s) => s.url && s.url.trim() !== '');

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-between px-4 py-8 md:py-12 transition-colors duration-500 relative select-none ${theme.backgroundClass}`}
      style={
        theme.customBgUrl
          ? {
              backgroundImage: `url(${theme.customBgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Top Floating Controls */}
      <div className="w-full max-w-lg flex items-center justify-between z-20 mb-4 px-2">
        {/* Admin status pill if logged in */}
        {isAdmin ? (
          <button
            onClick={onOpenAdminDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer backdrop-blur-md shadow-lg"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Editar Painel</span>
          </button>
        ) : (
          <div />
        )}

        {/* Share Button */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="p-2.5 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg ml-auto"
          title="Compartilhar Perfil"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-lg flex flex-col items-center z-10 space-y-6">
        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center space-y-3 w-full">
          {/* Avatar with Glow and Ring */}
          <div className="relative group">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shadow-xl overflow-hidden flex items-center justify-center">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={profile.name}
                className="w-full h-full object-cover rounded-full select-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>
            {profile.verified && (
              <div className="absolute bottom-0 right-0 p-1 bg-zinc-950 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 fill-cyan-500" />
              </div>
            )}
          </div>

          {/* Name & Handle */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className={`text-xl md:text-2xl ${theme.profileTextClass}`}>
                {profile.name}
              </h1>
            </div>
            <div className={`text-xs md:text-sm font-medium ${theme.profileSubtextClass}`}>
              {profile.handle}
            </div>
          </div>

          {/* Location if set */}
          {profile.location && (
            <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-black/20 border border-white/10 text-zinc-300 font-medium backdrop-blur-sm">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{profile.location}</span>
            </div>
          )}

          {/* Bio Description */}
          {profile.bio && (
            <p className="text-xs md:text-sm text-zinc-300/90 max-w-sm leading-relaxed px-2 font-normal">
              {profile.bio}
            </p>
          )}

          {/* Social Links Bar */}
          {socialItems.length > 0 && (
            <div className="flex items-center justify-center flex-wrap gap-2 pt-1 pb-1">
              {socialItems.map((social) => (
                <a
                  key={social.key}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-black/20 hover:bg-white/10 border border-white/10 text-white/90 hover:text-white transition-all hover:scale-110 active:scale-95 backdrop-blur-md shadow-sm"
                  title={social.label}
                >
                  <IconRenderer iconName={social.icon} className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Links Stack */}
        <div className="w-full space-y-3 pt-2">
          {activeLinks.map((link) => {
            // Header Divider
            if (link.type === 'header') {
              return (
                <div
                  key={link.id}
                  className="pt-4 pb-1 text-center font-bold text-xs uppercase tracking-widest text-zinc-400/90 flex items-center justify-center gap-2 select-none"
                >
                  <div className="h-[1px] w-8 bg-current opacity-30" />
                  <span>{link.title}</span>
                  <div className="h-[1px] w-8 bg-current opacity-30" />
                </div>
              );
            }

            // Normal Link / Pix / WhatsApp / YouTube
            const isPix = link.type === 'pix';
            const isVideo = link.type === 'youtube';
            const isExpandedVideo = isVideo && expandedVideoId === link.id;

            return (
              <div key={link.id} className="w-full flex flex-col">
                <a
                  href={link.url || '#'}
                  onClick={(e) => handleLinkAction(e, link)}
                  target={isPix || isVideo ? undefined : '_blank'}
                  rel={isPix || isVideo ? undefined : 'noopener noreferrer'}
                  className={`relative w-full p-4 flex items-center justify-between gap-3 transition-all duration-300 group cursor-pointer ${
                    theme.cardClass
                  } ${theme.cardBorderClass} ${theme.cardHoverClass} ${theme.buttonShape} ${
                    link.isHighlighted
                      ? 'ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-500/20 animate-pulse'
                      : ''
                  }`}
                >
                  {/* Left: Icon */}
                  <div className="w-10 h-10 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                    <IconRenderer iconName={link.icon || 'link'} className="w-5 h-5" />
                  </div>

                  {/* Middle: Title & Subtitle */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm ${theme.cardTextClass} truncate`}>
                        {link.title}
                      </h3>
                      {link.highlightBadge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400 text-zinc-950 shadow-sm shrink-0">
                          {link.highlightBadge}
                        </span>
                      )}
                    </div>
                    {link.subtitle && (
                      <p className={`text-xs mt-0.5 truncate ${theme.cardSubtextClass}`}>
                        {link.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Right Action Indicator */}
                  <div className="text-zinc-400 group-hover:text-white transition-colors shrink-0">
                    {isPix ? (
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    ) : isVideo ? (
                      <Play className="w-4 h-4 fill-current text-rose-400" />
                    ) : link.type === 'whatsapp' ? (
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    )}
                  </div>
                </a>

                {/* Inline YouTube Player if expanded */}
                {isExpandedVideo && link.embedUrl && (
                  <div className="mt-2 w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-black aspect-video animate-fadeIn">
                    <iframe
                      src={link.embedUrl}
                      title={link.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer & Discreet Admin Login Trigger */}
      <footer className="w-full max-w-lg mt-12 pt-6 border-t border-white/10 flex flex-col items-center justify-center gap-2 text-center text-xs text-zinc-400 z-10">
        <p className="text-[11px] font-medium opacity-80">
          {profile.footerText || 'Criado com Linktree • Feito para você'}
        </p>

        {/* Discreet Admin Lock Button */}
        <div className="flex items-center gap-3 pt-1">
          {isAdmin ? (
            <button
              onClick={onOpenAdminDashboard}
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Painel de Controle Ativo</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors p-1 cursor-pointer"
              title="Área do Administrador"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </footer>

      {/* Pix Modal */}
      {activePixLink && (
        <PixModal
          isOpen={true}
          onClose={() => setActivePixLink(null)}
          pixKey={activePixLink.pixKey || profile.socialLinks.email || 'manu4432d@gmail.com'}
          pixName={activePixLink.pixName || profile.name}
          pixType={activePixLink.pixType}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        profileName={profile.name}
        handle={profile.handle}
      />
    </div>
  );
};
