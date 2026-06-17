import React, { useState } from 'react';
import CodeExplorer from './components/CodeExplorer';
import AndroidSimulator from './components/AndroidSimulator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLanguage, AppTheme } from './types';
import { androidProjectFiles, AndroidFile } from './androidFiles';
import { 
  CheckSquare, 
  Code, 
  Sparkles, 
  Smartphone, 
  ArrowRight, 
  Heart,
  Globe,
  Compass
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>('En');
  const [theme, setTheme] = useState<AppTheme>('Dark');
  
  // Track selected file to dynamically coordinate clicks from the simulator to the inspector
  const [activeInspectorFile, setActiveInspectorFile] = useState<AndroidFile>(androidProjectFiles[6]); // MainActivity as starting default

  // Coordinator callback
  const handleInspectRequest = (filePath: string) => {
    const matched = androidProjectFiles.find(f => f.path === filePath);
    if (matched) {
      setActiveInspectorFile(matched);
      // Trigger visually highlight by simulating click or updating state
      const id = `file-btn-${filePath.replace(/[/.]/g, '-')}`;
      setTimeout(() => {
        const elem = document.getElementById(id);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          elem.click();
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500/25 select-none antialiased">
      
      {/* Top Main Dashboard Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo Brand with styling */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <CheckSquare className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight flex items-center gap-1.5 leading-none text-slate-800 animate-fade-in">
                TaskTogether <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 uppercase">Android Core</span>
              </h1>
              <p className="text-[11px] text-slate-500 mt-1">
                Collaborative Family Task Organizer • Jetpack Compose & MVVM Architecture
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm flex items-center gap-1.5">
              <Globe size={12} className="text-indigo-600" />
              <span>Dual Locale: En (LTR) / Fa (RTL)</span>
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-500" />
              <span>Real-Time AI Companion Sync</span>
            </span>
          </div>

        </div>
      </header>

      {/* Main Split Interface Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Interactive Device Panel (Column span: 5) */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm flex flex-col space-y-4">
            
            {/* Simulation Header / Instructions */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone size={14} className="text-indigo-600" />
                Live Android APK Preview
              </h3>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Authenticate with Google, set up your family circle, and send chat messages. 
                The TaskBot companion translates and logs requests on the task board.
              </p>
            </div>

            {/* Android Device frame container */}
            <ErrorBoundary>
              <AndroidSimulator
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                setTheme={setTheme}
                onCodeInspectNeeded={handleInspectRequest}
              />
            </ErrorBoundary>

            {/* In-app action items shortcuts */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                Developer Inspection Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <button
                  id="inspect-tasks-compose-shortcut"
                  onClick={() => handleInspectRequest('app/src/main/java/com/karamana/tasktogether/ui/screen/TaskListScreen.kt')}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 text-left border border-slate-200 hover:border-indigo-200 hover:text-indigo-700 transition-all truncate font-medium cursor-pointer"
                >
                  ➜ TaskListScreen.kt
                </button>
                <button
                  id="inspect-app-nav-shortcut"
                  onClick={() => handleInspectRequest('app/src/main/java/com/karamana/tasktogether/ui/navigation/AppNavigation.kt')}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 text-left border border-slate-200 hover:border-indigo-200 hover:text-indigo-700 transition-all truncate font-medium cursor-pointer"
                >
                  ➜ AppNavigation.kt
                </button>
                <button
                  id="inspect-task-repository-shortcut"
                  onClick={() => handleInspectRequest('app/src/main/java/com/karamana/tasktogether/data/repository/TaskRepository.kt')}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 text-left border border-slate-200 hover:border-indigo-200 hover:text-indigo-700 transition-all truncate font-medium cursor-pointer"
                >
                  ➜ TaskRepository.kt
                </button>
                <button
                  id="inspect-manifest-shortcut"
                  onClick={() => handleInspectRequest('app/src/main/AndroidManifest.xml')}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 text-left border border-slate-200 hover:border-indigo-200 hover:text-indigo-700 transition-all truncate font-medium cursor-pointer"
                >
                  ➜ AndroidManifest.xml
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Source Code Explorer Panel (Column span: 8) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex-1 flex flex-col h-full min-h-[550px] space-y-4">
            
            {/* Code Explorer Heading */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Code size={14} className="text-indigo-600" />
                  Andoid Project Files & Source Inspector
                </h3>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Browse native Gradle setup files, XML properties (including RTL layout directions), Firebase listeners, and Repositories.
                </p>
              </div>
              <Compass className="text-slate-300 select-none hidden sm:block animate-spin-slow" size={24} />
            </div>

            {/* Code Tree & Viewer */}
            <div className="flex-1">
              <CodeExplorer onFileSelect={(file) => setActiveInspectorFile(file)} />
            </div>

          </div>
        </div>

      </main>

      {/* Dynamic Footer with details */}
      <footer className="mt-8 border-t border-slate-200 bg-white py-6 px-6 select-none font-sans text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span>Powered by</span>
            <span className="font-bold text-slate-700">Jetpack Compose 1.5.8</span>
            <span>&</span>
            <span className="font-bold text-slate-700">Firebase Auth & Firestore SDK</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors">
            <span>Designed with</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 shrink-0" />
            <span>for harmonious family cooperation.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

