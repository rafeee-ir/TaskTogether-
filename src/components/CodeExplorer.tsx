import React, { useState, useMemo } from 'react';
import { androidProjectFiles, AndroidFile } from '../androidFiles';
import { Folder, FileCode, Copy, Check, Search, ChevronRight, ChevronDown } from 'lucide-react';

interface CodeExplorerProps {
  onFileSelect?: (file: AndroidFile) => void;
}

export default function CodeExplorer({ onFileSelect }: CodeExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(androidProjectFiles[6]); // default to MainActivity.kt
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root': true,
    'app': true,
    'app/src': true,
    'app/src/main': true,
    'app/src/main/res': true,
    'app/src/main/res/values': true,
    'app/src/main/res/values-fa': true,
    'java': true,
    'java/model': true,
    'java/repository': true,
    'java/theme': true,
    'java/navigation': true,
    'java/screen': true,
  });

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileClick = (file: AndroidFile) => {
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  // Basic search filter
  const filteredFiles = useMemo(() => {
    if (!searchTerm) return androidProjectFiles;
    return androidProjectFiles.filter(
      f =>
        f.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

// Renders visual folder structure in a stylized tree
  const findFileByPath = (filePath: string) => {
    return androidProjectFiles.find(f => f.path === filePath) || androidProjectFiles[6]; // MainActivity.kt as fallback
  };

  const navigationItems = [
    { type: 'file', name: 'settings.gradle.kts', file: findFileByPath('settings.gradle.kts') },
    { type: 'file', name: 'build.gradle.kts', file: findFileByPath('build.gradle.kts') },
    {
      type: 'folder',
      name: 'app',
      key: 'app',
      children: [
        { type: 'file', name: 'build.gradle.kts', file: findFileByPath('app/build.gradle.kts') },
        {
          type: 'folder',
          name: 'src/main',
          key: 'app/src/main',
          children: [
            { type: 'file', name: 'AndroidManifest.xml', file: findFileByPath('app/src/main/AndroidManifest.xml') },
            {
              type: 'folder',
              name: 'res',
              key: 'app/src/main/res',
              children: [
                {
                  type: 'folder',
                  name: 'values (English strings)',
                  key: 'app/src/main/res/values',
                  children: [
                    { type: 'file', name: 'strings.xml', file: findFileByPath('app/src/main/res/values/strings.xml') }
                  ]
                },
                {
                  type: 'folder',
                  name: 'values-fa (Persian strings)',
                  key: 'app/src/main/res/values-fa',
                  children: [
                    { type: 'file', name: 'strings.xml', file: findFileByPath('app/src/main/res/values-fa/strings.xml') }
                  ]
                }
              ]
            },
            {
              type: 'folder',
              name: 'java (com.karamana.tasktogether)',
              key: 'java',
              children: [
                { type: 'file', name: 'MainActivity.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/MainActivity.kt') },
                {
                  type: 'folder',
                  name: 'data / model',
                  key: 'java/model',
                  children: [
                    { type: 'file', name: 'User.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/data/model/User.kt') },
                    { type: 'file', name: 'Workspace.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/data/model/Workspace.kt') },
                    { type: 'file', name: 'Task.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/data/model/Task.kt') },
                    { type: 'file', name: 'ChatMessage.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/data/model/ChatMessage.kt') },
                  ]
                },
                {
                  type: 'folder',
                  name: 'data / repository',
                  key: 'java/repository',
                  children: [
                    { type: 'file', name: 'AuthRepository.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/data/repository/AuthRepository.kt') },
                    { type: 'file', name: 'TaskRepository.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/data/repository/TaskRepository.kt') },
                    { type: 'file', name: 'ChatRepository.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/data/repository/ChatRepository.kt') },
                  ]
                },
                {
                  type: 'folder',
                  name: 'ui / navigation',
                  key: 'java/navigation',
                  children: [
                    { type: 'file', name: 'AppNavigation.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/navigation/AppNavigation.kt') },
                  ]
                },
                {
                  type: 'folder',
                  name: 'ui / theme',
                  key: 'java/theme',
                  children: [
                    { type: 'file', name: 'Color.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/theme/Color.kt') },
                    { type: 'file', name: 'Theme.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/theme/Theme.kt') },
                  ]
                },
                {
                  type: 'folder',
                  name: 'ui / screen',
                  key: 'java/screen',
                  children: [
                    { type: 'file', name: '1. SplashScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/SplashScreen.kt') },
                    { type: 'file', name: '2. LoginScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/LoginScreen.kt') },
                    { type: 'file', name: '3. HomeDashboardScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/HomeDashboardScreen.kt') },
                    { type: 'file', name: '4. TaskListScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/TaskListScreen.kt') },
                    { type: 'file', name: '5. AddTaskScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/AddTaskScreen.kt') },
                    { type: 'file', name: '6. TaskDetailsScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/TaskDetailsScreen.kt') },
                    { type: 'file', name: '7. CompletedTasksScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/CompletedTasksScreen.kt') },
                    { type: 'file', name: '8. FamilyMembersScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/FamilyMembersScreen.kt') },
                    { type: 'file', name: '9. InviteMemberScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/InviteMemberScreen.kt') },
                    { type: 'file', name: '10. ChatScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/ChatScreen.kt') },
                    { type: 'file', name: '11. SettingsScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/SettingsScreen.kt') },
                    { type: 'file', name: '12. AboutScreen.kt', file: findFileByPath('app/src/main/java/com/karamana/tasktogether/ui/screen/AboutScreen.kt') },
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  const renderTree = (items: any[], depth = 0) => {
    return items.map((item, index) => {
      const indent = depth * 12;
      if (item.type === 'file') {
        const isSelected = selectedFile.path === item.file.path;
        return (
          <button
            key={index}
            id={`file-btn-${item.file.path.replace(/[/.]/g, '-')}`}
            onClick={() => handleFileClick(item.file)}
            style={{ paddingLeft: `${indent + 12}px` }}
            className={`w-full flex items-center gap-2 py-1.5 pr-2 rounded text-xs text-left transition-colors font-mono ${
              isSelected
                ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCode size={13} className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
            <span className="truncate">{item.name}</span>
          </button>
        );
      } else {
        const isExpanded = expandedFolders[item.key];
        return (
          <div key={index} className="w-full">
            <button
              id={`folder-btn-${item.key.replace(/\//g, '-')}`}
              onClick={() => toggleFolder(item.key)}
              style={{ paddingLeft: `${indent}px` }}
              className="w-full flex items-center justify-between py-1.5 pr-2 rounded text-xs text-slate-650 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                <Folder size={14} className="text-indigo-400 shrink-0" />
                <span className="font-semibold truncate text-slate-700">{item.name}</span>
              </div>
            </button>
            {isExpanded && item.children && (
              <div className="mt-0.5">
                {renderTree(item.children, depth + 1)}
              </div>
            )}
          </div>
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* File Explorer Head */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
          <span className="ml-2 text-xs font-mono font-semibold text-slate-600 select-none">TaskTogether Kotlin Android Base</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-white text-[10px] font-mono text-slate-500 border border-slate-200 uppercase">
          {selectedFile.language}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Tree Explorer Bar */}
        <div className="w-64 border-r border-slate-200 bg-slate-50/60 flex flex-col shrink-0">
          <div className="p-2 border-b border-slate-200">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                id="code-search-input"
                type="text"
                placeholder="Search Kotlin/Gradle files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-250 rounded-md text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {searchTerm ? (
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1">
                  Search Results ({filteredFiles.length})
                </div>
                {filteredFiles.map((file) => (
                  <button
                    key={file.path}
                    id={`search-file-btn-${file.path.replace(/[/.]/g, '-')}`}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center gap-2 py-1.5 px-2 rounded text-xs text-left transition-colors font-mono ${
                      selectedFile.path === file.path
                        ? 'bg-indigo-55 text-indigo-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FileCode size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </button>
                ))}
                {filteredFiles.length === 0 && (
                  <div className="text-xs text-slate-400 text-center py-4">
                    No matching snippets found.
                  </div>
                )}
              </div>
            ) : (
              renderTree(navigationItems)
            )}
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {/* Code Bar Title / Path */}
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-900 flex items-center justify-between">
            <div className="text-xs font-mono text-slate-305 truncate">
              /{selectedFile.path}
            </div>
            <button
              id="copy-code-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Line & Code Display */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed max-w-full">
            <table className="w-full border-collapse">
              <tbody>
                {selectedFile.content.split('\n').map((line, i) => (
                  <tr key={i} className="hover:bg-slate-900/30">
                    <td className="w-8 text-right select-none pr-4 text-slate-600 border-r border-slate-900 text-[10px]">
                      {i + 1}
                    </td>
                    <td className="pl-4 whitespace-pre select-text">
                      {highlightKotlin(line, selectedFile.language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Basic Syntax Highlighter helper mapping tags
function highlightKotlin(line: string, lang: string): React.ReactNode {
  if (lang !== 'kotlin' && lang !== 'gradle') return line;

  const keywords = [
    'package', 'import', 'class', 'interface', 'object', 'fun', 'val', 'var', 'private',
    'internal', 'public', 'override', 'return', 'null', 'this', 'if', 'else', 'when', 'try',
    'catch', 'suspend', 'data', 'enum', 'get', 'set', 'plugins', 'implementation', 'dependencies',
    'android', 'defaultConfig'
  ];

  const words = line.split(/(\W+)/);
  return (
    <>
      {words.map((word, idx) => {
        if (keywords.includes(word)) {
          return <span key={idx} className="text-emerald-400 font-semibold">{word}</span>;
        } else if (word.startsWith('"') || word.startsWith("'") || word.endsWith('"') || word.endsWith("'")) {
          return <span key={idx} className="text-amber-300/90">{word}</span>;
        } else if (word.match(/^\d+$/)) {
          return <span key={idx} className="text-orange-400">{word}</span>;
        } else if (word.startsWith('@')) {
          return <span key={idx} className="text-teal-400">{word}</span>;
        } else if (word.startsWith('//') || word.trim().startsWith('/*') || word.trim().startsWith('*')) {
          return <span key={idx} className="text-slate-500 italic">{word}</span>;
        }
        return word;
      })}
    </>
  );
}
