import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/10 -z-10" />
      <div className="fixed top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse -z-10" />
      <div className="fixed bottom-20 -left-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse -z-10" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 py-8 text-center relative z-10">
        <div className="max-w-md mx-auto animate-fade-in">
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
