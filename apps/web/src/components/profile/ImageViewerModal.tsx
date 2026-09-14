'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, ZoomIn, ZoomOut, ExternalLink, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  userName?: string;
  userRole?: string;
}

export function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  userName = 'User',
  userRole,
}: ImageViewerModalProps) {
  const { t } = useTranslation();
  const [scale, setScale] = useState(1);

  if (!isOpen || !imageUrl) return null;

  // Compute full resolved URL
  const getFullUrl = (url: string) => {
    let cleanUrl = url.trim();
    if (cleanUrl.startsWith('undefined/')) {
      cleanUrl = cleanUrl.replace(/^undefined\//, '');
    }
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
    const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const baseUrl = rawBaseUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}/${cleanUrl.replace(/^\//, '')}`;
  };

  const resolvedUrl = getFullUrl(imageUrl);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resolvedUrl;
    a.download = `${userName.replace(/\s+/g, '_')}_profile.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-slate-100"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Profile Picture Viewer"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{userName}</h3>
              {userRole && (
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                  {userRole}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={t('Download Picture')}
            >
              <Download className="w-4 h-4" />
            </button>
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={t('Open Original in New Tab')}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ms-1"
              title={t('Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Image Display */}
        <div className="relative flex items-center justify-center p-8 bg-slate-950/90 min-h-[360px] max-h-[70vh] overflow-auto select-none">
          <img
            src={resolvedUrl}
            alt={userName}
            style={{ transform: `scale(${scale})` }}
            className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-2xl transition-transform duration-150 ease-out ring-1 ring-white/10"
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
              title={t('Zoom Out')}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(3, s + 0.25))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
              title={t('Zoom In')}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {scale !== 1 && (
              <button
                onClick={() => setScale(1)}
                className="text-xs text-indigo-400 hover:underline ms-2 font-medium"
              >
                {t('Reset')}
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-300 hover:bg-slate-800"
          >
            {t('Close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
