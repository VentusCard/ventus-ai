import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import ventusLogo from '@/assets/ventus-logo.png';

export default function VentusForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://ventusserver.onrender.com/web/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      setSent(true);
    } catch (err) {
      // Always show success for security (don't reveal if email exists)
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAnother = () => {
    setSent(false);
    setEmail('');
    setError('');
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/app" className="inline-flex items-center gap-2 mb-4">
              <img src={ventusLogo} alt="Ventus" className="h-10" />
            </Link>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-xl">Check Your Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  We've sent a password reset link to
                </p>
                <p className="font-medium text-foreground">{email}</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Check your inbox and spam folder for the reset link. It may take a few minutes to arrive.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full text-white hover:text-black"
                  onClick={handleSendAnother}
                >
                  Send Another Email
                </Button>
                <Link to="/app/login" className="block">
                  <Button 
                    className="w-full bg-[#0064E0] hover:bg-[#0064E0]/90 text-white"
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/app" className="inline-flex items-center gap-2 mb-4">
            <img src={ventusLogo} alt="Ventus" className="h-10" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Forgot Your Password?</h1>
          <p className="text-muted-foreground mt-2">Enter your email and we'll send you a reset link</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <Link 
              to="/app/login" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="john@example.com"
                    className={`text-white ${error ? 'border-red-500' : ''}`}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#0064E0] hover:bg-[#0064E0]/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Remember your password?{' '}
              <Link to="/app/login" className="text-[#0064E0] hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
