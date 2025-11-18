import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, Copy, Wand2, FileText, Download, RotateCcw, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface GeneratedText {
  id: string;
  content: string;
  prompt: string;
  type: string;
  timestamp: number;
}

export const TextGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('creative');
  const [isGenerating, setIsGenerating] = useState(false);
  const [texts, setTexts] = useState<GeneratedText[]>([]);
  const { toast } = useToast();

  // Load texts from localStorage on mount
  useEffect(() => {
    const savedTexts = localStorage.getItem('ai-studio-texts');
    if (savedTexts) {
      try {
        const parsed = JSON.parse(savedTexts);
        setTexts(parsed);
      } catch (error) {
        console.error('Failed to load saved texts:', error);
      }
    }
  }, []);

  // Save texts to localStorage whenever texts change
  useEffect(() => {
    if (texts.length > 0) {
      localStorage.setItem('ai-studio-texts', JSON.stringify(texts));
    }
  }, [texts]);

  const generateText = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt required',
        description: 'Please enter a description for your text',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-text', {
        body: { prompt, type },
      });

      if (error) throw error;

      if (data?.text) {
        const newText: GeneratedText = {
          id: Date.now().toString(),
          content: data.text,
          prompt,
          type,
          timestamp: Date.now(),
        };
        setTexts(prev => [newText, ...prev]);
        toast({
          title: 'Text generated!',
          description: 'Your AI-generated text is ready',
        });
        setPrompt('');
      }
    } catch (error: any) {
      console.error('Error generating text:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate text. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard',
    });
  };

  const exportText = (text: GeneratedText) => {
    const blob = new Blob([text.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedPrompt = text.prompt.slice(0, 50).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    link.download = `ai-generated-${sanitizedPrompt}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: 'Exported!',
      description: 'Text saved to your device',
    });
  };

  const regenerateText = async (text: GeneratedText) => {
    setPrompt(text.prompt);
    setType(text.type);
    await generateText();
  };

  const deleteText = (id: string) => {
    setTexts(prev => prev.filter(t => t.id !== id));
    toast({
      title: 'Deleted',
      description: 'Text has been removed',
    });
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const suggestedPrompts: Record<string, string[]> = {
    creative: [
      'Write a short story about a time traveler',
      'Create a poem about the beauty of nature',
      'Describe a futuristic city in vivid detail',
    ],
    professional: [
      'Write a professional email about project updates',
      'Create a business proposal summary',
      'Draft a professional cover letter',
    ],
    casual: [
      'Write a friendly message to a colleague',
      'Create a casual blog post about productivity',
      'Draft a fun social media caption',
    ],
    technical: [
      'Explain how blockchain technology works',
      'Write technical documentation for an API',
      'Describe machine learning concepts',
    ],
    marketing: [
      'Create a product launch announcement',
      'Write compelling ad copy for a service',
      'Draft an engaging email campaign',
    ],
  };

  return (
    <div>
      {/* Input Section */}
      <div className="mb-8">
        <Card className="bg-card/50 backdrop-blur-xl border-border shadow-2xl overflow-hidden relative">
          {/* Subtle shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          
          <div className="p-6 relative">
            <div className="mb-4">
              <Label htmlFor="type" className="text-sm font-medium mb-2 block">
                Writing Style
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creative">🎨 Creative & Imaginative</SelectItem>
                  <SelectItem value="professional">💼 Professional & Formal</SelectItem>
                  <SelectItem value="casual">😊 Casual & Friendly</SelectItem>
                  <SelectItem value="technical">⚙️ Technical & Detailed</SelectItem>
                  <SelectItem value="marketing">📢 Marketing & Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What would you like to write? (e.g., 'Write a compelling product description for eco-friendly water bottles')"
                className="min-h-32 bg-background/50 border-border focus:border-primary resize-none text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    generateText();
                  }
                }}
                aria-label="Text generation prompt"
                aria-describedby="text-prompt-hint"
              />
              {prompt.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-right" aria-live="polite">
                  {prompt.length} characters
                </p>
              )}
              <p id="text-prompt-hint" className="sr-only">
                Enter a description of the text you want to generate. Press Ctrl+Enter to generate.
              </p>
            </div>
            
            {/* Suggested Prompts */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Wand2 className="w-3 h-3" />
                Try these prompts:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts[type]?.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted/50 hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20 transition-all duration-300 border border-border hover:border-primary/50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateText}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all duration-300"
              aria-label={isGenerating ? "Generating text" : "Generate text from prompt"}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Text (Ctrl+Enter)
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Results */}
      {texts.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Creations</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Clear all generated texts?')) {
                  setTexts([]);
                  localStorage.removeItem('ai-studio-texts');
                  toast({
                    title: 'Cleared',
                    description: 'All texts have been cleared',
                  });
                }
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
          {texts.map((text) => (
            <Card 
              key={text.id}
              className="bg-card/30 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group relative"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="p-6 relative">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {text.type} style
                      </p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">
                        {getWordCount(text.content)} words • {getCharacterCount(text.content)} chars
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Prompt:</span> {text.prompt}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => regenerateText(text)}
                      disabled={isGenerating}
                      className="hover:bg-primary/20 transition-colors"
                      aria-label="Regenerate text"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(text.content)}
                      className="hover:bg-primary/20 transition-colors"
                      aria-label="Copy text"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => exportText(text)}
                      className="hover:bg-primary/20 transition-colors"
                      aria-label="Export text"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteText(text.id)}
                      className="hover:bg-destructive/20 transition-colors"
                      aria-label="Delete text"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {text.content}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {texts.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm border border-primary/20">
            <FileText className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No content yet</h3>
          <p className="text-muted-foreground text-lg mb-4 max-w-md mx-auto">
            Start creating amazing content with AI. Enter a description above and press Ctrl+Enter to generate your first text.
          </p>
          <p className="text-sm text-muted-foreground">
            Tip: Select a writing style and try the suggested prompts to get started quickly!
          </p>
        </div>
      )}
    </div>
  );
};
