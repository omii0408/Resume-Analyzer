import React, { useState } from 'react';
import axios from 'axios';
import { Briefcase, FileSearch, AlertCircle, Sparkles } from 'lucide-react';
import FileUpload from './components/FileUpload';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsDashboard from './components/ResultsDashboard';

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a resume first.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await axios.post('http://localhost:5000/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'An error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      
      {/* Decorative background blur blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float"></div>
        <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-accent-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center p-4 glass-panel rounded-2xl mb-4 shadow-xl">
            <Sparkles className="w-8 h-8 text-primary-500 dark:text-primary-400 animate-pulse" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500 dark:from-primary-400 dark:to-accent-400 drop-shadow-sm">
              AI Resume Analyzer
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
            Upload your resume and paste the job description. Our AI will analyze your fit and provide actionable feedback to land your dream job.
          </p>
        </div>

        {/* Main Content Area */}
        {!result && !isLoading && (
          <div className="glass-panel rounded-3xl p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-500">
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-xl flex items-start space-x-3 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-8">
              {/* File Upload Component */}
              <FileUpload file={file} setFile={setFile} />

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200/50 dark:border-gray-700/50"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50">
                    AND
                  </span>
                </div>
              </div>

              {/* Job Description Input */}
              <div className="w-full group">
                <label htmlFor="jd" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Paste Job Description
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                  <textarea
                    id="jd"
                    rows={6}
                    className="relative block w-full rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-inner focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 sm:text-sm p-4 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white outline-none"
                    placeholder="Paste the full job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Analyze Button */}
              <div className="pt-4">
                <button
                  onClick={handleAnalyze}
                  className="relative w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all transform hover:-translate-y-1 hover:shadow-primary-500/25 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed group overflow-hidden"
                  disabled={!file || !jobDescription.trim()}
                >
                  <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                  <span className="relative flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Resume
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="glass-panel rounded-3xl p-16 animate-in fade-in zoom-in duration-500">
            <LoadingSpinner />
          </div>
        )}

        {/* Results State */}
        {result && !isLoading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-md rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50 transition-all hover:-translate-y-0.5"
            >
              ← Start Over
            </button>
            <ResultsDashboard result={result} />
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
