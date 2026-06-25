import React, { useEffect } from 'react';
import { X, PlayCircle, FileText, Image as ImageIcon, Presentation } from 'lucide-react';
import { Button } from './Button';
import { ContentType } from '@lms/shared-types';

export interface ContentPlayerModalProps {
  content: any | null;
  onClose: () => void;
}

export function ContentPlayerModal({ content, onClose }: ContentPlayerModalProps) {
  useEffect(() => {
    if (content) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [content]);

  if (!content) return null;

  const renderContentIcon = (type: ContentType) => {
    switch (type) {
      case ContentType.VIDEO: return <PlayCircle className="h-16 w-16 text-indigo-500 mb-4" />;
      case ContentType.PDF: return <FileText className="h-16 w-16 text-red-500 mb-4" />;
      case ContentType.IMAGE: return <ImageIcon className="h-16 w-16 text-green-500 mb-4" />;
      case ContentType.PRESENTATION: return <Presentation className="h-16 w-16 text-orange-500 mb-4" />;
      default: return <FileText className="h-16 w-16 text-slate-500 mb-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex-shrink-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 text-white absolute top-0 w-full z-10 transition-opacity">
        <div>
          <h2 className="text-lg font-medium truncate">{content.title}</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/20 hover:text-white rounded-full"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center pt-16 h-full overflow-hidden relative">
        {content.contentType === ContentType.VIDEO ? (
          <video 
            key={content.id} 
            controls 
            autoPlay
            className="w-full h-full object-contain"
          >
            <source src={content.url} type={content.mimeType} />
            Your browser does not support the video tag.
          </video>
        ) : content.contentType === ContentType.IMAGE ? (
          <img 
            src={content.url} 
            alt={content.title} 
            className="w-full h-full object-contain p-8" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-2xl border border-white/10 max-w-lg text-center">
            {renderContentIcon(content.contentType)}
            <h3 className="text-2xl font-medium text-white">{content.title}</h3>
            {content.description && (
              <p className="text-slate-300 mt-4 leading-relaxed">{content.description}</p>
            )}
            <p className="text-sm text-slate-400 mt-6 mb-8">
              Preview is not available inline for this file format.
            </p>
            <a href={content.url} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-black hover:bg-slate-200">
                Download File
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
