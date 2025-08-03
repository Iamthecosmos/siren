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

  const handleSosActivation = () => {
    setSosActivated(true);
  };

  const handleCancel = () => {
    setSosActivated(false);
    setCountdown(5);
    setLocationShared(false);
    setContactsNotified(false);
  };

  const emergencyContacts = [
    {
      name: "Mom",
      phone: "+1 (555) 0123",
      status: contactsNotified ? "notified" : "pending",
    },
    {
      name: "Dad",
      phone: "+1 (555) 0124",
      status: contactsNotified ? "notified" : "pending",
    },
    {
      name: "Sarah (Best Friend)",
      phone: "+1 (555) 0125",
      status: contactsNotified ? "notified" : "pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-emergency/5 overflow-x-hidden">
      {/* Header */}
      <header className="bg-background/95 shadow-sm backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-3" />
                Back
              </Button>
              <div className="flex items-center space-x-3 min-w-0">
                <Shield className="w-6 h-6 text-emergency flex-shrink-0" />
                <h1 className="text-lg sm:text-xl font-extrabold text-foreground truncate">
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

      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-12 space-y-8 sm:space-y-12">
        {/* SOS Activation */}
        <Card
          className={`border-2 transition-all ${sosActivated ? "border-emergency bg-emergency/5" : "border-emergency/20"}`}
        >
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl text-foreground mb-4">
              {sosActivated ? "🚨 SOS Activated!" : "🔴 Emergency SOS"}
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              {sosActivated
                ? "Your emergency alert is being sent to your trusted contacts"
                : "Press and hold the button below to send an emergency alert"}
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-8 px-8 pb-8">
            {sosActivated ? (
              <div className="space-y-6">
                <div className="w-24 h-24 bg-emergency rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Shield className="w-12 h-12 text-emergency-foreground" />
                </div>

                {countdown > 0 ? (
                  <div className="space-y-2">
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

        {/* Status Updates */}
        {sosActivated && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className={`border ${locationShared ? "border-safe bg-safe/5" : "border-warning bg-warning/5"}`}
            >
              <CardContent className="p-4 text-center">
                <MapPin
                  className={`w-8 h-8 mx-auto mb-2 ${locationShared ? "text-safe" : "text-warning"}`}
                />
                <h3 className="font-semibold text-foreground">Location</h3>
                <p className="text-sm text-muted-foreground">
                  {locationShared
                    ? "Shared successfully"
                    : "Sharing location..."}
                </p>
                {locationShared && (
                  <CheckCircle className="w-4 h-4 text-safe mx-auto mt-2" />
                )}
              </CardContent>
            </Card>

            <Card
              className={`border ${contactsNotified ? "border-safe bg-safe/5" : "border-warning bg-warning/5"}`}
            >
              <CardContent className="p-4 text-center">
                <MessageSquare
                  className={`w-8 h-8 mx-auto mb-2 ${contactsNotified ? "text-safe" : "text-warning"}`}
                />
                <h3 className="font-semibold text-foreground">Messages</h3>
                <p className="text-sm text-muted-foreground">
                  {contactsNotified
                    ? "Contacts notified"
                    : "Sending messages..."}
                </p>
                {contactsNotified && (
                  <CheckCircle className="w-4 h-4 text-safe mx-auto mt-2" />
                )}
              </CardContent>
            </Card>

            <Card className="border-trust bg-trust/5">
              <CardContent className="p-4 text-center">
                <Phone className="w-8 h-8 mx-auto mb-2 text-trust" />
                <h3 className="font-semibold text-foreground">
                  Emergency Services
                </h3>
                <p className="text-sm text-muted-foreground">Ready to call</p>
                <Button size="sm" className="mt-2 bg-trust hover:bg-trust/90">
                  Call 911
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Emergency Contacts */}
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-trust/10 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-trust" />
              </div>
              <span>👥 Emergency Contacts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-6">
            {emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 border rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-trust/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-trust" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-base">
                      {contact.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {contact.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {contact.status === "notified" ? (
                    <Badge className="bg-safe text-safe-foreground px-3 py-1">
                      <CheckCircle className="w-3 h-3 mr-2" />
                      Notified
                    </Badge>
                  ) : contact.status === "pending" && sosActivated ? (
                    <Badge
                      variant="outline"
                      className="border-warning text-warning px-3 py-1"
                    >
                      <Clock className="w-3 h-3 mr-2" />
                      Sending...
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="px-3 py-1">
                      Ready
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" className="px-3 py-2">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button
            variant="outline"
            className="w-full h-20 border-trust text-trust hover:bg-trust hover:text-trust-foreground transition-all hover:-translate-y-1"
          >
            <div className="text-center space-y-2">
              <Phone className="w-6 h-6 mx-auto" />
              <div className="text-sm font-medium">📞 Call Police</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-20 border-safe text-safe hover:bg-safe hover:text-safe-foreground transition-all hover:-translate-y-1"
          >
            <div className="text-center space-y-2">
              <MessageSquare className="w-6 h-6 mx-auto" />
              <div className="text-sm font-medium">💬 Text Update</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-20 border-warning text-warning hover:bg-warning hover:text-warning-foreground transition-all hover:-translate-y-1"
          >
            <div className="text-center space-y-2">
              <MapPin className="w-6 h-6 mx-auto" />
              <div className="text-sm font-medium">📍 Share Location</div>
            </div>
          </Button>
        </div>
      </main>
    </div>
  );
}
