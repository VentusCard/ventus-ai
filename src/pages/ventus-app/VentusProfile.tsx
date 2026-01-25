import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Loader2, Book, User, MapPin, Settings, 
  ExternalLink, Check, LogOut, ChevronRight, Trophy
} from 'lucide-react';
import { getSubcategoryIcon } from '@/lib/categoryIcons';
import { useVentusAuth } from '@/contexts/VentusAuthContext';
import { VentusSidebar } from '@/components/ventus-app/VentusSidebar';
import { AppStoreBadges } from '@/components/ventus-app/AppStoreBadges';
import { profileApi, categoriesApi, VentusCategory } from '@/lib/ventusApi';
import { toast } from 'sonner';

export default function VentusProfile() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useVentusAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [allSubcategories, setAllSubcategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [location, setLocation] = useState({
    city: '',
    state: '',
    zipcode: '',
  });

  // Fetch full profile and subcategories on mount
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchProfile(), fetchSubcategories()]);
      setIsLoading(false);
    };
    init();
  }, []);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      const profile = await profileApi.getProfile(user.id);
      console.log('Fetched profile:', profile);
      
      // Update local state with full profile data
      setLocation({
        city: profile.city || '',
        state: profile.state || '',
        zipcode: profile.zipcode || '',
      });
      setSelectedSubcategories(
        (profile.subcategories || []).filter((s: string) => s !== 'General')
      );
      
      // Also update auth context with full profile
      setUser({ ...user, ...profile });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const data = await categoriesApi.getSubcategories();
      console.log('Fetched subcategories raw:', data);
      
      // Handle different response formats - API returns { subcategories: string[] }
      let subcategories: string[] = [];
      if (Array.isArray(data)) {
        subcategories = data;
      } else if (data.subcategories && Array.isArray(data.subcategories)) {
        subcategories = data.subcategories;
      }
      
      // Filter out General
      const filtered = subcategories.filter((cat: string) => cat !== 'General');
      console.log('Filtered subcategories:', filtered);
      setAllSubcategories(filtered);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    }
  };

  const handleStateChange = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
    setLocation({ ...location, state: cleaned });
  };

  const handleZipcodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    setLocation({ ...location, zipcode: cleaned });
  };

  const toggleSubcategory = (subcategory: string) => {
    if (selectedSubcategories.includes(subcategory)) {
      setSelectedSubcategories(selectedSubcategories.filter((s) => s !== subcategory));
    } else if (selectedSubcategories.length < 3) {
      setSelectedSubcategories([...selectedSubcategories, subcategory]);
    } else {
      toast.error('You can only select up to 3 sports');
    }
  };

  const handleSaveSubcategories = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Include General in the saved subcategories
      const subcategories = ['General', ...selectedSubcategories];
      await profileApi.updateProfile(user.id, { subcategories } as any);
      setUser({ ...user, subcategories });
      setIsSubcategoryModalOpen(false);
      toast.success('Sports preferences updated!');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    
    if (location.state.length !== 2) {
      toast.error('Please enter a valid 2-letter state code');
      return;
    }
    
    if (location.zipcode.length !== 5) {
      toast.error('Please enter a valid 5-digit zipcode');
      return;
    }

    setIsSaving(true);
    try {
      await profileApi.updateProfile(user.id, location as any);
      setUser({ ...user, ...location });
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    navigate('/smartrewards');
  };

  return (
    <VentusSidebar>
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-semibold text-foreground">Profile Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
        <div className="px-6 py-6 space-y-4 max-w-2xl">
          {/* Sports Enthusiast Banner */}
          <Card className="bg-gradient-to-r from-primary to-blue-600 border-0 text-white overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">Sports Enthusiast</h3>
                <p className="text-sm text-white/80">
                  {selectedSubcategories.length > 0 
                    ? `Following ${selectedSubcategories.length} sport${selectedSubcategories.length > 1 ? 's' : ''}: ${selectedSubcategories.join(', ')}`
                    : 'Select your favorite sports to get personalized deals'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Our Story Card */}
          <Card 
            className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => window.open('https://www.ventuscard.com/about', '_blank')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Book className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground text-sm">Our Story</h3>
                <p className="text-xs text-muted-foreground">Learn about Ventus and our mission</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Accordion sections */}
          <Accordion type="single" collapsible className="space-y-2">
            {/* Personal Information */}
            <AccordionItem value="personal" className="bg-card border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Personal Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">First Name</Label>
                    <Input value={user?.first_name || ''} disabled className="bg-muted h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Last Name</Label>
                    <Input value={user?.last_name || ''} disabled className="bg-muted h-9 text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted h-9 text-sm" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Personal information cannot be changed
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Location */}
            <AccordionItem value="location" className="bg-card border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Location</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1 pb-4">
                <div className="space-y-1">
                  <Label className="text-xs">City</Label>
                  <Input 
                    value={location.city} 
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">State</Label>
                    <Input 
                      value={location.state} 
                      onChange={(e) => handleStateChange(e.target.value)}
                      maxLength={2}
                      placeholder="NY"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Zipcode</Label>
                    <Input 
                      value={location.zipcode} 
                      onChange={(e) => handleZipcodeChange(e.target.value)}
                      maxLength={5}
                      placeholder="10001"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your location helps us find deals near you
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Preferences */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <Dialog open={isSubcategoryModalOpen} onOpenChange={setIsSubcategoryModalOpen}>
                <DialogTrigger asChild>
                  <button className="w-full flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground text-left">Your Sports</p>
                      <p className="text-xs text-muted-foreground text-left">
                        General, {selectedSubcategories.join(', ')}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base">Select Sports</DialogTitle>
                    <DialogDescription className="text-xs">
                      Choose up to 3 sports ({selectedSubcategories.length}/3) • General is always included
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {/* General - locked */}
                    <div className="flex items-center justify-between py-2.5 px-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <span>🏆</span>
                        <span className="text-sm font-medium">General (Always included)</span>
                      </div>
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* Other subcategories */}
                    {allSubcategories.map((subcategory) => {
                      const isSelected = selectedSubcategories.includes(subcategory);
                      const emoji = getSubcategoryIcon(subcategory);
                      return (
                        <button
                          key={subcategory}
                          onClick={() => toggleSubcategory(subcategory)}
                          className="w-full flex items-center justify-between py-2.5 px-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span>{emoji}</span>
                            <span className="text-sm font-medium">{subcategory}</span>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <Button 
                    onClick={handleSaveSubcategories}
                    disabled={isSaving}
                    size="sm"
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Sports'
                    )}
                  </Button>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSaveChanges}
              disabled={isSaving}
              size="sm"
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleLogout}
              disabled={isLoading}
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* App download CTA */}
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Get the Ventus App
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Wishlist, notifications & location-based deals
                  </p>
                  <AppStoreBadges />
                </div>
                <div className="hidden sm:flex w-16 h-16 bg-primary/10 rounded-xl items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </VentusSidebar>
  );
}
