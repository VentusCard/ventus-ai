import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';
import { signupFlowApi } from '@/lib/ventusApi';
import { toast } from 'sonner';

export default function VentusSignupLocation() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    zipcode: '',
  });

  const handleStateChange = (value: string) => {
    // Only allow 2 characters, auto uppercase
    const cleaned = value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
    setFormData({ ...formData, state: cleaned });
  };

  const handleZipcodeChange = (value: string) => {
    // Only allow 5 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    setFormData({ ...formData, zipcode: cleaned });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.state.length !== 2) {
      toast.error('Please enter a valid 2-letter state code');
      return;
    }
    
    if (formData.zipcode.length !== 5) {
      toast.error('Please enter a valid 5-digit zipcode');
      return;
    }

    setIsSaving(true);
    try {
      await signupFlowApi.saveLocation(formData);
      toast.success('Welcome to Ventus!');
      navigate('/app/home');
    } catch (error) {
      toast.error('Failed to save location');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-md mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 w-12 rounded-full ${
                step <= 4 ? 'bg-[#0064E0]' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0064E0]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-[#0064E0]" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Enter Your Location</h1>
          <p className="text-muted-foreground mt-2">
            Help us find deals near you
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>This helps us show you relevant local offers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  placeholder="New York"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    required
                    placeholder="NY"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipcode">Zipcode</Label>
                  <Input
                    id="zipcode"
                    value={formData.zipcode}
                    onChange={(e) => handleZipcodeChange(e.target.value)}
                    required
                    placeholder="10001"
                    maxLength={5}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6 bg-[#0064E0] hover:bg-[#0064E0]/90 text-white"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Started...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
