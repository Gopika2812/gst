import React, { useState } from 'react';
import { X, ExternalLink, Download, ZoomIn, ZoomOut, RotateCcw, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { resolveFileUrl, isImageFile, isPdfFile } from '../../utils/fileUtils';

const FilePreviewModal = ({
  isOpen,
  onClose,
  fileUrl,
  fileName = 'Certificate Document',
  fileType = '',
  title = 'Certificate Preview',
  subtitle = '',
  certNumber = ''
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !fileUrl) return null;

  const resolvedUrl = resolveFileUrl(fileUrl);
  const isImage = fileType.startsWith('image/') || isImageFile(fileName) || isImageFile(fileUrl);
  const isPdf = fileType === 'application/pdf' || isPdfFile(fileName) || isPdfFile(fileUrl);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[92vh] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-[#C59B27] shrink-0 shadow-xs">
              {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-[#0A1E3F]">{title}</h3>
                {certNumber && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0A1E3F]/10 text-[#0A1E3F]">
                    {certNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                {subtitle || fileName}
              </p>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center space-x-1.5 self-end sm:self-auto">
            {isImage && (
              <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs mr-2">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <span className="text-[11px] font-mono font-semibold text-slate-500 px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Rotate"
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                {(zoomLevel !== 1 || rotation !== 0) && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    title="Reset"
                    className="px-1.5 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 rounded"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
              title="Open in new window"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open New Tab</span>
            </a>

            <a
              href={resolvedUrl}
              download={fileName || 'certificate'}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#C59B27] text-xs font-semibold text-white hover:bg-[#A68018] shadow-2xs transition"
              title="Download File"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content / Preview Canvas */}
        <div className="flex-1 overflow-auto bg-slate-900/5 p-4 flex items-center justify-center min-h-[400px] max-h-[75vh]">
          {isImage ? (
            <div className="relative overflow-auto max-w-full max-h-full flex items-center justify-center p-2">
              <img
                src={resolvedUrl}
                alt={fileName || 'Certificate Preview'}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-200/80 bg-white"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-[68vh] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-inner">
              <iframe
                src={`${resolvedUrl}#toolbar=1&navpanes=0`}
                title={fileName || 'PDF Document'}
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md">
              <FileText className="h-16 w-16 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-bold text-slate-800 mb-1">{fileName}</p>
              <p className="text-xs text-slate-500 mb-4">
                This document format cannot be rendered directly in-line. You can view or download it below.
              </p>
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#0A1E3F] text-xs font-bold text-white hover:bg-[#16385C] transition shadow-xs"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open File in Browser</span>
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white text-xs text-slate-500">
          <span className="truncate">File: {fileName}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
};

export default FilePreviewModal;
