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
  Shield,
  Sliders,
  Eye,
  Megaphone,
  Rocket,
  Star,
  Flame,
  Gift,
  Bell,
  Mail,
  Check,
  Send,
  Download,
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
  onAddLead?: (email: string, name?: string) => void;
}

export const PublicView: React.FC<PublicViewProps> = ({
  state,
  isAdmin,
  onLinkClick,
  onOpenAdminLogin,
  onOpenAdminDashboard,
  onAddLead,
}) => {
  const { profile, links, theme, features } = state;

  const [activePixLink, setActivePixLink] = useState<LinkItem | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Newsletter form state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

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
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    if (onAddLead) {
      onAddLead(newsletterEmail, newsletterName);
    }
    setNewsletterSubmitted(true);
    setNewsletterEmail('');
    setNewsletterName('');
    setTimeout(() => {
      setNewsletterSubmitted(false);
    }, 6000);
  };

  const socialItems = [
    { key: 'instagram', icon: 'instagram', url: profile.socialLinks.instagram, label: 'Instagram', color: 'hover:text-pink-400' },
    { key: 'whatsapp', icon: 'whatsapp', url: profile.socialLinks.whatsapp, label: 'WhatsApp', color: 'hover:text-emerald-400' },
    { key: 'github', icon: 'github', url: profile.socialLinks.github, label: 'GitHub', color: 'hover:text-purple-400' },
    { key: 'linkedin', icon: 'linkedin', url: profile.socialLinks.linkedin, label: 'LinkedIn', color: 'hover:text-blue-400' },
    { key: 'youtube', icon: 'youtube', url: profile.socialLinks.youtube, label: 'YouTube', color: 'hover:text-red-500' },
    { key: 'twitter', icon: 'twitter', url: profile.socialLinks.twitter, label: 'X (Twitter)', color: 'hover:text-cyan-400' },
    { key: 'telegram', icon: 'telegram', url: profile.socialLinks.telegram, label: 'Telegram', color: 'hover:text-sky-400' },
    { key: 'email', icon: 'email', url: profile.socialLinks.email ? `mailto:${profile.socialLinks.email}` : '', label: 'E-mail', color: 'hover:text-amber-400' },
    { key: 'spotify', icon: 'music', url: profile.socialLinks.spotify, label: 'Spotify', color: 'hover:text-emerald-400' },
    { key: 'tiktok', icon: 'sparkles', url: profile.socialLinks.tiktok, label: 'TikTok', color: 'hover:text-rose-400' },
    { key: 'discord', icon: 'message-circle', url: profile.socialLinks.discord, label: 'Discord', color: 'hover:text-indigo-400' },
    { key: 'twitch', icon: 'video', url: profile.socialLinks.twitch, label: 'Twitch', color: 'hover:text-purple-500' },
  ].filter((s) => s.url && s.url.trim() !== '');

  // Render Banner Icon
  const renderBannerIcon = () => {
    const iconName = features?.bannerIcon || 'sparkles';
    switch (iconName) {
      case 'megaphone': return <Megaphone className="w-4 h-4 shrink-0" />;
      case 'rocket': return <Rocket className="w-4 h-4 shrink-0" />;
      case 'star': return <Star className="w-4 h-4 shrink-0" />;
      case 'fire': return <Flame className="w-4 h-4 shrink-0" />;
      case 'gift': return <Gift className="w-4 h-4 shrink-0" />;
      case 'bell': return <Bell className="w-4 h-4 shrink-0" />;
      default: return <Sparkles className="w-4 h-4 shrink-0" />;
    }
  };

  // Avatar Size Mapping
  const avatarSizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24 md:w-28 md:h-28',
    xl: 'w-32 h-32 md:w-36 md:h-36',
  }[features?.avatarSize || 'lg'];

  // Avatar Shape Mapping
  const avatarShapeClasses = {
    circle: 'rounded-full',
    'rounded-3xl': 'rounded-3xl',
    'rounded-xl': 'rounded-2xl',
    square: 'rounded-none',
  }[features?.avatarShape || 'circle'];

  // Avatar Glow Mapping
  const avatarGlowClasses = {
    gradient: 'p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shadow-xl shadow-cyan-500/20',
    'neon-cyan': 'p-1 bg-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.8)] border border-cyan-300',
    'neon-purple': 'p-1 bg-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.8)] border border-purple-300',
    gold: 'p-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.6)]',
    soft: 'p-1 bg-white/20 backdrop-blur-md shadow-lg',
    none: 'p-0',
  }[features?.avatarGlow || 'gradient'];

  // Verified Badge Color
  const verifiedBadgeColors = {
    cyan: 'text-cyan-400 fill-cyan-500',
    blue: 'text-blue-400 fill-blue-500',
    gold: 'text-amber-400 fill-amber-500',
    purple: 'text-purple-400 fill-purple-500',
    emerald: 'text-emerald-400 fill-emerald-500',
  }[features?.verifiedBadgeColor || 'cyan'];

  // Bio Alignment Mapping
  const bioAlignClasses = {
    center: 'text-center items-center',
    left: 'text-left items-start',
    right: 'text-right items-end',
  }[features?.bioAlignment || 'center'];

  // Social Icon Styles
  const getSocialButtonClass = () => {
    const style = features?.socialStyle || 'glass';
    const sizeClass = {
      sm: 'p-2 text-xs',
      md: 'p-2.5 text-sm',
      lg: 'p-3 text-base',
    }[features?.socialIconSize || 'md'];

    switch (style) {
      case 'filled':
        return `${sizeClass} rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 shadow-md`;
      case 'minimal':
        return `${sizeClass} rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors`;
      case 'pills':
        return `${sizeClass} rounded-full bg-black/40 border border-white/15 text-white transition-all hover:scale-110 active:scale-95`;
      case 'colorful':
        return `${sizeClass} rounded-xl bg-zinc-900 border border-white/10 text-white transition-all hover:scale-110 active:scale-95 shadow-lg`;
      case 'glass':
      default:
        return `${sizeClass} rounded-xl bg-black/20 hover:bg-white/10 border border-white/10 text-white/90 hover:text-white transition-all hover:scale-110 active:scale-95 backdrop-blur-md shadow-sm`;
    }
  };

  // Card Hover Effect Mapping
  const getCardHoverClass = () => {
    switch (features?.cardHoverEffect) {
      case 'lift':
        return 'hover:-translate-y-1.5 shadow-md hover:shadow-xl transition-all duration-300';
      case 'glow':
        return 'hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:border-cyan-400/80 transition-all duration-300';
      case 'bounce':
        return 'hover:-translate-y-1 active:translate-y-0.5 transition-transform duration-200';
      case 'none':
        return '';
      case 'scale':
      default:
        return 'hover:scale-[1.02] active:scale-[0.99] transition-transform duration-200';
    }
  };

  // Highlight Style
  const getHighlightClass = () => {
    switch (features?.highlightStyle) {
      case 'shimmer':
        return 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/30';
      case 'rainbow':
        return 'ring-2 ring-transparent bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-amber-500/30 shadow-lg';
      case 'glow':
        return 'ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]';
      case 'pulse':
      default:
        return 'ring-2 ring-cyan-400/70 shadow-lg shadow-cyan-500/25 animate-pulse';
    }
  };

  // Custom Colors Style Overrides
  const customDesign = features?.customDesign;
  const isCustomColors = customDesign?.useCustomColors;

  const getCustomBgStyle = (): React.CSSProperties => {
    if (theme.customBgUrl) {
      return {
        backgroundImage: `url(${theme.customBgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (isCustomColors) {
      if (customDesign.backgroundType === 'solid') {
        return { backgroundColor: customDesign.solidBgColor };
      }
      if (customDesign.backgroundType === 'gradient') {
        return {
          background: `linear-gradient(135deg, ${customDesign.gradientStart} 0%, ${customDesign.gradientEnd} 100%)`,
        };
      }
    }
    return {};
  };

  // Render Social Links Bar
  const renderSocials = () => {
    if (socialItems.length === 0) return null;
    return (
      <div className="flex items-center justify-center flex-wrap gap-2 pt-1 pb-1">
        {socialItems.map((social) => (
          <a
            key={social.key}
            href={social.url}
            target={features?.openInNewTab ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className={`${getSocialButtonClass()} ${social.color}`}
            title={social.label}
          >
            <IconRenderer iconName={social.icon} className="w-4 h-4" />
          </a>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-between px-4 py-6 md:py-10 transition-colors duration-500 relative select-none ${
        isCustomColors ? '' : theme.backgroundClass
      }`}
      style={getCustomBgStyle()}
    >
      {/* Top Customizable Announcement Banner */}
      {features?.bannerEnabled && !bannerDismissed && (
        <aside
          aria-label="Aviso"
          className="w-full max-w-lg mb-4 py-2 px-3.5 rounded-2xl flex items-center justify-between gap-2.5 text-xs font-semibold shadow-xl transition-all animate-fadeIn"
          style={{
            backgroundColor: features.bannerBgColor || '#06b6d4',
            color: features.bannerTextColor || '#09090b',
          }}
        >
          <div className="flex items-center gap-2 truncate">
            {renderBannerIcon()}
            {features.bannerLink ? (
              <a
                href={features.bannerLink}
                target={features.openInNewTab ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="hover:underline truncate"
              >
                {features.bannerText || 'Confira nossas últimas novidades e atualizações!'}
              </a>
            ) : (
              <span className="truncate">
                {features.bannerText || 'Confira nossas últimas novidades e atualizações!'}
              </span>
            )}
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="p-1 rounded-full hover:bg-black/10 transition-colors opacity-75 hover:opacity-100 cursor-pointer shrink-0"
            title="Fechar aviso"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Top Floating Controls Header */}
      <div className="w-full max-w-lg flex items-center justify-between z-20 mb-4 px-2">
        {/* Admin status pill if logged in */}
        {isAdmin ? (
          <button
            onClick={onOpenAdminDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer backdrop-blur-md shadow-lg"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Painel Admin</span>
          </button>
        ) : (
          <div />
        )}

        {/* Right Controls: Views Counter & Share Button */}
        <div className="flex items-center gap-2 ml-auto">
          {features?.showViewsCounter && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 border border-white/10 text-[11px] text-zinc-300 backdrop-blur-md shadow-sm"
              title={`${(profile.views || 0).toLocaleString()} ${features?.viewsLabel || 'visualizações'}`}
            >
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>
                {(profile.views || 0).toLocaleString()} {features?.viewsLabel || 'views'}
              </span>
            </div>
          )}

          {features?.showShareButton !== false && (
            <button
              onClick={() => setShareModalOpen(true)}
              className="p-2.5 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              title="Compartilhar Perfil"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-lg flex flex-col items-center z-10 space-y-6">
        {/* Profile Identity Card */}
        <div className={`flex flex-col ${bioAlignClasses} space-y-3 w-full`}>
          {/* Avatar with Custom Size, Shape & Glow */}
          <div className="relative group">
            <div className={`${avatarSizeClasses} ${avatarShapeClasses} ${avatarGlowClasses} overflow-hidden flex items-center justify-center transition-all`}>
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={profile.name}
                className={`w-full h-full object-cover ${avatarShapeClasses} select-none`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>
            {profile.verified && (
              <div className="absolute bottom-0 right-0 p-1 bg-zinc-950 rounded-full shadow-md">
                <CheckCircle2 className={`w-5 h-5 ${verifiedBadgeColors}`} />
              </div>
            )}
          </div>

          {/* Name & Handle */}
          <div className="space-y-1">
            <div className={`flex items-center gap-1.5 ${features?.bioAlignment === 'left' ? 'justify-start' : features?.bioAlignment === 'right' ? 'justify-end' : 'justify-center'}`}>
              <h1 className={`text-xl md:text-2xl ${theme.profileTextClass}`}>
                {profile.name}
              </h1>
            </div>
            <div className={`text-xs md:text-sm font-medium ${theme.profileSubtextClass}`}>
              {profile.handle}
            </div>
          </div>

          {/* Location if set & enabled */}
          {profile.location && features?.showLocation !== false && (
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

          {/* Social Links Bar (Top or Both) */}
          {(features?.socialPosition === 'top' || features?.socialPosition === 'both' || !features?.socialPosition) &&
            renderSocials()}
        </div>

        {/* Links Stack (1 column or 2 columns grid) */}
        <div
          className={`w-full pt-2 ${
            features?.layoutColumns === '2'
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
              : 'space-y-3'
          }`}
        >
          {activeLinks.map((link) => {
            // Header Divider
            if (link.type === 'header') {
              return (
                <div
                  key={link.id}
                  className={`pt-4 pb-1 text-center font-bold text-xs uppercase tracking-widest text-zinc-400/90 flex items-center justify-center gap-2 select-none ${
                    features?.layoutColumns === '2' ? 'sm:col-span-2' : ''
                  }`}
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

            // Custom Card Style inline override if enabled
            const cardCustomStyle = isCustomColors
              ? {
                  backgroundColor: customDesign.cardBgColor,
                  color: customDesign.cardTextColor,
                  borderColor: customDesign.cardBorderColor,
                }
              : undefined;

            return (
              <div
                key={link.id}
                className={`w-full flex flex-col ${
                  features?.layoutColumns === '2' && isExpandedVideo ? 'sm:col-span-2' : ''
                }`}
              >
                <a
                  href={link.url || '#'}
                  onClick={(e) => handleLinkAction(e, link)}
                  target={isPix || isVideo ? undefined : features?.openInNewTab ? '_blank' : '_self'}
                  rel={isPix || isVideo ? undefined : 'noopener noreferrer'}
                  style={cardCustomStyle}
                  className={`relative w-full p-4 flex items-center justify-between gap-3 transition-all duration-300 group cursor-pointer ${
                    theme.cardClass
                  } ${theme.cardBorderClass} ${getCardHoverClass()} ${theme.buttonShape} ${
                    link.isHighlighted ? getHighlightClass() : ''
                  }`}
                >
                  {/* Left: Icon if enabled */}
                  {features?.showLinkIcons !== false && (
                    <div className="w-10 h-10 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                      <IconRenderer iconName={link.icon || 'link'} className="w-5 h-5" />
                    </div>
                  )}

                  {/* Middle: Title & Subtitle */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={`text-sm ${theme.cardTextClass} truncate`}>
                        {link.title}
                      </h2>
                      {link.highlightBadge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400 text-zinc-950 shadow-sm shrink-0">
                          {link.highlightBadge}
                        </span>
                      )}
                    </div>
                    {features?.showLinkSubtitles !== false && link.subtitle && (
                      <p className={`text-xs mt-0.5 truncate ${theme.cardSubtextClass}`}>
                        {link.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Right Clicks Count (if public) & Action Indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    {features?.showClicksPublicly && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-zinc-400 border border-white/5">
                        {link.clicks || 0} clicks
                      </span>
                    )}

                    <div className="text-zinc-400 group-hover:text-white transition-colors">
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

        {/* Social Links Bar (Bottom or Both) */}
        {(features?.socialPosition === 'bottom' || features?.socialPosition === 'both') && (
          <div className="pt-2">{renderSocials()}</div>
        )}

        {/* Lead Magnet / Newsletter Capture Module */}
        {features?.newsletterEnabled && (
          <div
            className={`w-full p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl text-center space-y-3.5 transition-all ${
              theme.cardClass
            }`}
          >
            <div className="w-10 h-10 mx-auto rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white">
                {features.newsletterTitle || 'Fique por dentro das novidades'}
              </h2>
              <p className="text-xs text-zinc-300 max-w-xs mx-auto leading-relaxed">
                {features.newsletterSubtitle ||
                  'Receba lançamentos de novos projetos e atualizações exclusivas no seu e-mail.'}
              </p>
            </div>

            {newsletterSubmitted ? (
              <div className="py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{features.newsletterSuccessMessage || 'Inscrição realizada com sucesso!'}</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2 max-w-sm mx-auto">
                <input
                  type="text"
                  placeholder="Seu nome (opcional)"
                  value={newsletterName}
                  onChange={(e) => setNewsletterName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Seu melhor e-mail"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 active:scale-95"
                  >
                    <span>{features.newsletterButtonText || 'Inscrever'}</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Footer & Discreet Admin Login Trigger */}
      <footer className="w-full max-w-lg mt-12 pt-6 border-t border-white/10 flex flex-col items-center justify-center gap-2.5 text-center text-xs text-zinc-400 z-10">
        {/* Footer Socials if enabled */}
        {features?.footerSocials && renderSocials()}

        <p className="text-[11px] font-medium opacity-80">
          {profile.footerText || 'Criado com Linktree • Feito para você'}
        </p>

        {/* Download ZIP (Discreet link) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <a
            href="/site-linktree.zip"
            download="site-linktree.zip"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 border border-white/10 text-[11px] font-medium transition-all cursor-pointer shadow-sm"
            title="Baixar Arquivo ZIP do Projeto"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>Código ZIP</span>
          </a>
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
