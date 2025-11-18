import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, Download, Copy, ZoomIn, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load images from localStorage on mount
  useEffect(() => {
    const savedImages = localStorage.getItem('ai-studio-images');
    if (savedImages) {
      try {
        const parsed = JSON.parse(savedImages);
        setImages(parsed);
      } catch (error) {
        console.error('Failed to load saved images:', error);
      }
    }
  }, []);

  // Save images to localStorage whenever images change
  useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem('ai-studio-images', JSON.stringify(images));
    }
  }, [images]);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt required',
        description: 'Please enter a description for your image',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: data.imageUrl,
          prompt,
          timestamp: Date.now(),
        };
        setImages(prev => [newImage, ...prev]);
        setImageLoading(prev => new Set(prev).add(newImage.id));
        toast({
          title: 'Image generated!',
          description: 'Your AI-generated image is ready',
        });
        setPrompt('');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      const sanitizedPrompt = prompt.slice(0, 50).replace(/[^a-z0-9]/gi, '-').toLowerCase();
      link.download = `ai-generated-${sanitizedPrompt}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      
      toast({
        title: 'Downloaded!',
        description: 'Image saved to your device',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Could not download the image',
        variant: 'destructive',
      });
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: 'Copied!',
      description: 'Prompt copied to clipboard',
    });
  };

  const handleImageLoad = (imageId: string) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  const handleImageError = (imageId: string) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
    setImageErrors(prev => new Set(prev).add(imageId));
    toast({
      title: 'Image failed to load',
      description: 'The image could not be displayed',
      variant: 'destructive',
    });
  };

  const regenerateImage = async (image: GeneratedImage) => {
    setPrompt(image.prompt);
    await generateImage();
  };

  const suggestedPrompts = [
    'A futuristic cyberpunk cityscape at night',
    'Abstract cosmic nebula with vibrant colors',
    'Serene zen garden with cherry blossoms',
    'Surreal dreamlike landscape with floating islands',
  ];

  return (
    <div>
      {/* Input Section */}
      <div className="mb-8">
        <Card className="bg-card/50 backdrop-blur-xl border-border shadow-2xl overflow-hidden relative">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          
          <div className="p-6 relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vision... (e.g., 'A mystical forest with glowing mushrooms and ethereal lighting')"
              className="min-h-32 mb-4 bg-background/50 border-border focus:border-primary resize-none text-base transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  generateImage();
                }
              }}
              aria-label="Image generation prompt"
              aria-describedby="image-prompt-hint"
            />
            <p id="image-prompt-hint" className="sr-only">
              Enter a description of the image you want to generate. Press Ctrl+Enter to generate.
            </p>
            
            {/* Suggested Prompts */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Try these prompts:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted/50 hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20 transition-all duration-300 border border-border hover:border-primary/50 hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateImage}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
              aria-label={isGenerating ? "Generating image" : "Generate image from prompt"}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Image (Ctrl+Enter)
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Gallery */}
      {images.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Creations</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Clear all generated images?')) {
                  setImages([]);
                  localStorage.removeItem('ai-studio-images');
                  toast({
                    title: 'Cleared',
                    description: 'All images have been cleared',
                  });
                }
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                onMouseEnter={() => setHoveredImage(image.id)}
                onMouseLeave={() => setHoveredImage(null)}
                className="group relative bg-card/30 backdrop-blur-xl rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20"
              >
                <div className="aspect-square relative overflow-hidden cursor-pointer" onClick={() => setSelectedImage(image)}>
                  {imageLoading.has(image.id) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                      <Skeleton className="w-full h-full" />
                      <Loader2 className="absolute h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  {imageErrors.has(image.id) ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 text-destructive p-4">
                      <X className="h-8 w-8 mb-2" />
                      <p className="text-sm text-center">Failed to load image</p>
                    </div>
                  ) : (
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      style={{
                        filter: hoveredImage === image.id ? 'brightness(1.1)' : 'brightness(1)',
                        display: imageLoading.has(image.id) ? 'none' : 'block',
                      }}
                      onLoad={() => handleImageLoad(image.id)}
                      onError={() => handleImageError(image.id)}
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Action buttons on hover */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(image);
                      }}
                      aria-label="Zoom image"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPrompt(image.prompt);
                      }}
                      aria-label="Copy prompt"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Animated corner accents */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-8 group-hover:h-8" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-secondary opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-8 group-hover:h-8" />
                </div>
                
                <div className="p-4 relative">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 transition-colors group-hover:text-foreground">
                    {image.prompt}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadImage(image.url, image.prompt)}
                      className="flex-1 hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20 transition-all duration-300"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regenerateImage(image)}
                      disabled={isGenerating}
                      className="hover:bg-gradient-to-r hover:from-secondary/20 hover:to-accent/20 transition-all duration-300"
                      aria-label="Regenerate image"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-background/95 backdrop-blur-xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-left line-clamp-2">{selectedImage?.prompt}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative p-6">
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="w-full h-auto rounded-lg max-h-[70vh] object-contain mx-auto"
              />
              <div className="flex gap-2 mt-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => copyPrompt(selectedImage.prompt)}
                  className="hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Prompt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadImage(selectedImage.url, selectedImage.prompt)}
                  className="hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={() => regenerateImage(selectedImage)}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {images.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm border border-primary/20 animate-pulse">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No images yet</h3>
          <p className="text-muted-foreground text-lg mb-4 max-w-md mx-auto">
            Start creating amazing images with AI. Enter a description above and press Ctrl+Enter to generate your first image.
          </p>
          <p className="text-sm text-muted-foreground">
            Tip: Try clicking on the suggested prompts to get started quickly!
          </p>
        </div>
      )}
    </div>
  );
};
