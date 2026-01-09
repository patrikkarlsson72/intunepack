import { useState, useEffect } from "react";
import { Package, ChevronUp, ChevronDown, Sun, Moon, Loader2, Info, FolderOpen, FileArchive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AboutModal } from "@/components/AboutModal";
import { useTheme } from "./contexts/ThemeContext";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import "./App.css";

interface ProgressUpdate {
  progress: number;
  message: string;
  timestamp: string;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentOperation, setCurrentOperation] = useState<'create' | 'extract' | null>(null);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedSetupFile, setSelectedSetupFile] = useState<string | null>(null);
  const [outputFolder, setOutputFolder] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState<string>("");
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Set up event listeners for progress updates
  useEffect(() => {
    const unlisten = listen<ProgressUpdate>('progress-update', (event) => {
      const { progress: newProgress, message, timestamp } = event.payload;
      setProgress(newProgress);
      setLogs(prev => [...prev, `[${new Date(timestamp).toLocaleTimeString()}] ${message}`]);
      
      if (newProgress === 100) {
        setStatus('completed');
        setCurrentOperation(null);
      }
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+O for open file dialog
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        handleBrowseFiles();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto-open logs when operation starts
  useEffect(() => {
    if (status === 'processing') {
      setIsLogsOpen(true);
    }
  }, [status]);



  const handleCreatePackage = async () => {
    setStatus('processing');
    setProgress(0);
    setLogs([]);
    
    try {
      // Step 1: Select setup folder (if not already selected)
      let setupFolder = selectedFilePath;
      
      if (!setupFolder) {
        setupFolder = await openDialog({
          title: 'Select folder containing setup files',
          directory: true,
          multiple: false,
        });
        
        if (!setupFolder) {
          setStatus('idle');
          return;
        }
        
        setSelectedFilePath(setupFolder);
      }
      
      // Step 2: Select setup file
      let setupFile = selectedSetupFile;
      
      if (!setupFile) {
        setupFile = await openDialog({
          title: 'Select setup file (e.g., setup.exe, setup.msi)',
          directory: false,
          multiple: false,
          filters: [
            { name: 'Executable Files', extensions: ['exe', 'msi'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        
        if (!setupFile) {
          setStatus('idle');
          return;
        }
        
        // Extract just the filename from the full path
        const filename = setupFile.split('/').pop() || setupFile.split('\\').pop() || setupFile;
        setSelectedSetupFile(filename);
        setupFile = filename;
      }
      
      // Step 3: Use setup folder as output directory (simplified workflow)
      const outputDir = setupFolder;
      setOutputFolder(outputDir);
      
      // Step 4: Get output filename
      let filename = outputFilename;
      
      if (!filename) {
        // Generate default filename based on setup file
        const baseName = setupFile.replace(/\.[^/.]+$/, ""); // Remove extension
        filename = `${baseName}.intunewin`;
        setOutputFilename(filename);
      }
      
      // Now call the create_intunewin command with correct parameters
      await invoke('create_intunewin', {
        setupFolder,
        setupFile,
        outputFolder: outputDir
      });
      
    } catch (error) {
      setStatus('failed');
      setLogs(prev => [...prev, `Error: ${error}`]);
    }
  };

  const handleExtractPackage = async () => {
    setStatus('processing');
    setProgress(0);
    setLogs([]);
    
    try {
      // Use the already selected file path if available, otherwise open file dialog
      let selectedFile = selectedFilePath;
      
      
      if (!selectedFile) {
        // Open file dialog to select .intunewin file
        selectedFile = await openDialog({
          title: 'Select .intunewin file to extract',
          directory: false,
          multiple: false,
          filters: [{
            name: 'IntuneWin Files',
            extensions: ['intunewin']
          }]
        });
        
        if (!selectedFile) {
          setStatus('idle');
          return;
        }
        
        // Store the selected file path for future use
        setSelectedFilePath(selectedFile);
      } else {
      }
      
      // Extract to the same directory as the .intunewin file (simplified workflow)
      const lastSlash = Math.max(selectedFile.lastIndexOf('\\'), selectedFile.lastIndexOf('/'));
      const outputDir = lastSlash > -1 ? selectedFile.substring(0, lastSlash) : selectedFile;
      
      // Store the selected output directory for display in workflow box
      setOutputFolder(outputDir);
      
      await invoke('extract_intunewin', {
        filePath: selectedFile,
        outputDir
      });
      
    } catch (error) {
      setStatus('failed');
      setLogs(prev => [...prev, `Error: ${error}`]);
    }
  };

  const handleBrowseFiles = async () => {
    try {
      const selectedFile = await openDialog({
        title: 'Select file to process',
        directory: false,
        multiple: false,
      });
      
      
      if (selectedFile) {
        // Store the full file path
        setSelectedFilePath(selectedFile);
        
        // Determine operation type based on file extension
        if (selectedFile.toLowerCase().endsWith('.intunewin')) {
          setCurrentOperation('extract');
          setDroppedFiles([{ name: selectedFile.split('/').pop() || selectedFile } as File]);
        } else {
          setCurrentOperation('create');
          setDroppedFiles([{ name: selectedFile.split('/').pop() || selectedFile } as File]);
        }
      }
    } catch (error) {
    }
  };

  const handleBrowseFolders = async () => {
    try {
      const selectedFolder = await openDialog({
        title: 'Select folder to process',
        directory: true,
        multiple: false,
      });
      
      if (selectedFolder) {
        // Store the full folder path
        setSelectedFilePath(selectedFolder);
        setCurrentOperation('create');
        setDroppedFiles([{ name: selectedFolder.split('/').pop() || selectedFolder } as File]);
      }
    } catch (error) {
    }
  };

  const clearSelectedFile = () => {
    setSelectedFilePath(null);
    setSelectedSetupFile(null);
    setOutputFolder(null);
    setOutputFilename("");
    setDroppedFiles([]);
    setCurrentOperation(null);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'idle':
        return <Badge variant="secondary">Ready</Badge>;
      case 'processing':
        return <Badge variant="default">Processing...</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Ready</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={theme === 'dark' ? "/logodarktheme.png" : "/logo.png"} 
              alt="IntunePack Logo" 
              className="app-logo"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAboutOpen(true)}
              className="h-9 w-9"
              title="About IntunePack"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            {getStatusBadge()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-8">
        {/* Operation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Create Package Card */}
          <Card 
            className={`
              transition-all duration-200 cursor-pointer flex flex-col
              border-2 hover:shadow-xl
              ${currentOperation === 'create' 
                ? 'border-primary ring-2 ring-primary/20 shadow-lg' 
                : 'border-primary/20 hover:border-primary/40'
              }
            `}
          >
            <CardHeader className="space-y-2">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <FolderOpen className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">Create Package</CardTitle>
                  <p className="text-sm text-muted-foreground min-h-[48px]">
                    Package your application into a .intunewin file for Intune deployment
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 mt-auto">
              <Button 
                onClick={handleBrowseFolders}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
                disabled={status === 'processing' && currentOperation === 'create'}
              >
                {status === 'processing' && currentOperation === 'create' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderOpen className="mr-2 h-5 w-5" />
                    Browse Folder
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Select folder containing setup files
              </p>
            </CardContent>
          </Card>

          {/* Extract Package Card */}
          <Card 
            className={`
              transition-all duration-200 cursor-pointer flex flex-col
              border-2 hover:shadow-xl
              ${currentOperation === 'extract' 
                ? 'border-green-500 ring-2 ring-green-500/20 shadow-lg' 
                : 'border-green-500/20 hover:border-green-500/40'
              }
            `}
          >
            <CardHeader className="space-y-2">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-green-500/10 rounded-full">
                  <FileArchive className="h-12 w-12 text-green-500" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">Extract Package</CardTitle>
                  <p className="text-sm text-muted-foreground min-h-[48px]">
                    Extract and view the contents of an existing .intunewin file
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 mt-auto">
              <Button 
                onClick={handleBrowseFiles}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                size="lg"
                disabled={status === 'processing' && currentOperation === 'extract'}
              >
                {status === 'processing' && currentOperation === 'extract' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <FileArchive className="mr-2 h-5 w-5" />
                    Browse File
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Select .intunewin file to extract
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Panel - Shows when idle */}
        {!selectedFilePath && !currentOperation && status === 'idle' && (
          <Card className="border-2 border-dashed border-primary/20 bg-muted/20">
            <CardContent className="pt-6 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  👋 Welcome to IntunePack
                </h2>
                <p className="text-muted-foreground">
                  Your desktop tool for creating and extracting .intunewin packages
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Quick Start
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Click "Browse Folder" to create packages</li>
                    <li>• Click "Browse File" to extract packages</li>
                    <li>• Output saved to same location automatically</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    Tips & Shortcuts
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Press <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">Ctrl+O</kbd> to open file browser</li>
                    <li>• Logs auto-open during operations</li>
                    <li>• Theme toggle in top-right corner</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  Version 1.2.1 • Ready for Windows 10/11
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflow Status - Shows after selection */}
        {(droppedFiles.length > 0 || selectedFilePath || selectedSetupFile || outputFolder) && (
          <Card className="border-2">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                {currentOperation === 'extract' ? (
                  <>
                    <FileArchive className="h-5 w-5 text-green-500" />
                    Package Extraction Workflow
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5 text-primary" />
                    Package Creation Workflow
                  </>
                )}
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {currentOperation === 'extract' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${selectedFilePath ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span>Source File: {selectedFilePath ? selectedFilePath.split('/').pop() || selectedFilePath.split('\\').pop() : 'Not selected'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-blue-500">Extract To: Same folder (automatic)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${selectedFilePath ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span>Setup Folder: {selectedFilePath ? selectedFilePath.split('/').pop() || selectedFilePath.split('\\').pop() : 'Not selected'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${selectedSetupFile ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span>Setup File: {selectedSetupFile || 'Not selected'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-blue-500">Output: Same folder (automatic)</span>
                    </div>
                  </>
                )}
              </div>
              {/* Progress Display */}
              {status === 'processing' && (
                <div className="progress-container mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="h-5 w-5 progress-spinner text-primary" />
                    <span className="font-medium text-primary progress-pulse">
                      {currentOperation === 'create' ? 'Creating Package...' : 'Extracting Package...'}
                    </span>
                  </div>
                  <Progress value={progress} className="progress-bar h-3 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{currentOperation === 'create' ? 'Packaging files' : 'Extracting files'}</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                </div>
              )}
              
              <div className="mt-3 flex gap-2 justify-center">
                {currentOperation === 'create' && (
                  <Button onClick={handleCreatePackage} disabled={status === 'processing'}>
                    {status === 'processing' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Package'
                    )}
                  </Button>
                )}
                {currentOperation === 'extract' && (
                  <Button onClick={handleExtractPackage} disabled={status === 'processing'}>
                    {status === 'processing' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      'Extract Package'
                    )}
                  </Button>
                )}
                <Button variant="outline" onClick={clearSelectedFile} disabled={status === 'processing'}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Enhanced Logs Panel */}
      <div className="border-t border-border">
        <div
          className="w-full flex justify-between items-center p-4 border-0 rounded-none transition-colors bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer"
          style={{ 
            backgroundColor: 'var(--muted)',
            color: 'var(--muted-foreground)',
            border: 'none'
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = 'var(--muted)';
            target.style.color = 'var(--foreground)';
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = 'var(--muted)';
            target.style.color = 'var(--muted-foreground)';
          }}
          onClick={() => setIsLogsOpen(!isLogsOpen)}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">Operation Logs</span>
            {logs.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setLogs([]);
                }}
              >
                Clear
              </Button>
            )}
            {isLogsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </div>
        </div>
        
        {isLogsOpen && (
          <div className="border-t border-border bg-black/90 text-green-400 font-mono text-sm p-4 max-h-[400px] overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="mb-1.5 leading-relaxed">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-center py-8">
                No logs available. Operations will appear here.
              </div>
            )}
          </div>
        )}
      </div>

      {/* About Modal */}
      <AboutModal 
        isOpen={isAboutOpen} 
        onClose={() => setIsAboutOpen(false)} 
      />
    </div>
  );
}

export default App;
