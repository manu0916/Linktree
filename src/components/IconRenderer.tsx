import React from 'react';
import {
  Globe,
  Github,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Send,
  Mail,
  MessageCircle,
  Sparkles,
  Video,
  Music,
  ShoppingBag,
  FileText,
  MapPin,
  Phone,
  Heart,
  Share2,
  ExternalLink,
  Code2,
  Gamepad2,
  Tv,
  Coffee,
  DollarSign,
  Link as LinkIcon,
  HelpCircle,
} from 'lucide-react';

interface IconRendererProps {
  iconName?: string;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ iconName, className = 'w-5 h-5' }) => {
  if (!iconName) {
    return <LinkIcon className={className} />;
  }

  // Check if it's an emoji (standard unicode emoji)
  const isEmoji = /\p{Extended_Pictographic}/u.test(iconName);
  if (isEmoji && iconName.length <= 4) {
    return <span className="text-xl select-none inline-flex items-center justify-center leading-none">{iconName}</span>;
  }

  const normalized = iconName.toLowerCase().trim();

  switch (normalized) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'github':
      return <Github className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'twitter':
    case 'x':
      return <Twitter className={className} />;
    case 'telegram':
    case 'send':
      return <Send className={className} />;
    case 'email':
    case 'mail':
      return <Mail className={className} />;
    case 'whatsapp':
    case 'message-circle':
    case 'chat':
      return <MessageCircle className={className} />;
    case 'sparkles':
    case 'pix':
      return <Sparkles className={className} />;
    case 'video':
      return <Video className={className} />;
    case 'music':
    case 'spotify':
      return <Music className={className} />;
    case 'store':
    case 'shop':
    case 'shopping-bag':
      return <ShoppingBag className={className} />;
    case 'file':
    case 'file-text':
    case 'document':
      return <FileText className={className} />;
    case 'map':
    case 'map-pin':
    case 'location':
      return <MapPin className={className} />;
    case 'phone':
      return <Phone className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'code':
    case 'code2':
    case 'dev':
      return <Code2 className={className} />;
    case 'game':
    case 'discord':
      return <Gamepad2 className={className} />;
    case 'tv':
    case 'twitch':
      return <Tv className={className} />;
    case 'coffee':
    case 'apoie':
      return <Coffee className={className} />;
    case 'dollar':
    case 'money':
      return <DollarSign className={className} />;
    case 'share':
      return <Share2 className={className} />;
    case 'globe':
    case 'web':
    case 'site':
      return <Globe className={className} />;
    default:
      return <LinkIcon className={className} />;
  }
};
