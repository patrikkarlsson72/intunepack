import { useState, useEffect } from "react";
import { Upload, Package, ChevronUp, ChevronDown, Sun, Moon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentOperation, setCurrentOperation] = useState<'create' | 'extract' | null>(null);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedSetupFile, setSelectedSetupFile] = useState<string | null>(null);
  const [outputFolder, setOutputFolder] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState<string>("");

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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 Drag enter event triggered');
    console.log('DataTransfer types:', Array.from(e.dataTransfer.types));
    console.log('DataTransfer items:', e.dataTransfer.items.length);
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 Drag over event triggered');
    console.log('DataTransfer types:', Array.from(e.dataTransfer.types));
    console.log('DataTransfer items length:', e.dataTransfer.items.length);
    console.log('DataTransfer effectAllowed:', e.dataTransfer.effectAllowed);
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 Drag leave event triggered');
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    console.log('🎯 Drop event triggered!');
    console.log('DataTransfer files:', e.dataTransfer.files);
    console.log('DataTransfer items:', e.dataTransfer.items);
    console.log('DataTransfer types:', Array.from(e.dataTransfer.types));
    console.log('DataTransfer effectAllowed:', e.dataTransfer.effectAllowed);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Files array length:', files.length);
    console.log('Files array:', files);
    
    if (files.length > 0) {
      console.log('✅ Files dropped successfully:', files);
      setDroppedFiles(files);
      
      // Store the first file path (for drag and drop, we'll use the file name as path)
      // Note: In a real scenario, you might want to use a different approach for drag and drop
      const firstFile = files[0];
      setSelectedFilePath(firstFile.name);
      
      // Determine operation type based on file extension
      const hasIntuneWin = files.some(file => file.name.toLowerCase().endsWith('.intunewin'));
      console.log('Has IntuneWin file:', hasIntuneWin);
      
      if (hasIntuneWin) {
        setCurrentOperation('extract');
        console.log('✅ Set operation to extract');
      } else {
        setCurrentOperation('create');
        console.log('✅ Set operation to create');
      }
    } else {
      console.log('❌ No files found in drop event');
    }
  };


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
      
      // Step 3: Select output folder
      let outputDir = outputFolder;
      
      if (!outputDir) {
        outputDir = await openDialog({
          title: 'Select output directory for .intunewin file',
          directory: true,
          multiple: false,
        });
        
        if (!outputDir) {
          setStatus('idle');
          return;
        }
        
        setOutputFolder(outputDir);
      }
      
      // Step 4: Get output filename
      let filename = outputFilename;
      
      if (!filename) {
        // Generate default filename based on setup file
        const baseName = setupFile.replace(/\.[^/.]+$/, ""); // Remove extension
        filename = `${baseName}.intunewin`;
        setOutputFilename(filename);
      }
      
      // Now call the create_intunewin command with correct parameters
      const result = await invoke('create_intunewin', {
        setupFolder,
        setupFile,
        outputFolder: outputDir
      });
      
      console.log('Package created:', result);
    } catch (error) {
      console.error('Error creating package:', error);
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
      
      console.log('🔍 Extract Package - selectedFilePath:', selectedFilePath);
      
      if (!selectedFile) {
        console.log('📁 No file selected, opening file dialog...');
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
        console.log('💾 Stored new file path:', selectedFile);
      } else {
        console.log('✅ Using stored file path:', selectedFile);
      }
      
      // Open folder dialog to select output directory
      const outputDir = await openDialog({
        title: 'Select output directory',
        directory: true,
        multiple: false,
      });
      
      if (!outputDir) {
        setStatus('idle');
        return;
      }
      
      // Store the selected output directory for display in workflow box
      setOutputFolder(outputDir);
      
      const result = await invoke('extract_intunewin', {
        filePath: selectedFile,
        outputDir
      });
      
      console.log('Package extracted:', result);
    } catch (error) {
      console.error('Error extracting package:', error);
      setStatus('failed');
      setLogs(prev => [...prev, `Error: ${error}`]);
    }
  };

  const handleBrowseFiles = async () => {
    try {
      console.log('📂 Browse Files clicked');
      const selectedFile = await openDialog({
        title: 'Select file to process',
        directory: false,
        multiple: false,
      });
      
      console.log('📁 Selected file:', selectedFile);
      
      if (selectedFile) {
        // Store the full file path
        setSelectedFilePath(selectedFile);
        console.log('💾 Stored file path in state:', selectedFile);
        
        // Determine operation type based on file extension
        if (selectedFile.toLowerCase().endsWith('.intunewin')) {
          setCurrentOperation('extract');
          setDroppedFiles([{ name: selectedFile.split('/').pop() || selectedFile } as File]);
          console.log('✅ Set operation to extract for .intunewin file');
        } else {
          setCurrentOperation('create');
          setDroppedFiles([{ name: selectedFile.split('/').pop() || selectedFile } as File]);
          console.log('✅ Set operation to create for non-.intunewin file');
        }
      }
    } catch (error) {
      console.error('Error opening file dialog:', error);
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
      console.error('Error opening folder dialog:', error);
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
        {/* Drag and Drop Zone */}
        <div
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200
            ${isDragOver 
              ? 'border-primary bg-primary/10 shadow-lg scale-[1.02]' 
              : 'border-border hover:border-primary/60 hover:bg-muted/30'
            }
          `}
          style={{ minHeight: '200px' }}
        >
          <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Select files to process</h2>
          <p className="text-muted-foreground mb-4">
            Use the buttons below to select files or folders for processing
          </p>
          <p className="text-xs text-muted-foreground/70 mb-4">
            💡 Tip: Use Ctrl+O to quickly open the file browser
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={handleBrowseFiles}>Browse Files</Button>
            <Button variant="outline" onClick={handleBrowseFolders}>Browse Folders</Button>
          </div>
          
          {/* Show selected files and workflow status */}
          {(droppedFiles.length > 0 || selectedFilePath || selectedSetupFile || outputFolder) && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">
                {currentOperation === 'extract' ? 'Package Extraction Workflow:' : 'Package Creation Workflow:'}
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {currentOperation === 'extract' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${selectedFilePath ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span>Source File: {selectedFilePath ? selectedFilePath.split('/').pop() || selectedFilePath.split('\\').pop() : 'Not selected'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${outputFolder ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span>Extract To: {outputFolder ? outputFolder.split('/').pop() || outputFolder.split('\\').pop() : 'Not selected'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${selectedFilePath ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span>Setup File: {selectedFilePath ? selectedFilePath.split('/').pop() || selectedFilePath.split('\\').pop() : 'Not selected'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${outputFolder ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span>Output Folder: {outputFolder ? outputFolder.split('/').pop() || outputFolder.split('\\').pop() : 'Not selected'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${outputFilename ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span>Output File: {outputFilename || 'Auto-generated'}</span>
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
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Package Card */}
          <Card 
            className={`hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary/40 ${
              currentOperation === 'create' ? 'ring-2 ring-primary/50' : ''
            }`}
            onClick={() => setCurrentOperation('create')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Create Package</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Package installers, folders, or files into a .intunewin file for Intune deployment.
              </p>
              {status === 'processing' && currentOperation === 'create' && (
                <div className="progress-container space-y-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 progress-spinner text-primary" />
                    <span className="text-sm font-medium text-primary progress-pulse">Creating package...</span>
                  </div>
                  <Progress value={progress} className="progress-bar h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Packaging files</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extract Package Card */}
          <Card 
            className={`hover:shadow-lg transition-shadow cursor-pointer border-green-500/20 hover:border-green-500/40 ${
              currentOperation === 'extract' ? 'ring-2 ring-green-500/50' : ''
            }`}
            onClick={() => setCurrentOperation('extract')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Upload className="h-6 w-6 text-green-500" />
                <CardTitle className="text-lg">Extract Package</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Extract contents from an existing .intunewin file to view its structure.
              </p>
              {status === 'processing' && currentOperation === 'extract' && (
                <div className="progress-container space-y-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 progress-spinner text-green-500" />
                    <span className="text-sm font-medium text-green-500 progress-pulse">Extracting package...</span>
                  </div>
                  <Progress value={progress} className="progress-bar h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Extracting files</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Logs Panel */}
      <div className="border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-between p-4"
          onClick={() => setIsLogsOpen(!isLogsOpen)}
        >
          <span className="font-medium">Operation Logs</span>
          {isLogsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
        
        {isLogsOpen && (
          <div className="border-t border-border bg-black/90 text-green-400 font-mono text-sm p-4 max-h-64 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">
                No logs available. Operations will appear here.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
