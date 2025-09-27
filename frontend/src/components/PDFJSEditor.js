import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download, Save, Type, Pen, Eraser, X,
  ZoomIn, ZoomOut, Highlighter, StickyNote, Trash2,
  MousePointer2, Square, Circle, Upload
} from 'lucide-react';

const PDFJSEditor = ({ file, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [annotations, setAnnotations] = useState([]);
  const [currentTool, setCurrentTool] = useState('pointer');
  const [drawingColor, setDrawingColor] = useState('#FF0000');
  const [drawingSize, setDrawingSize] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load PDF.js dynamically
  useEffect(() => {
    const loadPDFJS = async () => {
      try {
        // Load PDF.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          loadPDF();
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading PDF.js:', error);
        alert('Error loading PDF.js. Please try again.');
      }
    };

    if (file) {
      loadPDFJS();
    }
  }, [file]);

  const loadPDF = useCallback(async () => {
    if (!file || !window.pdfjsLib) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(0);
      setAnnotations([]);
      
      // Load first page
      await renderPage(pdf, 0);
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const renderPage = useCallback(async (pdf, pageNum) => {
    if (!pdf || !canvasRef.current) return;

    try {
      const page = await pdf.getPage(pageNum + 1); // PDF.js uses 1-based indexing
      const viewport = page.getViewport({ scale: zoom });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Render annotations
      renderAnnotations(context, viewport);
      
    } catch (error) {
      console.error('Error rendering page:', error);
      alert('Error rendering page. Please try again.');
    }
  }, [zoom, annotations, currentPage]);

  const renderAnnotations = useCallback((context, viewport) => {
    context.save();
    
    annotations.forEach(annotation => {
      if (annotation.page !== currentPage) return;
      
      context.strokeStyle = annotation.color || drawingColor;
      context.lineWidth = annotation.size || drawingSize;
      context.fillStyle = annotation.color || drawingColor;
      
      switch (annotation.type) {
        case 'pen':
          context.beginPath();
          context.moveTo(annotation.points[0].x, annotation.points[0].y);
          for (let i = 1; i < annotation.points.length; i++) {
            context.lineTo(annotation.points[i].x, annotation.points[i].y);
          }
          context.stroke();
          break;
          
        case 'text':
          context.font = `${annotation.size || 16}px Arial`;
          context.fillText(annotation.text, annotation.x, annotation.y);
          break;
          
        case 'rect':
          context.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
          break;
          
        case 'circle':
          context.beginPath();
          context.arc(annotation.x, annotation.y, annotation.radius, 0, 2 * Math.PI);
          context.stroke();
          break;
          
        case 'highlighter':
          context.globalAlpha = 0.3;
          context.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
          context.globalAlpha = 1.0;
          break;
          
        default:
          break;
      }
    });
    
    context.restore();
  }, [annotations, currentPage, drawingColor, drawingSize]);

  const handleCanvasMouseDown = (e) => {
    if (currentTool === 'pointer') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setIsDrawing(true);
    
    if (currentTool === 'pen') {
      const newAnnotation = {
        id: Date.now(),
        type: 'pen',
        page: currentPage,
        points: [{ x, y }],
        color: drawingColor,
        size: drawingSize
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    } else if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newAnnotation = {
          id: Date.now(),
          type: 'text',
          page: currentPage,
          x, y,
          text,
          color: drawingColor,
          size: drawingSize
        };
        setAnnotations(prev => [...prev, newAnnotation]);
        renderPage(pdfDoc, currentPage);
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || currentTool !== 'pen') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setAnnotations(prev => {
      const newAnnotations = [...prev];
      const lastAnnotation = newAnnotations[newAnnotations.length - 1];
      if (lastAnnotation && lastAnnotation.type === 'pen' && lastAnnotation.page === currentPage) {
        lastAnnotation.points.push({ x, y });
      }
      return newAnnotations;
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        annotations,
        totalPages,
        currentPage
      });
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'edited-pdf.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      renderPage(pdfDoc, currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      renderPage(pdfDoc, currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-center">Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">PDF Editor (PDF.js)</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-2 p-4 border-b">
          <button
            onClick={() => setCurrentTool('pointer')}
            className={`p-2 rounded ${currentTool === 'pointer' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            title="Pointer"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentTool('pen')}
            className={`p-2 rounded ${currentTool === 'pen' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            title="Pen"
          >
            <Pen className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentTool('text')}
            className={`p-2 rounded ${currentTool === 'text' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            title="Text"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentTool('rect')}
            className={`p-2 rounded ${currentTool === 'rect' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentTool('circle')}
            className={`p-2 rounded ${currentTool === 'circle' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentTool('highlighter')}
            className={`p-2 rounded ${currentTool === 'highlighter' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            title="Highlighter"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentTool('eraser')}
            className={`p-2 rounded ${currentTool === 'eraser' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
          
          <div className="border-l pl-2">
            <input
              type="color"
              value={drawingColor}
              onChange={(e) => setDrawingColor(e.target.value)}
              className="w-8 h-8 rounded border"
            />
          </div>
          
          <div className="border-l pl-2">
            <input
              type="range"
              min="1"
              max="10"
              value={drawingSize}
              onChange={(e) => setDrawingSize(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="ml-1 text-sm">{drawingSize}px</span>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col">
          {/* Page Navigation */}
          <div className="flex items-center justify-center space-x-4 p-2 border-b">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-4">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className="border border-gray-300 cursor-crosshair"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFJSEditor;
