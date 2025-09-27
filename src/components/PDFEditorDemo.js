import React, { useState } from 'react';
import { FileText, Edit3, Download, X } from 'lucide-react';
import PDFEditor from './PDFEditor';
import AdvancedPDFEditor from './AdvancedPDFEditor';
import ProfessionalPDFEditor from './ProfessionalPDFEditor';

const PDFEditorDemo = ({ onClose }) => {
  const [selectedEditor, setSelectedEditor] = useState(null);
  const [demoFile] = useState(new File(['demo'], 'demo.pdf', { type: 'application/pdf' }));

  const editors = [
    {
      id: 'basic',
      name: 'Basic PDF Editor',
      component: PDFEditor,
      description: 'Simple drawing and text tools',
      features: ['Pen tool', 'Text tool', 'Eraser', 'Undo/Redo', 'Color picker']
    },
    {
      id: 'advanced',
      name: 'Advanced PDF Editor',
      component: AdvancedPDFEditor,
      description: 'Enhanced tools with PDF-lib integration',
      features: ['All basic tools', 'Highlighter', 'Sticky notes', 'Page navigation', 'Zoom controls', 'PDF export']
    },
    {
      id: 'professional',
      name: 'Professional PDF Editor',
      component: ProfessionalPDFEditor,
      description: 'Full-featured editor with layers and annotations',
      features: ['All advanced tools', 'Layers panel', 'Shape tools', 'Annotation management', 'Professional UI', 'PDF-lib integration']
    }
  ];

  const handleEditorClose = () => {
    setSelectedEditor(null);
  };

  const handleEditorSave = (data) => {
    console.log('Editor save:', data);
    setSelectedEditor(null);
  };

  if (selectedEditor) {
    const EditorComponent = editors.find(e => e.id === selectedEditor)?.component;
    return (
      <EditorComponent
        file={demoFile}
        onClose={handleEditorClose}
        onSave={handleEditorSave}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">PDF Editor Options</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {editors.map(editor => (
              <div key={editor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editor.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{editor.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {editor.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setSelectedEditor(editor.id)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Try {editor.name}</span>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Recommendation</h4>
            <p className="text-blue-800 dark:text-blue-200">
              For the best user experience, we recommend the <strong>Professional PDF Editor</strong>. 
              It includes all features from the other editors plus advanced tools like layers, 
              shape drawing, and comprehensive annotation management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFEditorDemo;
