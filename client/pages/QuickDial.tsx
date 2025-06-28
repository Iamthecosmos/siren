import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  PhoneCall,
  AlertTriangle,
  Shield,
  Heart,
  Flame,
  Car,
  Users,
  HelpCircle,
  Globe,
  CheckCircle,
  Wifi,
  WifiOff,
  Star,
  Volume2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmergencyService {
  id: string;
  name: string;
  number: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  priority: "critical" | "urgent" | "important";
  available24x7: boolean;
}

interface LocationEmergencyData {
  country: string;
  region: string;
  services: EmergencyService[];
  lastUpdated: string;
}

interface CallLog {
  id: string;
  service: string;
  number: string;
  timestamp: string;
  duration?: number;
  status: "completed" | "missed" | "failed";
}

export default function QuickDial() {
  const navigate = useNavigate();
  const [locationStatus, setLocationStatus] = useState<
    "detecting" | "found" | "failed" | "manual"
  >("detecting");
  const [currentLocation, setCurrentLocation] =
    useState<LocationEmergencyData | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedService, setSelectedService] =
    useState<EmergencyService | null>(null);
  const [isDialing, setIsDialing] = useState(false);
  const [showCallLog, setShowCallLog] = useState(false);

  // Sample emergency services database
  const emergencyDatabase: Record<string, LocationEmergencyData> = {
    US: {
      country: "United States",
      region: "North America",
      services: [
        {
          id: "911",
          name: "Emergency Services",
          number: "911",
          description: "Police, Fire, Medical Emergency",
          icon: Shield,
          color: "bg-emergency",
          priority: "critical",
          available24x7: true,
        },
        {
          id: "988",
          name: "Suicide & Crisis Lifeline",
          number: "988",
          description: "Mental health crisis support",
          icon: Heart,
          color: "bg-trust",
          priority: "critical",
          available24x7: true,
        },
        {
          id: "poison",
          name: "Poison Control",
          number: "1-800-222-1222",
          description: "Poison emergency assistance",
          icon: AlertTriangle,
          color: "bg-warning",
          priority: "urgent",
          available24x7: true,
        },
      ],
      lastUpdated: "2024-01-15",
    },
    UK: {
      country: "United Kingdom",
      region: "Europe",
      services: [
        {
          id: "999",
          name: "Emergency Services",
          number: "999",
          description: "Police, Fire, Ambulance",
          icon: Shield,
          color: "bg-emergency",
          priority: "critical",
          available24x7: true,
        },
        {
          id: "111",
          name: "NHS Non-Emergency",
          number: "111",
          description: "Medical advice and urgent care",
          icon: Heart,
          color: "bg-trust",
          priority: "urgent",
          available24x7: true,
        },
        {
          id: "samaritans",
          name: "Samaritans",
          number: "116 123",
          description: "Emotional support helpline",
          icon: Users,
          color: "bg-safe",
          priority: "important",
          available24x7: true,
        },
      ],
      lastUpdated: "2024-01-15",
    },
    CA: {
      country: "Canada",
      region: "North America",
      services: [
        {
          id: "911",
          name: "Emergency Services",
          number: "911",
          description: "Police, Fire, Medical Emergency",
          icon: Shield,
          color: "bg-emergency",
          priority: "critical",
          available24x7: true,
        },
        {
          id: "crisis",
          name: "Crisis Services Canada",
          number: "1-833-456-4566",
          description: "Mental health crisis support",
          icon: Heart,
          color: "bg-trust",
          priority: "critical",
          available24x7: true,
        },
      ],
      lastUpdated: "2024-01-15",
    },
  };

  const callHistory: CallLog[] = [
    {
      id: "1",
      service: "Emergency Services",
      number: "911",
      timestamp: "2024-01-15 14:30",
      duration: 180,
      status: "completed",
    },
    {
      id: "2",
      service: "Crisis Lifeline",
      number: "988",
      timestamp: "2024-01-14 22:15",
      duration: 450,
      status: "completed",
    },
  ];

  useEffect(() => {
    detectLocation();

    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  const detectLocation = async () => {
    setLocationStatus("detecting");

    try {
      // Try geolocation first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Simulate reverse geocoding to get country
            const countryCode = await getCountryFromCoordinates(
              position.coords.latitude,
              position.coords.longitude,
            );

            const locationData =
              emergencyDatabase[countryCode] || emergencyDatabase.US;
            setCurrentLocation(locationData);
            setLocationStatus("found");
          },
          () => {
            // Fallback to IP-based location
            detectLocationByIP();
          },
        );
      } else {
        detectLocationByIP();
      }
    } catch (error) {
      console.error("Location detection failed:", error);
      setLocationStatus("failed");
    }
  };

  const getCountryFromCoordinates = async (
    lat: number,
    lng: number,
  ): Promise<string> => {
    // Simulate geocoding service
    // In real implementation, this would call a geocoding API

    // Simple coordinate-based country detection simulation
    if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66) {
      return "US";
    } else if (lat >= 49 && lat <= 60 && lng >= -141 && lng <= -52) {
      return "CA";
    } else if (lat >= 50 && lat <= 59 && lng >= -8 && lng <= 2) {
      return "UK";
    }

    return "US"; // Default fallback
  };

  const detectLocationByIP = async () => {
    try {
      // Simulate IP-based location detection
      // In real implementation, this would call an IP geolocation API
      const countryCode = "US"; // Simulated result
      const locationData = emergencyDatabase[countryCode];
      setCurrentLocation(locationData);
      setLocationStatus("found");
    } catch (error) {
      setLocationStatus("failed");
    }
  };

  const makeEmergencyCall = (service: EmergencyService) => {
    setSelectedService(service);
    setIsDialing(true);

    // Simulate dialing process
    setTimeout(() => {
      setIsDialing(false);
      // In a real app, this would initiate the actual call
      window.location.href = `tel:${service.number}`;
    }, 2000);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-emergency";
      case "urgent":
        return "text-warning";
      default:
        return "text-trust";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-emergency/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Phone className="w-6 h-6 text-emergency" />
                <h1 className="text-xl font-bold text-foreground">
                  Quick Dial
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-safe" />
                ) : (
                  <WifiOff className="w-4 h-4 text-emergency" />
                )}
                <Badge variant={isOnline ? "default" : "destructive"}>
                  {isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Location Status */}
        <Card
          className={`border-2 transition-all ${
            locationStatus === "found"
              ? "border-safe bg-safe/5"
              : locationStatus === "failed"
                ? "border-emergency bg-emergency/5"
                : "border-warning bg-warning/5"
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location & Emergency Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {locationStatus === "detecting" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-foreground">Detecting your location...</p>
                  <div className="w-6 h-6 border-2 border-trust border-t-transparent rounded-full animate-spin" />
                </div>
                <Progress value={65} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Finding local emergency numbers for your area
                </p>
              </div>
            )}

            {locationStatus === "found" && currentLocation && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      📍 {currentLocation.country}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentLocation.services.length} emergency services
                      available
                    </p>
                  </div>
                  <Badge className="bg-safe text-safe-foreground">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Located
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {currentLocation.lastUpdated}
                </p>
              </div>
            )}

            {locationStatus === "failed" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Location detection failed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Using default emergency numbers
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={detectLocation}
                    className="border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                  >
                    Retry
                  </Button>
                </div>
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                  <p className="text-sm text-foreground">
                    Using emergency numbers for United States. These may not
                    work in your location.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Numbers */}
        {currentLocation && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentLocation.services.map((service) => (
              <Card
                key={service.id}
                className={`group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                  service.priority === "critical" ? "border-emergency/30" : ""
                }`}
                onClick={() => makeEmergencyCall(service)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center`}
                      >
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge
                          variant="outline"
                          className={`${getPriorityColor(service.priority)} border-current`}
                        >
                          {service.priority}
                        </Badge>
                        {service.available24x7 && (
                          <Badge variant="secondary" className="text-xs">
                            24/7
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-trust transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-mono font-bold text-foreground">
                        {service.number}
                      </p>
                      <Button
                        size="sm"
                        className={`${service.color} hover:opacity-90 text-white`}
                      >
                        <PhoneCall className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialing Interface */}
        {isDialing && selectedService && (
          <Card className="border-emergency/20 bg-emergency/5">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div
                  className={`w-20 h-20 ${selectedService.color} rounded-full flex items-center justify-center mx-auto animate-pulse`}
                >
                  <selectedService.icon className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Calling {selectedService.name}
                  </h2>
                  <p className="text-lg font-mono text-emergency mt-2">
                    {selectedService.number}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Connecting to emergency services...
                  </p>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialing(false)}
                    className="border-muted"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Speaker
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialing(false)}
                    className="border-emergency text-emergency hover:bg-emergency hover:text-emergency-foreground"
                  >
                    Cancel Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-16 border-trust text-trust hover:bg-trust hover:text-trust-foreground"
            onClick={() => navigate("/location")}
          >
            <div className="text-center">
              <MapPin className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">Share Location</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-16 border-safe text-safe hover:bg-safe hover:text-safe-foreground"
            onClick={() => navigate("/fake-call")}
          >
            <div className="text-center">
              <Phone className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">Fake Call</div>
            </div>
          </Button>

          <Dialog open={showCallLog} onOpenChange={setShowCallLog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-16 border-warning text-warning hover:bg-warning hover:text-warning-foreground"
              >
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm">Call History</div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Recent Emergency Calls</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {callHistory.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {call.service}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {call.number} • {call.timestamp}
                      </p>
                      {call.duration && (
                        <p className="text-xs text-muted-foreground">
                          Duration: {formatDuration(call.duration)}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        call.status === "completed" ? "default" : "outline"
                      }
                    >
                      {call.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="h-16 border-muted text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <div className="text-center">
              <HelpCircle className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">Help & Info</div>
            </div>
          </Button>
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <WifiOff className="w-8 h-8 text-warning" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    You're currently offline
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Emergency calling still works without internet. Your device
                    can still make calls to emergency services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Important Notice */}
        <Card className="bg-gradient-to-r from-emergency/5 to-warning/5 border-emergency/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-8 h-8 text-emergency mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Emergency Notice
                </h3>
                <p className="text-muted-foreground">
                  These numbers are automatically detected based on your
                  location. In a real emergency, always use your local emergency
                  number.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
