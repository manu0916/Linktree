import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Sparkles, Heart } from 'lucide-react';
import { generateQrCodeUrl } from '../utils/qrCode';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKey: string;
  pixName?: string;
  pixType?: string;
}

export const PixModal: React.FC<PixModalProps> = ({
  isOpen,
  onClose,
  pixKey,
  pixName = 'Manu',
  pixType = 'Chave Pix',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const qrUrl = generateQrCodeUrl(pixKey, 300);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden text-zinc-100 space-y-5">
        {/* Glow decoration */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Apoie com Pix</h3>
              <p className="text-xs text-zinc-400">Qualquer valor incentiva meu trabalho!</p>
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
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner mx-auto max-w-[220px]">
          <img
            src={qrUrl}
            alt="QR Code Pix"
            className="w-44 h-44 object-contain rounded-lg"
          />
          <span className="text-[10px] font-mono text-zinc-600 mt-1 font-semibold uppercase tracking-wider">
            Escaneie com o app do seu banco
          </span>
        </div>

        {/* Details & Copy Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>Beneficiário: <strong className="text-zinc-200">{pixName}</strong></span>
            <span className="capitalize">{pixType}</span>
          </div>

          <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between gap-2">
            <code className="text-xs font-mono text-emerald-400 truncate select-all">
              {pixKey}
            </code>
            <button
              onClick={handleCopy}
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
        </div>

        {/* Action Button */}
        <button
          onClick={handleCopy}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Chave Pix Copiada com Sucesso!' : 'Copiar Chave Pix'}</span>
        </button>

        <p className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1">
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>Muito obrigado por apoiar o desenvolvimento independente!</span>
        </p>
      </div>
    </div>
  );
};
