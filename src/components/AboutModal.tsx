import { useState, useEffect } from "react";
import { X, Info, ExternalLink, Github, Package, Calendar, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { invoke } from "@tauri-apps/api/core";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VersionInfo {
  app_version: string;
  tauri_version: string;
  rust_version: string;
  platform: string;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    app_version: "1.0.0",
    tauri_version: "2.8.5",
    rust_version: "Unknown",
    platform: "windows"
  });

  useEffect(() => {
    // Get version information from Tauri backend
    const getVersionInfo = async () => {
      try {
        const info = await invoke<VersionInfo>('get_version_info');
        setVersionInfo(info);
      } catch (error) {
        console.error('Error getting version info:', error);
      }
    };

    if (isOpen) {
      getVersionInfo();
    }
  }, [isOpen]);

  const handleOpenGitHub = async () => {
    try {
      await invoke('open_url', { url: 'https://github.com/patrikkarlsson72/intunepack' });
    } catch (error) {
      console.error('Error opening GitHub repository:', error);
    }
  };

  const handleOpenDocumentation = async () => {
    try {
      await invoke('open_url', { url: 'https://github.com/patrikkarlsson72/intunepack#readme' });
    } catch (error) {
      console.error('Error opening documentation:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">About IntunePack</CardTitle>
              <p className="text-sm text-muted-foreground">Version {versionInfo.app_version}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* App Description */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Application
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              IntunePack is a desktop application designed for IT administrators to create and extract 
              .intunewin files for Microsoft Intune deployment. Built with modern technologies, it 
              provides a user-friendly interface for packaging applications and managing Intune content.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Desktop App</Badge>
              <Badge variant="secondary">Intune Integration</Badge>
              <Badge variant="secondary">Windows Optimized</Badge>
            </div>
          </div>

          {/* Version Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Version Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Application</span>
                  <Badge variant="outline">{versionInfo.app_version}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Tauri</span>
                  <Badge variant="outline">{versionInfo.tauri_version}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Rust</span>
                  <Badge variant="outline">{versionInfo.rust_version}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Platform</span>
                  <Badge variant="outline">{versionInfo.platform.charAt(0).toUpperCase() + versionInfo.platform.slice(1)}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Technology Stack
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="font-semibold text-primary">Tauri</div>
                <div className="text-xs text-muted-foreground">Backend</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="font-semibold text-primary">React</div>
                <div className="text-xs text-muted-foreground">Frontend</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="font-semibold text-primary">Rust</div>
                <div className="text-xs text-muted-foreground">Core</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="font-semibold text-primary">TypeScript</div>
                <div className="text-xs text-muted-foreground">Language</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Create .intunewin packages</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Extract .intunewin files</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Real-time progress tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Windows-native file dialogs</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Dark/Light theme support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Keyboard shortcuts</span>
              </div>
            </div>
          </div>

          {/* Links and Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Resources</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                onClick={handleOpenGitHub}
              >
                <Github className="h-4 w-4" />
                GitHub Repository
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                onClick={handleOpenDocumentation}
              >
                <ExternalLink className="h-4 w-4" />
                Documentation
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>© 2025 IntunePack. Built with ❤️ for IT administrators.</span>
              <span>MIT License</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
