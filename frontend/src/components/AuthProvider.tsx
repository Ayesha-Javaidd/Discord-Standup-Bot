import { createContext, useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key } from 'lucide-react';

interface AuthContextType {
  isAuthenticated: boolean;
  apiKey: string | null;
  setApiKey: (key: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('apiKey');
    if (storedKey) {
      setApiKeyState(storedKey);
      setIsAuthenticated(true);
    }
  }, []);

  const setApiKey = (key: string) => {
    localStorage.setItem('apiKey', key);
    setApiKeyState(key);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('apiKey');
    setApiKeyState(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <ApiKeyForm onSubmit={setApiKey} />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, apiKey, setApiKey, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const ApiKeyForm = ({ onSubmit }: { onSubmit: (key: string) => void }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Test the API key by making a request
      const response = await fetch('http://localhost:8000/checkins/', {
        headers: {
          'X-API-KEY': 'SDASDSADWQRGHY',
        },
      });

      if (response.ok) {
        onSubmit(apiKey);
      } else {
        setError('Invalid API key or server error');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-medium">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Discord Check-in Admin
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your API key to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                API Key
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Access Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};