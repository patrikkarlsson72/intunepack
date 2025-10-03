import { useState } from "react";
import { Upload, Package, ChevronUp, ChevronDown, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./contexts/ThemeContext";
import "./App.css";

function App() {
  const { theme, toggleTheme } = useTheme();
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      console.log('Files dropped:', files);
      // TODO: Implement file processing logic
    }
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
          <h1 className="text-2xl font-bold text-foreground">IntunePack</h1>
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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Drop files here</h2>
          <p className="text-muted-foreground mb-4">
            Drag and drop installers, folders, or .intunewin files
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline">Browse Files</Button>
            <Button variant="outline">Browse Folders</Button>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Package Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary/40">
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
              {status === 'processing' && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">Creating package...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extract Package Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-500/20 hover:border-green-500/40">
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
              {status === 'processing' && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">Extracting package...</p>
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
