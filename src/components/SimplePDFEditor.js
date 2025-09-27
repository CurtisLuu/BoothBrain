import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, Save, Undo, Redo, Type, Pen, Eraser, X, 
  ZoomIn, ZoomOut, Highlighter, StickyNote, Trash2, 
  MousePointer2, Square, Circle
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const SimplePDFEditor = ({ file, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [currentTool, setCurrentTool] = useState('pointer');
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
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Load PDF file
  useEffect(() => {
    const loadPDF = async (file) => {
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPdfDoc(pdfDoc);
        setTotalPages(pdfDoc.getPageCount());
        setCurrentPage(0);
        
        // Render first page
        await renderPDFPage(pdfDoc, 0);
        
      } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF file. Please try a different file.');
      } finally {
        setIsLoading(false);
      }
    };

    if (file) {
      loadPDF(file);
    }
  }, [file]);

  const renderPDFPage = async (pdfDoc, pageIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
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
      
      // Create a professional document layout
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('PDF Editor - Professional Version', 50, 40);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText(`Page ${pageIndex + 1} of ${pdfDoc.getPageCount()}`, 50, 65);
      
      // Draw document border
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.strokeRect(50, 80, width - 100, height - 120);
      
      // Add sample content that represents the PDF
      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      ctx.fillText('Document Content', 60, 110);
      
      ctx.font = '12px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('This represents your uploaded PDF content', 60, 135);
      ctx.fillText('You can draw, add text, highlight, and annotate here', 60, 155);
      ctx.fillText('Use the pointer tool to move elements around', 60, 175);
      
      // Draw some sample elements
      drawSampleElements(ctx, width, height);
      
      // Render annotations on top
      renderAnnotations(ctx);
      
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  };

  const drawSampleElements = (ctx, width, height) => {
    // Draw sample text box
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 200, 100, 30);
    ctx.fillStyle = '#4CAF50';
    ctx.font = '10px Arial';
    ctx.fillText('Sample Box', 70, 220);
    
    // Draw sample circle
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(200, 215, 15, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#2196F3';
    ctx.fillText('Circle', 185, 240);
    
    // Draw sample rectangle
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.strokeRect(250, 200, 80, 40);
    ctx.fillStyle = '#FF9800';
    ctx.fillText('Rectangle', 260, 225);
    
    // Draw sample line
    ctx.strokeStyle = '#9C27B0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 280);
    ctx.lineTo(200, 280);
    ctx.stroke();
    ctx.fillStyle = '#9C27B0';
    ctx.fillText('Line', 60, 295);
  };

  const renderAnnotations = (ctx) => {
    annotations.forEach(annotation => {
      if (annotation.page !== currentPage) return;
      
      ctx.save();
      
      switch (annotation.type) {
        case 'text':
          ctx.fillStyle = annotation.color || '#000000';
          ctx.font = `${annotation.size || 12}px Arial`;
          ctx.fillText(annotation.text, annotation.x, annotation.y);
          break;
          
        case 'sticky-note':
          ctx.fillStyle = annotation.color || '#FFD700';
          ctx.fillRect(annotation.x, annotation.y, 100, 60);
          ctx.fillStyle = '#000000';
          ctx.font = '10px Arial';
          ctx.fillText(annotation.text || 'Note', annotation.x + 5, annotation.y + 15);
          break;
          
        case 'highlight':
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = annotation.color || '#FFFF00';
          ctx.fillRect(annotation.x, annotation.y, annotation.width || 100, annotation.height || 20);
          ctx.globalAlpha = 1;
          break;
          
        case 'drawing':
          ctx.strokeStyle = annotation.color || '#000000';
          ctx.lineWidth = annotation.size || 2;
          ctx.beginPath();
          annotation.points.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          ctx.stroke();
          break;
          
        case 'rectangle':
          ctx.strokeStyle = annotation.color || '#000000';
          ctx.lineWidth = annotation.size || 2;
          ctx.strokeRect(annotation.x, annotation.y, annotation.width || 100, annotation.height || 50);
          break;
          
        case 'circle':
          ctx.strokeStyle = annotation.color || '#000000';
          ctx.lineWidth = annotation.size || 2;
          ctx.beginPath();
          ctx.arc(annotation.x + (annotation.width || 50) / 2, annotation.y + (annotation.height || 50) / 2, 
                 (annotation.width || 50) / 2, 0, 2 * Math.PI);
          ctx.stroke();
          break;
          
        default:
          // Handle unknown annotation types
          break;
      }
      
      // Draw selection indicator
      if (selectedAnnotation && selectedAnnotation.id === annotation.id) {
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(annotation.x - 5, annotation.y - 5, 
          annotation.width ? annotation.width + 10 : 110, 
          annotation.height ? annotation.height + 10 : 70);
        ctx.setLineDash([]);
      }
      
      ctx.restore();
    });
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ 
        imageData, 
        annotations: [...annotations],
        page: currentPage 
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setAnnotations(prevState.annotations);
      setHistoryIndex(historyIndex - 1);
      
      // Re-render the page
      if (pdfDoc) {
        renderPDFPage(pdfDoc, currentPage);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setAnnotations(nextState.annotations);
      setHistoryIndex(historyIndex + 1);
      
      // Re-render the page
      if (pdfDoc) {
        renderPDFPage(pdfDoc, currentPage);
      }
    }
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };

  const findAnnotationAt = (x, y) => {
    return annotations.find(annotation => {
      if (annotation.page !== currentPage) return false;
      
      const margin = 10; // Click tolerance
      return x >= annotation.x - margin && 
             x <= annotation.x + (annotation.width || 100) + margin &&
             y >= annotation.y - margin && 
             y <= annotation.y + (annotation.height || 60) + margin;
    });
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    
    if (currentTool === 'pointer') {
      const annotation = findAnnotationAt(pos.x, pos.y);
      if (annotation) {
        setSelectedAnnotation(annotation);
        setIsDragging(true);
        setDragOffset({
          x: pos.x - annotation.x,
          y: pos.y - annotation.y
        });
      } else {
        setSelectedAnnotation(null);
      }
    } else if (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'eraser') {
      setIsDrawing(true);
      const newAnnotation = {
        id: Date.now(),
        type: 'drawing',
        x: pos.x,
        y: pos.y,
        points: [pos],
        color: currentColor,
        size: currentSize,
        page: currentPage
      };
      setAnnotations([...annotations, newAnnotation]);
    } else if (currentTool === 'text') {
      setTextPosition(pos);
      setShowTextInput(true);
    } else if (currentTool === 'sticky-note') {
      const newAnnotation = {
        id: Date.now(),
        type: 'sticky-note',
        x: pos.x,
        y: pos.y,
        text: 'New Note',
        color: currentColor,
        page: currentPage
      };
      setAnnotations([...annotations, newAnnotation]);
      saveToHistory();
    } else if (currentTool === 'rectangle') {
      const newAnnotation = {
        id: Date.now(),
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 50,
        color: currentColor,
        size: currentSize,
        page: currentPage
      };
      setAnnotations([...annotations, newAnnotation]);
      saveToHistory();
    } else if (currentTool === 'circle') {
      const newAnnotation = {
        id: Date.now(),
        type: 'circle',
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 100,
        color: currentColor,
        size: currentSize,
        page: currentPage
      };
      setAnnotations([...annotations, newAnnotation]);
      saveToHistory();
    }
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    
    if (isDragging && selectedAnnotation) {
      const newAnnotations = annotations.map(annotation => {
        if (annotation.id === selectedAnnotation.id) {
          return {
            ...annotation,
            x: pos.x - dragOffset.x,
            y: pos.y - dragOffset.y
          };
        }
        return annotation;
      });
      setAnnotations(newAnnotations);
    } else if (isDrawing && (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'eraser')) {
      const newAnnotations = [...annotations];
      const lastAnnotation = newAnnotations[newAnnotations.length - 1];
      if (lastAnnotation && lastAnnotation.type === 'drawing') {
        lastAnnotation.points.push(pos);
        setAnnotations(newAnnotations);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
    if (isDragging) {
      setIsDragging(false);
      saveToHistory();
    }
  };

  const addText = () => {
    if (textInput.trim()) {
      const newAnnotation = {
        id: Date.now(),
        type: 'text',
        x: textPosition.x,
        y: textPosition.y,
        text: textInput,
        color: currentColor,
        size: currentSize * 8,
        page: currentPage
      };
      setAnnotations([...annotations, newAnnotation]);
      setTextInput('');
      setShowTextInput(false);
      saveToHistory();
    }
  };

  const deleteSelectedAnnotation = () => {
    if (selectedAnnotation) {
      setAnnotations(annotations.filter(a => a.id !== selectedAnnotation.id));
      setSelectedAnnotation(null);
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
        const font = await newPdfDoc.embedFont(StandardFonts.Helvetica);
        
        for (const annotation of pageAnnotations) {
          if (annotation.type === 'text') {
            page.drawText(annotation.text, {
              x: annotation.x,
              y: annotation.y,
              size: annotation.size || 12,
              font: font,
              color: rgb(0, 0, 0),
            });
          } else if (annotation.type === 'rectangle') {
            page.drawRectangle({
              x: annotation.x,
              y: annotation.y,
              width: annotation.width || 100,
              height: annotation.height || 50,
              borderColor: rgb(0, 0, 0),
              borderWidth: annotation.size || 2,
            });
          } else if (annotation.type === 'circle') {
            page.drawCircle({
              x: annotation.x + (annotation.width || 50) / 2,
              y: annotation.y + (annotation.height || 50) / 2,
              size: (annotation.width || 50) / 2,
              borderColor: rgb(0, 0, 0),
              borderWidth: annotation.size || 2,
            });
          }
        }
      }
      
      // Set document metadata
      newPdfDoc.setTitle(`Edited ${file.name}`);
      newPdfDoc.setAuthor('PDF Editor');
      newPdfDoc.setCreator('Football AI PDF Editor');
      newPdfDoc.setCreationDate(new Date());
      newPdfDoc.setModificationDate(new Date());
      
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
      renderPDFPage(pdfDoc, currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      renderPDFPage(pdfDoc, currentPage - 1);
    }
  };

  const zoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 3));
    if (pdfDoc) {
      renderPDFPage(pdfDoc, currentPage);
    }
  };

  const zoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.5));
    if (pdfDoc) {
      renderPDFPage(pdfDoc, currentPage);
    }
  };

  const tools = [
    { id: 'pointer', icon: MousePointer2, label: 'Pointer', description: 'Select and move elements' },
    { id: 'pen', icon: Pen, label: 'Pen', description: 'Draw with pen' },
    { id: 'highlighter', icon: Highlighter, label: 'Highlighter', description: 'Highlight text' },
    { id: 'text', icon: Type, label: 'Text', description: 'Add text' },
    { id: 'sticky-note', icon: StickyNote, label: 'Note', description: 'Add sticky note' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', description: 'Draw rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle', description: 'Draw circle' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', description: 'Erase content' },
  ];

  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Purple', value: '#FF00FF' },
    { name: 'Cyan', value: '#00FFFF' },
    { name: 'Orange', value: '#FFA500' },
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">PDF Editor</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                ←
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[80px] text-center">
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
            
            {selectedAnnotation && (
              <button
                onClick={deleteSelectedAnnotation}
                className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                title="Delete selected element"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
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
          <div className="w-72 bg-gray-50 dark:bg-gray-700 p-4 space-y-6 overflow-y-auto">
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
                    title={tool.description}
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
                    key={color.value}
                    onClick={() => setCurrentColor(color.value)}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      currentColor === color.value ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
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

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Use</h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• <strong>Pointer:</strong> Click and drag to move elements</li>
                <li>• <strong>Pen:</strong> Draw freehand on the PDF</li>
                <li>• <strong>Text:</strong> Click to add text annotations</li>
                <li>• <strong>Shapes:</strong> Click to add rectangles/circles</li>
                <li>• <strong>Delete:</strong> Select element and click trash icon</li>
              </ul>
            </div>

            {/* Annotations */}
            {annotations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Annotations</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {annotations.filter(a => a.page === currentPage).map(annotation => (
                    <div 
                      key={annotation.id} 
                      className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer ${
                        selectedAnnotation && selectedAnnotation.id === annotation.id
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500'
                      }`}
                      onClick={() => setSelectedAnnotation(annotation)}
                    >
                      <span>{annotation.type}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnnotations(annotations.filter(a => a.id !== annotation.id));
                          if (selectedAnnotation && selectedAnnotation.id === annotation.id) {
                            setSelectedAnnotation(null);
                          }
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
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="block"
                style={{ 
                  maxHeight: 'calc(100vh - 200px)',
                  cursor: currentTool === 'pointer' ? 'pointer' : 
                          currentTool === 'text' ? 'text' : 'crosshair'
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

export default SimplePDFEditor;