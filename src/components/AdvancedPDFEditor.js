import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, Save, Undo, Redo, Type, Pen, Eraser, X, Check, 
  ZoomIn, ZoomOut, RotateCw, FileText, Image, Square, Circle,
  Highlighter, StickyNote, Trash2, Eye, EyeOff
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const AdvancedPDFEditor = ({ file, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [annotations, setAnnotations] = useState([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Load PDF file
  useEffect(() => {
    if (file) {
      loadPDF(file);
    }
  }, [file]);

  const loadPDF = async (file) => {
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPdfDoc(pdfDoc);
      setTotalPages(pdfDoc.getPageCount());
      setCurrentPage(0);
      
      // Render first page
      await renderPage(pdfDoc, 0);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF file. Please try a different file.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (pdfDoc, pageIndex) => {
    const canvas = canvasRef.current;
    if (!canvas || !pdfDoc) return;

    const page = pdfDoc.getPage(pageIndex);
    const { width, height } = page.getSize();
    
    // Set canvas size based on zoom
    canvas.width = width * zoom;
    canvas.height = height * zoom;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(zoom, zoom);
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // For now, we'll create a placeholder since pdf-lib doesn't have built-in rendering
    // In a production app, you'd use PDF.js for rendering
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText(`Page ${pageIndex + 1} of ${pdfDoc.getPageCount()}`, 50, 50);
    ctx.fillText('PDF Editor - Professional Version', 50, 80);
    ctx.fillText('Use the tools to edit this document', 50, 110);
    
    // Draw a sample document layout
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 150, width - 100, height - 200);
    
    // Add some sample content
    ctx.fillStyle = '#333333';
    ctx.font = '14px Arial';
    ctx.fillText('Document Content Area', 60, 180);
    ctx.fillText('This is where your PDF content would be rendered', 60, 200);
    ctx.fillText('You can draw, add text, and annotate here', 60, 220);
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ imageData, annotations: [...annotations] });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
      };
      image.src = prevState.imageData;
      setAnnotations(prevState.annotations);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
      };
      image.src = nextState.imageData;
      setAnnotations(nextState.annotations);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const startDrawing = (e) => {
    if (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'eraser') {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = currentSize * 3;
      } else if (currentTool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = currentColor + '40'; // Add transparency
        ctx.lineWidth = currentSize * 2;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
      }
    } else if (currentTool === 'text') {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      setTextPosition({ x, y });
      setShowTextInput(true);
    } else if (currentTool === 'sticky-note') {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      
      const newAnnotation = {
        id: Date.now(),
        type: 'sticky-note',
        x,
        y,
        text: 'New Note',
        color: currentColor
      };
      setAnnotations([...annotations, newAnnotation]);
      saveToHistory();
    }
  };

  const draw = (e) => {
    if (!isDrawing || currentTool === 'text' || currentTool === 'sticky-note') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const addText = () => {
    if (textInput.trim()) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = currentColor;
      ctx.font = `${currentSize * 8}px Arial`;
      ctx.fillText(textInput, textPosition.x, textPosition.y);
      setTextInput('');
      setShowTextInput(false);
      saveToHistory();
    }
  };

  const exportAsPDF = async () => {
    if (!pdfDoc) return;
    
    try {
      setIsLoading(true);
      
      // Create a new PDF with annotations
      const newPdfDoc = await PDFDocument.create();
      const pages = pdfDoc.getPages();
      
      for (let i = 0; i < pages.length; i++) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        const page = newPdfDoc.addPage(copiedPage);
        
        // Add annotations to the page
        const pageAnnotations = annotations.filter(ann => ann.page === i);
        for (const annotation of pageAnnotations) {
          if (annotation.type === 'text') {
            page.drawText(annotation.text, {
              x: annotation.x,
              y: annotation.y,
              size: annotation.size || 12,
              color: rgb(0, 0, 0),
            });
          }
        }
      }
      
      // Save the PDF
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDocument = () => {
    if (onSave) {
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL('image/png');
      onSave(imageData);
    }
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

  const zoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 3));
  };

  const zoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.5));
  };

  const tools = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'sticky-note', icon: StickyNote, label: 'Note' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full h-full max-w-7xl max-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Advanced PDF Editor</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                ←
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <Redo className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            
            <button
              onClick={saveDocument}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={exportAsPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1">
          {/* Toolbar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-700 p-4 space-y-6">
            {/* Tools */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                {tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id)}
                    className={`flex flex-col items-center space-y-1 p-3 rounded-lg ${
                      currentTool === tool.id 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500'
                    }`}
                  >
                    <tool.icon className="w-5 h-5" />
                    <span className="text-xs">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Colors</h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      currentColor === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Size</h3>
              <input
                type="range"
                min="1"
                max="20"
                value={currentSize}
                onChange={(e) => setCurrentSize(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {currentSize}px
              </div>
            </div>

            {/* Annotations */}
            {annotations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Annotations</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {annotations.map(annotation => (
                    <div key={annotation.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded text-xs">
                      <span>{annotation.type}</span>
                      <button
                        onClick={() => {
                          setAnnotations(annotations.filter(a => a.id !== annotation.id));
                          saveToHistory();
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="flex-1 p-4 overflow-auto bg-gray-100 dark:bg-gray-600">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mx-auto" style={{ maxWidth: 'fit-content' }}>
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="cursor-crosshair block"
                style={{ 
                  maxHeight: 'calc(100vh - 200px)',
                  cursor: currentTool === 'text' ? 'text' : 'crosshair'
                }}
              />
            </div>
          </div>
        </div>

        {/* Text Input Modal */}
        {showTextInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Text</h3>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text to add..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addText}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Text
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPDFEditor;
