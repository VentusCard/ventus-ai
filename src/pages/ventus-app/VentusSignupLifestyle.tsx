import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import { signupFlowApi } from '@/lib/ventusApi';
import { toast } from 'sonner';

interface Lifestyle {
  name: string;
  emoji: string;
  available: boolean;
}

export default function VentusSignupLifestyle() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lifestyles, setLifestyles] = useState<Lifestyle[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetchLifestyles();
  }, []);

  const fetchLifestyles = async () => {
    try {
      const data = await signupFlowApi.getLifestyles();
      // Assuming data returns lifestyles with name, emoji, available fields
      // If not, we'll create defaults
      const lifestyleData = data.lifestyles || [
        { name: 'Sports', emoji: '🏆', available: true },
        { name: 'Travel', emoji: '✈️', available: false },
        { name: 'Food & Dining', emoji: '🍽️', available: false },
        { name: 'Entertainment', emoji: '🎬', available: false },
      ];
      setLifestyles(lifestyleData);
    } catch (error) {
      // Use defaults if API fails
      setLifestyles([
        { name: 'Sports', emoji: '🏆', available: true },
        { name: 'Travel', emoji: '✈️', available: false },
        { name: 'Food & Dining', emoji: '🍽️', available: false },
        { name: 'Entertainment', emoji: '🎬', available: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selected) {
      toast.error('Please select a lifestyle');
      return;
    }

    setIsSaving(true);
    try {
      await signupFlowApi.saveLifestyle(selected);
      navigate('/app/signup/sports');
    } catch (error) {
      toast.error('Failed to save lifestyle');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-md mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 w-12 rounded-full ${
                step === 1 ? 'bg-[#0064E0]' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Select Your Lifestyle</h1>
          <p className="text-muted-foreground mt-2">
            Choose your primary interest to personalize your experience
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {lifestyles.map((lifestyle) => (
            <Card
              key={lifestyle.name}
              onClick={() => lifestyle.available && setSelected(lifestyle.name)}
              className={`p-6 cursor-pointer transition-all relative bg-background ${
                !lifestyle.available ? 'opacity-60 cursor-not-allowed' : ''
              } ${
                selected === lifestyle.name
                  ? 'border-[#0064E0] bg-[#0064E0]/10'
                  : 'border-border hover:border-[#0064E0]/50'
              }`}
            >
              {!lifestyle.available && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Coming Soon
                  </span>
                </div>
              )}
              <div className="text-center">
                <span className="text-4xl mb-3 block">{lifestyle.emoji}</span>
                <span className="font-medium text-foreground">{lifestyle.name}</span>
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected || isSaving}
          className="w-full mt-8 bg-[#0064E0] hover:bg-[#0064E0]/90 text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}
