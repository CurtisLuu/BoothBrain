import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, Download, FileText, Edit3, Save, RotateCcw, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

const PDFEditor = () => {
  const location = useLocation();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [textBlocks, setTextBlocks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [pageImage, setPageImage] = useState(null);
  const fileInputRef = useRef(null);

  // Handle pre-loaded file from navigation state
  useEffect(() => {
    if (location.state?.fileId && location.state?.fromAnnouncerReport) {
      console.log('📄 Loading pre-loaded file from announcer report:', location.state);
      loadPreloadedFile(location.state.fileId, location.state.fileName);
    }
  }, [location.state]);

  // Load pre-loaded file from announcer report
  const loadPreloadedFile = async (fileId, fileName) => {
    setLoading(true);
    try {
      // Create a mock file object for the pre-loaded file
      const mockFile = {
        file_id: fileId,
        filename: fileName,
        total_pages: 0, // Will be updated after we get the actual data
        page_size: { width: 0, height: 0 }
      };
      
      setUploadedFile(mockFile);
      
      // Get file info from backend
      const response = await fetch(`http://localhost:8000/pdf-info/${fileId}`);
      if (response.ok) {
        const fileInfo = await response.json();
        setTotalPages(fileInfo.total_pages);
        setPageSize(fileInfo.page_size);
        
        // Load first page
        await loadPageText(0);
        await loadPageImage(fileId, 0);
      } else {
        // Fallback: try to load page 0 directly
        await loadPageText(0);
        await loadPageImage(fileId, 0);
      }
      
    } catch (error) {
      console.error('Error loading pre-loaded file:', error);
      alert('Failed to load pre-loaded file. Please try uploading manually.');
    } finally {
      setLoading(false);
    }
  };

  // Upload PDF file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.includes('pdf')) {
      alert('Please select a valid PDF file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      const data = await response.json();
      setUploadedFile(data);
      setTotalPages(data.total_pages);
      setPageSize(data.page_size);
      
      // Load first page
      await loadPageText(0);
      await loadPageImage(data.file_id, 0);
      
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Failed to upload PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load text from a specific page
  const loadPageText = async (pageNum) => {
    if (!uploadedFile) return;

    try {
      const response = await fetch('http://localhost:8000/extract-pdf-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: uploadedFile.file_id,
          page: pageNum,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract text');
      }

      const data = await response.json();
      setTextBlocks(data.text_blocks);
      setPageSize(data.page_size);
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Failed to extract text from PDF');
    }
  };

  // Load page image for preview
  const loadPageImage = async (fileId, pageNum) => {
    try {
      const response = await fetch(`http://localhost:8000/pdf-page/${fileId}/${pageNum}`);
      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setPageImage(imageUrl);
      }
    } catch (error) {
      console.error('Error loading page image:', error);
    }
  };

  // Handle page navigation
  const handlePageChange = async (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    
    setCurrentPage(newPage);
    await loadPageText(newPage);
    await loadPageImage(uploadedFile.file_id, newPage);
  };

  // Update text block content
  const updateTextBlock = (blockId, newText) => {
    console.log('Updating text block:', blockId, 'with text:', newText);
    setTextBlocks(prev => {
      const updated = prev.map(block => 
        block.id === blockId ? { ...block, text: newText } : block
      );
      console.log('Updated text blocks:', updated);
      return updated;
    });
  };

  // Save changes to PDF
  const saveChanges = async () => {
    if (!uploadedFile) return;

    console.log('Saving changes for file:', uploadedFile.file_id);
    console.log('Current page:', currentPage);
    console.log('Text blocks to save:', textBlocks);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/update-pdf-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: uploadedFile.file_id,
          page: currentPage,
          text_blocks: textBlocks,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save failed with response:', errorText);
        throw new Error(`Failed to save changes: ${errorText}`);
      }

      const result = await response.json();
      console.log('Save successful:', result);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert(`Failed to save changes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Download edited PDF
  const downloadPDF = async () => {
    if (!uploadedFile) return;

    try {
      const response = await fetch(`http://localhost:8000/download-text-pdf/${uploadedFile.file_id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited_${uploadedFile.filename}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  // Reset to original
  const resetChanges = () => {
    if (uploadedFile) {
      loadPageText(currentPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* PDF Editor Controls */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <FileText className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">PDF Text Editor</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload, edit, and download PDF documents
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {uploadedFile && (
                <>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
                  </button>
                  
                  <button
                    onClick={resetChanges}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={saveChanges}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>

                  <button
                    onClick={downloadPDF}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!uploadedFile ? (
          /* Upload Section */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Upload a PDF to Edit
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Select a PDF file to extract and edit its text content. You can modify the text and download the updated PDF.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Choose PDF File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          /* Editor Section */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Text Editor Panel */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Text Editor
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {textBlocks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No text blocks found on this page
                    </div>
                  ) : (
                    textBlocks.map((block, index) => (
                      <div
                        key={block.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Block {index + 1}
                          </span>
                          <button
                            onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {editingBlock === block.id ? (
                          <textarea
                            value={block.text}
                            onChange={(e) => updateTextBlock(block.id, e.target.value)}
                            className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            onBlur={() => setEditingBlock(null)}
                            autoFocus
                          />
                        ) : (
                          <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                            {block.text}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* PDF Preview Panel */}
            {showPreview && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    PDF Preview
                  </h3>
                  
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    {pageImage ? (
                      <img
                        src={pageImage}
                        alt={`Page ${currentPage + 1}`}
                        className="w-full h-auto"
                        style={{ maxHeight: '600px', objectFit: 'contain' }}
                      />
                    ) : (
                      <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        Loading preview...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFEditor;
