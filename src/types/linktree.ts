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

export interface ProfileData {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  location?: string;
  views: number;
  socialLinks: SocialLinks;
  socialPosition: 'top' | 'bottom' | 'both';
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
  fontFamily: 'sans' | 'mono' | 'serif';
  customBgUrl?: string;
}

export interface LinktreeState {
  profile: ProfileData;
  links: LinkItem[];
  theme: ThemeConfig;
  lastUpdated: number;
}
