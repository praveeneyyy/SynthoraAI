import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageGenerator } from './ImageGenerator';
import { TextGenerator } from './TextGenerator';
import { Sparkles, Image, FileText } from 'lucide-react';

export const AIStudio = () => {
  const [activeTab, setActiveTab] = useState('image');

  // Save active tab to localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('ai-studio-active-tab');
    if (savedTab && (savedTab === 'image' || savedTab === 'text')) {
      setActiveTab(savedTab);
    }
  }, []);

  // Update localStorage when tab changes
  useEffect(() => {
    localStorage.setItem('ai-studio-active-tab', activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/10 -z-10" />
      <div className="fixed top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse -z-10" />
      <div className="fixed bottom-20 -left-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse -z-10" style={{ animationDelay: '1s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] -z-10" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full border border-primary/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Powered by Advanced AI
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 relative">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
              AI Creative Studio
            </span>
          </h1>
          <p className="sr-only">
            AI-powered creative studio for generating images and text content
          </p>
          
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into reality with cutting-edge AI. Generate stunning images and compelling text instantly.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-card/50 backdrop-blur-xl border border-border h-14" aria-label="Content generation tabs">
            <TabsTrigger 
              value="image" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground transition-all duration-300 h-full"
              aria-label="Image generation tab"
            >
              <Image className="w-4 h-4 mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Image Generation</span>
              <span className="sm:hidden">Images</span>
            </TabsTrigger>
            <TabsTrigger 
              value="text"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300 h-full"
              aria-label="Text generation tab"
            >
              <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Text Generation</span>
              <span className="sm:hidden">Text</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="animate-fade-in">
            <ImageGenerator />
          </TabsContent>

          <TabsContent value="text" className="animate-fade-in">
            <TextGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
