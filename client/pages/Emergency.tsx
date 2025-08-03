import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Phone,
  MapPin,
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Download,
  Upload,
  Timer,
  Navigation,
  Settings,
  PhoneCall,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
  synced?: boolean;
}

export default function Emergency() {
  const navigate = useNavigate();
  const [sosActivated, setSosActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [locationShared, setLocationShared] = useState(false);
  const [contactsNotified, setContactsNotified] = useState(false);
  
  // Contact Sync Features
  const [contactsPermission, setContactsPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const [syncedContacts, setSyncedContacts] = useState<Contact[]>([]);
  const [showContactSync, setShowContactSync] = useState(false);
  const [isSyncingContacts, setIsSyncingContacts] = useState(false);
  
  // Location Sync Features
  const [locationPermission, setLocationPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const [locationSyncEnabled, setLocationSyncEnabled] = useState(false);
  const [showLocationSync, setShowLocationSync] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  
  // Auto-Stop Timer Features
  const [autoStopEnabled, setAutoStopEnabled] = useState(false);
  const [autoStopTime, setAutoStopTime] = useState(30); // minutes
  const [showAutoStopSettings, setShowAutoStopSettings] = useState(false);
  const [locationSharingActive, setLocationSharingActive] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);

  // SOS Countdown Effect
  useEffect(() => {
    if (sosActivated && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (sosActivated && countdown === 0) {
      setLocationShared(true);
      setTimeout(() => setContactsNotified(true), 1500);
    }
  }, [sosActivated, countdown]);

  // Auto-Stop Timer Effect
  useEffect(() => {
    if (autoStopEnabled && locationSharingActive && lastLocationUpdate) {
      const checkInterval = setInterval(() => {
        const now = new Date();
        const timeDiff = (now.getTime() - lastLocationUpdate.getTime()) / (1000 * 60); // minutes
        
        if (timeDiff >= autoStopTime) {
          setLocationSharingActive(false);
          console.log("Location sharing auto-stopped due to inactivity");
        }
      }, 60000); // Check every minute

      return () => clearInterval(checkInterval);
    }
  }, [autoStopEnabled, locationSharingActive, lastLocationUpdate, autoStopTime]);

  // Contact Sync Functions
  const requestContactsPermission = async () => {
    try {
      setIsSyncingContacts(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const mockContacts: Contact[] = [
        { id: "1", name: "Mom", phone: "+1 (555) 0123", relationship: "Mother", priority: 1, synced: true },
        { id: "2", name: "Dad", phone: "+1 (555) 0124", relationship: "Father", priority: 2, synced: true },
        { id: "3", name: "Sarah", phone: "+1 (555) 0125", relationship: "Best Friend", priority: 3, synced: true },
        { id: "4", name: "John Smith", phone: "+1 (555) 0126", relationship: "Brother", priority: 4, synced: true },
        { id: "5", name: "Emergency Services", phone: "911", relationship: "Emergency", priority: 5, synced: true },
      ];
      
      setSyncedContacts(mockContacts);
      setContactsPermission("granted");
      setIsSyncingContacts(false);
      setShowContactSync(false);
    } catch (error) {
      setContactsPermission("denied");
      setIsSyncingContacts(false);
    }
  };

  const makePhoneCall = (contact: Contact) => {
    if (contactsPermission !== "granted") {
      setShowContactSync(true);
      return;
    }
    
    // In a real app, this would initiate a phone call
    window.location.href = `tel:${contact.phone}`;
    console.log(`Calling ${contact.name} at ${contact.phone}`);
  };

  // Location Sync Functions
  const requestLocationPermission = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
            };
            setCurrentLocation(location);
            setLocationPermission("granted");
            setLocationSyncEnabled(true);
            setLocationSharingActive(true);
            setLastLocationUpdate(new Date());
            setShowLocationSync(false);
          },
          (error) => {
            setLocationPermission("denied");
            console.error("Location error:", error);
          }
        );
      }
    } catch (error) {
      setLocationPermission("denied");
    }
  };

  // Auto-Stop Timer Functions
  const updateLocationSharing = () => {
    setLastLocationUpdate(new Date());
    if (!locationSharingActive) {
      setLocationSharingActive(true);
    }
  };

  const handleSosActivation = () => {
    setSosActivated(true);
  };

  const handleCancel = () => {
    setSosActivated(false);
    setCountdown(5);
    setLocationShared(false);
    setContactsNotified(false);
  };

  const defaultContacts: Contact[] = [
    {
      id: "default1",
      name: "Emergency Services",
      phone: "911",
      relationship: "Emergency",
      priority: 1,
    },
    {
      id: "default2", 
      name: "Mom",
      phone: "+1 (555) 0123",
      relationship: "Mother",
      priority: 2,
    },
    {
      id: "default3",
      name: "Dad", 
      phone: "+1 (555) 0124",
      relationship: "Father",
      priority: 3,
    },
  ];

  const displayContacts = syncedContacts.length > 0 ? syncedContacts : defaultContacts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-emergency/5 overflow-x-hidden">
      {/* Header */}
      <header className="bg-background/95 shadow-sm backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-muted px-3 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3 min-w-0">
                <Shield className="w-6 h-6 text-emergency flex-shrink-0" />
                <h1 className="text-xl font-bold text-foreground">
                  Emergency SOS
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0">
              <ThemeToggle />
              <Badge
                variant={sosActivated ? "destructive" : "outline"}
                className="px-3 py-1"
              >
                {sosActivated ? "🚨 Active" : "🔴 Ready"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Sync Features Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Contact Sync */}
          <Card className={`border ${contactsPermission === "granted" ? "border-safe bg-safe/5" : "border-warning bg-warning/5"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users className={`w-5 h-5 ${contactsPermission === "granted" ? "text-safe" : "text-warning"}`} />
                  <span className="font-semibold text-sm">Contacts</span>
                </div>
                {contactsPermission === "granted" ? (
                  <CheckCircle className="w-4 h-4 text-safe" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-warning" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {contactsPermission === "granted" 
                  ? `${syncedContacts.length} contacts synced`
                  : "Sync contacts for quick emergency calling"
                }
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => setShowContactSync(true)}
              >
                {contactsPermission === "granted" ? "Manage" : "Sync Now"}
              </Button>
            </CardContent>
          </Card>

          {/* Location Sync */}
          <Card className={`border ${locationPermission === "granted" ? "border-safe bg-safe/5" : "border-warning bg-warning/5"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MapPin className={`w-5 h-5 ${locationPermission === "granted" ? "text-safe" : "text-warning"}`} />
                  <span className="font-semibold text-sm">Location</span>
                </div>
                {locationPermission === "granted" ? (
                  <CheckCircle className="w-4 h-4 text-safe" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-warning" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {locationPermission === "granted" 
                  ? "Location tracking enabled"
                  : "Enable location for danger zone alerts"
                }
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => setShowLocationSync(true)}
              >
                {locationPermission === "granted" ? "Settings" : "Enable"}
              </Button>
            </CardContent>
          </Card>

          {/* Auto-Stop Timer */}
          <Card className={`border ${autoStopEnabled ? "border-safe bg-safe/5" : "border-muted bg-muted/5"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Timer className={`w-5 h-5 ${autoStopEnabled ? "text-safe" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-sm">Auto-Stop</span>
                </div>
                {autoStopEnabled ? (
                  <CheckCircle className="w-4 h-4 text-safe" />
                ) : (
                  <Settings className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {autoStopEnabled 
                  ? `Auto-stop after ${autoStopTime} min`
                  : "Auto-stop location sharing when inactive"
                }
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => setShowAutoStopSettings(true)}
              >
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* SOS Activation */}
        <Card
          className={`border-2 transition-all ${sosActivated ? "border-emergency bg-emergency/5" : "border-emergency/20"}`}
        >
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-foreground mb-4">
              {sosActivated ? "🚨 SOS Activated!" : "🔴 Emergency SOS"}
            </CardTitle>
            <p className="text-muted-foreground">
              {sosActivated
                ? "Your emergency alert is being sent to your trusted contacts"
                : "Press the button below to send an emergency alert"}
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6 px-6 pb-6">
            {sosActivated ? (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-emergency rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Shield className="w-10 h-10 text-emergency-foreground" />
                </div>

                {countdown > 0 ? (
                  <div className="space-y-3">
                    <div className="text-4xl font-bold text-emergency">
                      {countdown}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sending alert in...
                    </p>
                    <Progress
                      value={(5 - countdown) * 20}
                      className="w-full max-w-md mx-auto"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-safe mx-auto" />
                    <p className="text-lg font-semibold text-safe">
                      Alert Sent Successfully
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCancel}
                  className="border-emergency text-emergency hover:bg-emergency hover:text-emergency-foreground"
                >
                  Cancel Emergency Alert
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <Button
                  size="lg"
                  className="w-32 h-32 rounded-full bg-emergency hover:bg-emergency/90 text-emergency-foreground text-lg font-semibold"
                  onClick={handleSosActivation}
                >
                  <div className="text-center">
                    <Shield className="w-8 h-8 mx-auto mb-2" />
                    <div>SOS</div>
                  </div>
                </Button>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  This will immediately send your location and emergency message
                  to all your trusted contacts
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-trust" />
                <span>👥 Emergency Contacts</span>
              </div>
              {contactsPermission !== "granted" && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowContactSync(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sync Contacts
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-trust/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-trust" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {contact.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {contact.relationship} • {contact.phone}
                    </p>
                    {contact.synced && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Synced
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {contactsNotified ? (
                    <Badge className="bg-safe text-safe-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Notified
                    </Badge>
                  ) : sosActivated ? (
                    <Badge variant="outline" className="border-warning text-warning">
                      <Clock className="w-3 h-3 mr-1" />
                      Sending...
                    </Badge>
                  ) : (
                    <Badge variant="outline">Ready</Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => makePhoneCall(contact)}
                    className="px-3 py-2"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Sync Dialog */}
        <Dialog open={showContactSync} onOpenChange={setShowContactSync}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-trust" />
                <span>Sync Contacts</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-2">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto">
                  <Download className="w-8 h-8 text-trust" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Access Your Contacts
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We'll sync your contacts to make emergency calling faster and easier.
                    Your contact data stays secure and private.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={requestContactsPermission}
                  disabled={isSyncingContacts}
                  className="w-full bg-trust hover:bg-trust/90"
                >
                  {isSyncingContacts ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing Contacts...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Sync My Contacts
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowContactSync(false)}
                  className="w-full"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Location Sync Dialog */}
        <Dialog open={showLocationSync} onOpenChange={setShowLocationSync}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-trust" />
                <span>Location Sync</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-2">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto">
                  <Navigation className="w-8 h-8 text-trust" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Enable Location Services
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Location access helps us provide accurate danger zone alerts and 
                    updates your safe locations automatically.
                  </p>
                </div>
              </div>
              
              {currentLocation && (
                <div className="bg-safe/10 rounded-lg p-3">
                  <p className="text-sm font-medium text-safe">Current Location:</p>
                  <p className="text-xs text-muted-foreground">{currentLocation.address}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button 
                  onClick={requestLocationPermission}
                  className="w-full bg-trust hover:bg-trust/90"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Enable Location Access
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowLocationSync(false)}
                  className="w-full"
                >
                  Skip for Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Auto-Stop Timer Settings Dialog */}
        <Dialog open={showAutoStopSettings} onOpenChange={setShowAutoStopSettings}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-trust" />
                <span>Auto-Stop Timer</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-2">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-trust" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Automatic Stop Timer
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically stop location sharing when your device becomes inactive 
                    for a specified time period.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-stop">Enable Auto-Stop</Label>
                  <Switch
                    id="auto-stop"
                    checked={autoStopEnabled}
                    onCheckedChange={setAutoStopEnabled}
                  />
                </div>
                
                {autoStopEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="timer">Stop after (minutes)</Label>
                    <Select 
                      value={autoStopTime.toString()} 
                      onValueChange={(value) => setAutoStopTime(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => setShowAutoStopSettings(false)}
                className="w-full bg-trust hover:bg-trust/90"
              >
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
