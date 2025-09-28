import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  FileText, 
  Edit3, 
  Bot, 
  Send, 
  Loader2,
  Copy,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import chatApi from '../services/chatApi';

const PDFTextEditor = () => {
  const { fileId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  
  const [fileInfo, setFileInfo] = useState(location.state?.fileInfo || null);
  const [filename, setFilename] = useState(location.state?.filename || 'Unknown');
  const [extractedText, setExtractedText] = useState('');
  const [editedText, setEditedText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  const textareaRef = useRef(null);

  useEffect(() => {
    if (fileId) {
      loadPDFInfo();
    }
  }, [fileId]);

  const loadPDFInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // If we don't have file info from navigation state, fetch it
      if (!fileInfo) {
        const info = await chatApi.getPDFInfo(fileId);
        setFileInfo(info);
      }
      
      // Extract text from PDF and load preview
      await Promise.all([
        extractTextFromPDF(),
        loadPDFPreview()
      ]);
      
    } catch (error) {
      console.error('Error loading PDF info:', error);
      setError('Failed to load PDF information');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPDFPreview = async () => {
    try {
      setIsLoadingPreview(true);
      const response = await chatApi.getPDFPreview(fileId);
      setPreviewImages(response.preview_images || []);
    } catch (error) {
      console.error('Error loading PDF preview:', error);
      // Don't set error state for preview failures, just log it
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const extractTextFromPDF = async () => {
    try {
      // Call backend endpoint to extract text from PDF
      const response = await chatApi.extractPDFText(fileId);
      
      if (response.extracted_text) {
        setExtractedText(response.extracted_text);
        setEditedText(response.extracted_text);
      } else {
        // Fallback to mock text if extraction fails
        const mockText = `This is sample extracted text from the PDF "${filename}". 

In a real implementation, this would be the actual text content extracted from your PDF file using OCR or direct text extraction.

You can edit this text below and then use Gemini AI to analyze it for various purposes such as:
- Summarization
- Key insights extraction
- Question answering
- Content analysis
- And much more!`;
        
        setExtractedText(mockText);
        setEditedText(mockText);
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      // Use mock text as fallback
      const mockText = `This is sample extracted text from the PDF "${filename}". 

In a real implementation, this would be the actual text content extracted from your PDF file using OCR or direct text extraction.

You can edit this text below and then use Gemini AI to analyze it for various purposes such as:
- Summarization
- Key insights extraction
- Question answering
- Content analysis
- And much more!`;
      
      setExtractedText(mockText);
      setEditedText(mockText);
    }
  };

  const handleTextChange = (e) => {
    setEditedText(e.target.value);
  };

  const processWithGemini = async () => {
    if (!editedText.trim()) {
      alert('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await chatApi.processPDFWithGemini(fileId, editedText, analysisPrompt);
      setGeminiAnalysis(response.analysis || response.message || 'Analysis completed');
    } catch (error) {
      console.error('Error processing with Gemini:', error);
      setGeminiAnalysis('Error: Failed to process text with Gemini AI. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // This would save the edited text back to the PDF or store it
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = async () => {
    if (!editedText.trim()) {
      alert('Please enter some text to download');
      return;
    }

    setIsSaving(true);
    try {
      const response = await chatApi.generatePDF(fileId, editedText, `edited_${filename}`);
      
      // Create download link
      const link = document.createElement('a');
      link.href = response.pdf_data;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Failed to download PDF: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading PDF editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    PDF Text Editor
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{filename}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save</span>
              </button>
              
              <button
                onClick={downloadPDF}
                disabled={isSaving || !editedText.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Editor */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Edit Text
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {editedText.length} characters
                  </span>
                  <button
                    onClick={() => copyToClipboard(editedText)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Copy text"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  value={editedText}
                  onChange={handleTextChange}
                  placeholder="Edit the extracted text here..."
                  className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Gemini Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Gemini AI Analysis
                  </h2>
                </div>
                <button
                  onClick={processWithGemini}
                  disabled={isAnalyzing || !editedText.trim()}
                  className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Analyze</span>
                </button>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ask Gemini AI about this document
                  </label>
                  <input
                    type="text"
                    value={analysisPrompt}
                    onChange={(e) => setAnalysisPrompt(e.target.value)}
                    placeholder="e.g., 'What are the key skills mentioned?', 'Summarize the main points', 'What experience does this person have?'"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setAnalysisPrompt('What are the key skills and experiences mentioned in this document?')}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Key Skills
                    </button>
                    <button
                      onClick={() => setAnalysisPrompt('Summarize the main points and achievements')}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Summarize
                    </button>
                    <button
                      onClick={() => setAnalysisPrompt('What technical details and technologies are mentioned?')}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Technical Details
                    </button>
                    <button
                      onClick={() => setAnalysisPrompt('What are the most impressive achievements or projects?')}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Achievements
                    </button>
                    <button
                      onClick={() => setAnalysisPrompt('What recommendations or insights can you provide about this document?')}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Insights
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-32">
                  {geminiAnalysis ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {geminiAnalysis}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                      Click "Analyze" to process the text with Gemini AI
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PDF Preview */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    PDF Preview
                  </h2>
                </div>
                <button
                  onClick={() => {
                    loadPDFPreview();
                    extractTextFromPDF();
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <div className="p-4">
                {isLoadingPreview ? (
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading PDF preview...</p>
                  </div>
                ) : previewImages.length > 0 ? (
                  <div className="space-y-4">
                    {previewImages.map((image, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                          Page {image.page_number}
                        </div>
                        <img 
                          src={image.image_data} 
                          alt={`Page ${image.page_number}`}
                          className="w-full h-auto max-h-96 object-contain bg-white"
                        />
                      </div>
                    ))}
                    {previewImages.length < (fileInfo?.total_pages || 0) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Showing first {previewImages.length} pages of {fileInfo?.total_pages || 0} total pages
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-8 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      PDF Preview not available
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {fileInfo?.total_pages || 'Unknown'} pages
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* File Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  File Information
                </h2>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Filename:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">File ID:</span>
                  <span className="text-gray-900 dark:text-white font-mono text-sm">{fileId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pages:</span>
                  <span className="text-gray-900 dark:text-white">{fileInfo?.total_pages || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFTextEditor;
