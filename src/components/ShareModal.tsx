import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Share2, Send, MessageCircle, Twitter } from 'lucide-react';
import { generateQrCodeUrl } from '../utils/qrCode';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  handle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  profileName,
  handle,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : 'https://linktree.pages.dev';
  const qrUrl = generateQrCodeUrl(currentUrl, 260);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profileName} | Árvore de Links`,
        text: `Confira todos os links de ${profileName} (${handle}) aqui:`,
        url: currentUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(`Confira os links de ${profileName}: ${currentUrl}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden text-zinc-100 space-y-5">
        {/* Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Compartilhar Perfil</h3>
              <p className="text-xs text-zinc-400">Divulgue seus links com facilidade</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner mx-auto max-w-[200px]">
          <img
            src={qrUrl}
            alt="QR Code Perfil"
            className="w-40 h-40 object-contain rounded-lg"
          />
          <span className="text-[10px] font-mono text-zinc-600 mt-1 font-semibold uppercase tracking-wider">
            Aponte a câmera
          </span>
        </div>

        {/* Copy URL */}
        <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-zinc-300 truncate pl-2 select-all">
            {currentUrl}
          </span>
          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 hover:bg-emerald-900/50 flex flex-col items-center justify-center gap-1 text-emerald-400 text-xs font-medium transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/40 hover:bg-sky-900/50 flex flex-col items-center justify-center gap-1 text-sky-400 text-xs font-medium transition-all"
          >
            <Twitter className="w-4 h-4" />
            <span>X (Twitter)</span>
          </a>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(profileName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 hover:bg-blue-900/50 flex flex-col items-center justify-center gap-1 text-blue-400 text-xs font-medium transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Telegram</span>
          </a>
        </div>

        {/* Native share button if available */}
        <button
          onClick={handleNativeShare}
          className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Outras Opções de Compartilhamento</span>
        </button>
      </div>
    </div>
  );
};
