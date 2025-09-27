import React, { useState, useRef } from 'react';
import { Upload, FileText, Edit3, Download, Home, BarChart3, Calendar, Moon, Sun, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import InteractivePDFEditor from './InteractivePDFEditor';

const ImportPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [activePage, setActivePage] = useState('import');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPDFEditor, setShowPDFEditor] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (file) => {
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setFileName(file.name);
    } else {
      alert('Please upload a PDF file only.');
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  // Handle edit PDF
  const handleEditPDF = () => {
    if (uploadedFile) {
      setShowPDFEditor(true);
    }
  };

  // Handle PDF editor close
  const handlePDFEditorClose = () => {
    setShowPDFEditor(false);
  };

  // Handle PDF editor save
  const handlePDFEditorSave = (editedImageData) => {
    // Convert the edited image data back to a file
    const link = document.createElement('a');
    link.download = `edited_${fileName}`;
    link.href = editedImageData;
    link.click();
    setShowPDFEditor(false);
  };

  // Handle download
  const handleDownload = () => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Navigation functions
  const navigateToHome = () => {
    setActivePage('home');
    navigate('/');
  };

  const navigateToStats = () => {
    setActivePage('stats');
    navigate('/stats');
  };

  const navigateToSchedule = () => {
    setActivePage('schedule');
    navigate('/schedule');
  };

  const navigateToImport = () => {
    setActivePage('import');
    navigate('/import');
  };

  // Search functionality (placeholder for future AI integration)
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert('Search functionality will be available soon with AI integration!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black dark:text-white">Import & Edit</h1>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Upload and edit PDFs with AI assistance</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={navigateToHome}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    activePage === 'home' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
                <button
                  onClick={navigateToStats}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    activePage === 'stats' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Stats</span>
                </button>
                <button
                  onClick={navigateToSchedule}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    activePage === 'schedule' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
                <button
                  onClick={navigateToImport}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    activePage === 'import' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-48 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="px-3 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Upload className="w-6 h-6 mr-3 text-primary-600" />
              Upload PDF Document
            </h2>
            
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="space-y-4">
                  <FileText className="w-16 h-16 text-primary-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {fileName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PDF uploaded successfully
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleEditPDF}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit PDF</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Drop your PDF here
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      or click to browse files
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Choose File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Coming Soon: AI-Powered Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  PDF Editing
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Extract text and data from PDFs</li>
                  <li>• Edit content with AI assistance</li>
                  <li>• Annotate and highlight important sections</li>
                  <li>• Convert to different formats</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Smart Analysis
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• AI-powered document analysis</li>
                  <li>• Automatic data extraction</li>
                  <li>• Content summarization</li>
                  <li>• Integration with game statistics</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              How to Use
            </h3>
            <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>1. Upload a PDF document using the drag-and-drop area or file browser</li>
              <li>2. Once uploaded, you can download the file or prepare it for editing</li>
              <li>3. AI-powered editing features will be available in future updates</li>
              <li>4. Use the search bar to find and manage your uploaded documents</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Interactive PDF Editor Modal */}
      {showPDFEditor && (
        <InteractivePDFEditor
          file={uploadedFile}
          onClose={handlePDFEditorClose}
          onSave={handlePDFEditorSave}
        />
      )}
    </div>
  );
};

export default ImportPage;
