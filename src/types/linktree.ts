export type LinkType = 'link' | 'header' | 'youtube' | 'spotify' | 'whatsapp' | 'pix';

export interface LinkItem {
  id: string;
  type: LinkType;
  title: string;
  subtitle?: string;
  url: string;
  icon?: string; // emoji, lucide icon name, or icon identifier
  isActive: boolean;
  isHighlighted?: boolean;
  highlightBadge?: string;
  clicks: number;
  order: number;
  createdAt: number;
  customColor?: string;
  customBgColor?: string;
  // Specific data for special link types:
  pixKey?: string;
  pixType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  pixName?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  embedUrl?: string;
}

export interface SocialLinks {
  instagram?: string;
  whatsapp?: string;
  github?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  discord?: string;
  twitch?: string;
  telegram?: string;
  email?: string;
  spotify?: string;
}

export interface NewsletterLead {
  id: string;
  email: string;
  name?: string;
  createdAt: number;
}

export interface ProfileData {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  location?: string;
  views: number;
  socialLinks: SocialLinks;
  footerText: string;
}

export type ThemePresetId =
  | 'midnight-black'
  | 'aurora-glass'
  | 'cyberpunk-neon'
  | 'clean-minimal'
  | 'sunset-glow'
  | 'emerald-luxury'
  | 'rose-gold'
  | 'ocean-deep'
  | 'monokai-dev';

export interface ThemeConfig {
  id: ThemePresetId;
  name: string;
  backgroundClass: string;
  cardClass: string;
  cardHoverClass: string;
  cardBorderClass: string;
  cardTextClass: string;
  cardSubtextClass: string;
  profileTextClass: string;
  profileSubtextClass: string;
  accentClass: string;
  glowClass: string;
  buttonShape: 'rounded-full' | 'rounded-2xl' | 'rounded-lg' | 'rounded-none';
  fontFamily: 'sans' | 'mono' | 'serif' | 'display';
  customBgUrl?: string;
}

export interface CustomDesignSettings {
  useCustomColors: boolean;
  backgroundType: 'preset' | 'gradient' | 'solid' | 'image';
  solidBgColor: string;
  gradientStart: string;
  gradientEnd: string;
  cardBgColor: string;
  cardTextColor: string;
  cardSubtextColor: string;
  cardBorderColor: string;
  accentColor: string;
}

export interface FrontendFeaturesConfig {
  // Top Banner
  bannerEnabled: boolean;
  bannerText: string;
  bannerLink: string;
  bannerBgColor: string;
  bannerTextColor: string;
  bannerIcon: string;

  // Header & Controls
  showShareButton: boolean;
  showViewsCounter: boolean;
  viewsLabel: string;
  soundEffectsEnabled: boolean;

  // Avatar & Identity Styling
  avatarSize: 'sm' | 'md' | 'lg' | 'xl';
  avatarShape: 'circle' | 'rounded-3xl' | 'rounded-xl' | 'square';
  avatarGlow: 'gradient' | 'neon-cyan' | 'neon-purple' | 'gold' | 'soft' | 'none';
  verifiedBadgeColor: 'cyan' | 'blue' | 'gold' | 'purple' | 'emerald';
  bioAlignment: 'center' | 'left' | 'right';
  showLocation: boolean;

  // Social Icons Bar
  socialPosition: 'top' | 'bottom' | 'both' | 'hidden';
  socialStyle: 'glass' | 'filled' | 'minimal' | 'pills' | 'colorful';
  socialIconSize: 'sm' | 'md' | 'lg';

  // Links List & Cards
  layoutColumns: '1' | '2';
  cardStyle: 'glass' | 'solid' | 'outline' | 'gradient' | 'minimal';
  cardHoverEffect: 'scale' | 'lift' | 'glow' | 'bounce' | 'none';
  showClicksPublicly: boolean;
  showLinkIcons: boolean;
  showLinkSubtitles: boolean;
  openInNewTab: boolean;
  highlightStyle: 'pulse' | 'shimmer' | 'rainbow' | 'glow';

  // Interactive Newsletter / Lead Magnet Box
  newsletterEnabled: boolean;
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterButtonText: string;
  newsletterSuccessMessage: string;

  // Footer & Branding
  showAdminButtonInFooter: boolean;
  adminButtonLabel: string;
  footerSocials: boolean;

  // SEO & Browser Meta
  pageTitle: string;
  metaDescription: string;

  // Custom Colors
  customDesign: CustomDesignSettings;
}

export interface LinktreeState {
  profile: ProfileData;
  links: LinkItem[];
  theme: ThemeConfig;
  features: FrontendFeaturesConfig;
  leads: NewsletterLead[];
  lastUpdated: number;
}
