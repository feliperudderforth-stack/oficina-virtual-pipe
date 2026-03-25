'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { getSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import {
  Pen, Eraser, Square, Circle, Type, Trash2,
  Download, Undo2, Redo2, Palette, Minus, Plus, X
} from 'lucide-react';

interface Stroke {
  id: string;
  points: number[];
  color: string;
  width: number;
  userId: string;
}

const COLORS = [
  '#1a1a2e', '#e03131', '#1971c2', '#2f9e44', '#f08c00',
  '#7048e8', '#0ca678', '#e8590c', '#d6336c', '#ffffff',
];

const WIDTHS = [2, 4, 8, 12, 20];

export default function Whiteboard({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#1a1a2e');
  const [width, setWidth] = useState(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<number[]>([]);
  const { currentUser } = useOfficeStore();

  // Render all strokes
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#f1f3f5';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw strokes
    [...strokes, { id: 'current', points: currentStroke, color, width, userId: '' }].forEach(stroke => {
      if (stroke.points.length < 4) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0], stroke.points[1]);
      for (let i = 2; i < stroke.points.length; i += 2) {
        ctx.lineTo(stroke.points[i], stroke.points[i + 1]);
      }
      ctx.stroke();
    });
  }, [strokes, currentStroke, color, width]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    renderCanvas();
  }, [renderCanvas]);

  // Socket events for collaborative drawing
  useEffect(() => {
    const socket = getSocket();

    socket.on('whiteboard:stroke', (data: Stroke) => {
      setStrokes(prev => [...prev, data]);
    });

    socket.on('whiteboard:cleared', () => {
      setStrokes([]);
    });

    return () => {
      socket.off('whiteboard:stroke');
      socket.off('whiteboard:cleared');
    };
  }, []);

  const getCanvasPoint = (e: React.MouseEvent): [number, number] => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const [x, y] = getCanvasPoint(e);
    setCurrentStroke([x, y]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const [x, y] = getCanvasPoint(e);
    setCurrentStroke(prev => [...prev, x, y]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length >= 4) {
      const stroke: Stroke = {
        id: `${Date.now()}-${Math.random()}`,
        points: currentStroke,
        color: tool === 'eraser' ? '#ffffff' : color,
        width: tool === 'eraser' ? 20 : width,
        userId: currentUser?.id || '',
      };

      setStrokes(prev => [...prev, stroke]);

      const socket = getSocket();
      socket.emit('whiteboard:stroke', { ...stroke, roomId });
    }

    setCurrentStroke([]);
  };

  const handleClear = () => {
    setStrokes([]);
    const socket = getSocket();
    socket.emit('whiteboard:clear', { roomId });
  };

  const handleUndo = () => {
    setStrokes(prev => prev.slice(0, -1));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      <div className="w-[90vw] h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900">Collaborative Whiteboard</h3>
            <span className="badge bg-green-100 text-green-700 !text-[9px]">Live</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Tools */}
            <div className="flex items-center gap-0.5 bg-white rounded-lg border border-gray-200 p-0.5">
              <button
                className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
                  tool === 'pen' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'
                )}
                onClick={() => setTool('pen')}
              >
                <Pen className="w-4 h-4" />
              </button>
              <button
                className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
                  tool === 'eraser' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'
                )}
                onClick={() => setTool('eraser')}
              >
                <Eraser className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Colors */}
            <div className="flex items-center gap-1">
              {COLORS.map(c => (
                <button
                  key={c}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-transform',
                    color === c ? 'border-brand-600 scale-110' : 'border-gray-200 hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Width */}
            <div className="flex items-center gap-0.5">
              {WIDTHS.map(w => (
                <button
                  key={w}
                  className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
                    width === w ? 'bg-gray-200' : 'hover:bg-gray-100'
                  )}
                  onClick={() => setWidth(w)}
                >
                  <div
                    className="rounded-full bg-gray-700"
                    style={{ width: w, height: w }}
                  />
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Actions */}
            <button onClick={handleUndo} className="btn-icon !w-8 !h-8" title="Undo">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={handleClear} className="btn-icon !w-8 !h-8 !text-red-500" title="Clear">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={handleDownload} className="btn-icon !w-8 !h-8" title="Download">
              <Download className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <button onClick={onClose} className="btn-icon !w-8 !h-8">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
}
