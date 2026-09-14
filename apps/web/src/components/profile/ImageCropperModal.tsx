'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageCropperModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

export function ImageCropperModal({
  file,
  isOpen,
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load image when file changes
  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);

    return () => {
      setImageSrc(null);
    };
  }, [file]);

  // Load HTMLImageElement
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
  }, [imageSrc]);

  // Redraw canvas whenever zoom, rotation, or offset changes
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Save context state
    ctx.save();

    // Center and translate
    ctx.translate(size / 2 + offset.x, size / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate aspect-preserving dimensions
    const imgAspect = img.width / img.height;
    let drawWidth = size;
    let drawHeight = size;

    if (imgAspect > 1) {
      drawWidth = size * imgAspect;
      drawHeight = size;
    } else {
      drawWidth = size;
      drawHeight = size / imgAspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }, [zoom, rotation, offset]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Generate cropped output file
  const handleSaveCrop = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;

    setIsProcessing(true);

    try {
      // High-res output canvas
      const outputCanvas = document.createElement('canvas');
      const outputSize = 512;
      outputCanvas.width = outputSize;
      outputCanvas.height = outputSize;
      const oCtx = outputCanvas.getContext('2d');

      if (!oCtx) throw new Error('Canvas context unavailable');

      // Circular clip mask for clean avatar crop
      oCtx.save();
      oCtx.beginPath();
      oCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2, true);
      oCtx.closePath();
      oCtx.clip();

      // Render the current canvas view into output canvas
      oCtx.drawImage(canvas, 0, 0, outputSize, outputSize);
      oCtx.restore();

      outputCanvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }
          const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
          const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
          setIsProcessing(false);
          onCropComplete(croppedFile);
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Failed to crop image', err);
      setIsProcessing(false);
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cropper-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 id="cropper-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('Edit Profile Picture')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('Drag to position, pinch or use controls to zoom.')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Crop Area */}
        <div className="relative flex items-center justify-center p-6 bg-slate-950/90 select-none overflow-hidden">
          <div
            className="relative w-64 h-64 rounded-full overflow-hidden shadow-inner ring-4 ring-indigo-500/50 cursor-grab active:cursor-grabbing touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <canvas
              ref={canvasRef}
              width={256}
              height={256}
              className="w-full h-full object-cover block"
            />
            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-full flex items-center justify-center">
              <Move className="w-6 h-6 text-white/40 drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 space-y-4 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title={t('Zoom Out')}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title={t('Zoom In')}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Quick rotation & reset buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{t('Rotate 90°')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setOffset({ x: 0, y: 0 });
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('Reset')}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-600 dark:text-slate-400"
          >
            {t('Cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveCrop}
            isLoading={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Check className="w-4 h-4" />
            <span>{t('Apply & Upload')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
