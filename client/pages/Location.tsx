  import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Share,
  Copy,
  Smartphone,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Navigation,
  Shield,
  Timer,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  avatar: string;
  isSharing: boolean;
  lastUpdate?: string;
}

interface LocationSession {
  id: string;
  name: string;
  startTime: string;
  duration: number;
  contactsCount: number;
  isActive: boolean;
}

export default function Location() {
  const navigate = useNavigate();
  const [locationPermission, setLocationPermission] = useState<
    "prompt" | "granted" | "denied" | "checking"
  >("prompt");
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null,
  );
  const [isSharing, setIsSharing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState<"high" | "balanced" | "battery">(
    "balanced",
  );
  const [shareUrl, setShareUrl] = useState("");
  const [sessionDuration, setSessionDuration] = useState(0);
  const watchId = useRef<number | null>(null);

  const emergencyContacts: EmergencyContact[] = [
    {
      id: "1",
      name: "Mom",
      phone: "+1 (555) 0123",
      relationship: "Mother",
      avatar: "/placeholder.svg",
      isSharing: true,
      lastUpdate: "2 minutes ago",
    },
    {
      id: "2",
      name: "Dad",
      phone: "+1 (555) 0124",
      relationship: "Father",
      avatar: "/placeholder.svg",
      isSharing: true,
      lastUpdate: "2 minutes ago",
    },
    {
      id: "3",
      name: "Sarah",
      phone: "+1 (555) 0125",
      relationship: "Best Friend",
      avatar: "/placeholder.svg",
      isSharing: false,
    },
  ];

  const locationSessions: LocationSession[] = [
    {
      id: "1",
      name: "Walking Home",
      startTime: "2024-01-15 20:30",
      duration: 15,
      contactsCount: 2,
      isActive: true,
    },
    {
      id: "2",
      name: "Late Night Out",
      startTime: "2024-01-14 23:15",
      duration: 45,
      contactsCount: 3,
      isActive: false,
    },
  ];

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    if (isSharing && sessionDuration === 0) {
      const interval = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isSharing, sessionDuration]);

  const checkLocationPermission = async () => {
    setLocationPermission("checking");

    if (!navigator.geolocation) {
      setLocationPermission("denied");
      return;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      setLocationPermission(permission.state as any);

      permission.addEventListener("change", () => {
        setLocationPermission(permission.state as any);
      });
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      setLocationPermission("prompt");
    }
  };

  const requestLocationPermission = () => {
    setLocationPermission("checking");

    const options: PositionOptions = {
      enableHighAccuracy: accuracy === "high",
      timeout: 10000,
      maximumAge: accuracy === "battery" ? 60000 : 30000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission("granted");
        updateLocation(position);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationPermission("denied");
      },
      options,
    );
  };

  const updateLocation = async (position: GeolocationPosition) => {
    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now(),
    };

    // Simulate reverse geocoding for address
    try {
      locationData.address = "123 Main St, Downtown";
    } catch (error) {
      console.error("Geocoding error:", error);
    }

    setCurrentLocation(locationData);
  };

  const startLocationSharing = () => {
    if (locationPermission !== "granted") {
      requestLocationPermission();
      return;
    }

    setIsSharing(true);
    setIsTracking(true);
    setSessionDuration(0);

    const options: PositionOptions = {
      enableHighAccuracy: accuracy === "high",
      timeout: 30000,
      maximumAge: accuracy === "battery" ? 60000 : 10000,
    };

    // Start watching position
    watchId.current = navigator.geolocation.watchPosition(
      updateLocation,
      (error) => {
        console.error("Location tracking error:", error);
      },
      options,
    );

    // Generate shareable URL
    setShareUrl(`https://siren.app/track/${Math.random().toString(36)}`);
  };

  const stopLocationSharing = () => {
    setIsSharing(false);
    setIsTracking(false);
    setSessionDuration(0);

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  const copyShareUrl = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      // Could add toast notification here
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 10) return "text-safe";
    if (accuracy <= 50) return "text-warning";
    return "text-emergency";
  };

  const getPermissionStatus = () => {
    switch (locationPermission) {
      case "granted":
        return { color: "text-safe", text: "Granted" };
      case "denied":
        return { color: "text-emergency", text: "Denied" };
      case "checking":
        return { color: "text-warning", text: "Checking..." };
      default:
        return { color: "text-muted-foreground", text: "Not requested" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-trust/5">
      {/* Header */}
      <header className="bg-background/95 shadow-sm backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-2 sm:py-4">
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
                <MapPin className="w-6 h-6 text-trust" />
                <h1 className="text-lg sm:text-xl font-extrabold text-foreground">
                  Live Location
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Badge variant={isSharing ? "default" : "outline"}>
                {isSharing ? "Sharing Active" : "Ready"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-6 space-y-6">
        {/* Location Permission Card */}
        <Card
          className={`border-2 transition-all ${
            locationPermission === "granted"
              ? "border-safe bg-safe/5"
              : locationPermission === "denied"
                ? "border-emergency bg-emergency/5"
                : "border-warning bg-warning/5"
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5" />
              <span>Location Access</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="space-y-2">
                <p className="font-medium text-foreground">Permission Status</p>
                <p className={`text-sm ${getPermissionStatus().color}`}>
                  {getPermissionStatus().text}
                </p>
              </div>
              <div className="w-full sm:w-auto">
                {locationPermission === "denied" && (
                  <Button
                    variant="outline"
                    onClick={checkLocationPermission}
                    className="border-warning text-warning hover:bg-warning hover:text-warning-foreground w-full sm:w-auto"
                  >
                    Check Again
                  </Button>
                )}
                {locationPermission === "prompt" && (
                  <Button
                    onClick={requestLocationPermission}
                    className="bg-trust hover:bg-trust/90 w-full sm:w-auto"
                    disabled={locationPermission === "checking"}
                  >
                    {locationPermission === "checking" ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-trust-foreground border-t-transparent rounded-full animate-spin" />
                        <span>Requesting...</span>
                      </div>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 mr-2" />
                        Grant Access
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {locationPermission === "denied" && (
              <div className="bg-emergency/10 border border-emergency/20 rounded-lg p-4 space-y-3">
                <p className="text-sm text-foreground font-medium">
                  Location access is required for safety features
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Please enable location access in your browser settings or
                  device settings to use live location sharing and emergency
                  features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Location & Controls */}
        {locationPermission === "granted" && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Current Location</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Label htmlFor="tracking" className="text-sm">
                    Auto-track
                  </Label>
                  <Switch
                    id="tracking"
                    checked={isTracking}
                    onCheckedChange={setIsTracking}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentLocation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Coordinates</Label>
                      <p className="text-sm font-mono bg-muted p-3 rounded-lg break-all">
                        {currentLocation.latitude.toFixed(6)},{" "}
                        {currentLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Accuracy</Label>
                      <p
                        className={`text-sm font-medium ${getAccuracyColor(currentLocation.accuracy)}`}
                      >
                        ±{Math.round(currentLocation.accuracy)}m
                      </p>
                    </div>
                  </div>

                  {currentLocation.address && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg">
                        {currentLocation.address}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">
                      Tracking Accuracy
                    </Label>
                    <Select
                      value={accuracy}
                      onValueChange={(value: any) => setAccuracy(value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high" className="py-3">
                          <div className="space-y-1">
                            <div className="font-medium">
                              High (GPS + Network)
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Better accuracy, more battery
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="balanced" className="py-3">
                          <div className="space-y-1">
                            <div className="font-medium">
                              Balanced (Network)
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Good accuracy, normal battery
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="battery" className="py-3">
                          <div className="space-y-1">
                            <div className="font-medium">Battery Saver</div>
                            <div className="text-xs text-muted-foreground">
                              Lower accuracy, saves battery
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Navigation className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Getting your location...
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {!isSharing ? (
                  <Button
                    onClick={startLocationSharing}
                    disabled={!currentLocation}
                    className="w-full sm:w-auto bg-trust hover:bg-trust/90 h-12"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Start Sharing Location
                  </Button>
                ) : (
                  <Button
                    onClick={stopLocationSharing}
                    variant="outline"
                    className="w-full sm:w-auto border-emergency text-emergency hover:bg-emergency hover:text-emergency-foreground h-12"
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Stop Sharing
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={!currentLocation}
                  className="w-full sm:w-auto h-12"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Coordinates
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Sharing Session */}
        {isSharing && (
          <Card className="border-trust/20 bg-trust/5">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-trust" />
                <span>Active Sharing Session</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="space-y-2">
                  <p className="font-medium text-foreground">
                    Session Duration
                  </p>
                  <p className="text-3xl font-mono text-trust">
                    {formatDuration(sessionDuration)}
                  </p>
                </div>
                <div className="text-left sm:text-right space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {emergencyContacts.filter((c) => c.isSharing).length}{" "}
                    contacts receiving updates
                  </p>
                  <div className="flex items-center space-x-2">
                    {isTracking ? (
                      <Wifi className="w-4 h-4 text-safe" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {isTracking ? "Live tracking" : "Manual updates"}
                    </span>
                  </div>
                </div>
              </div>

              {shareUrl && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Share Link</Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-3 text-sm bg-background border rounded-md font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={copyShareUrl}
                      className="sm:w-auto h-12"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Emergency Contacts */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Emergency Contacts</span>
              </div>
              <Button variant="outline" className="sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="bg-trust/10">
                      {contact.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-foreground">
                      {contact.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {contact.relationship}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {contact.phone}
                    </p>
                    {contact.isSharing && contact.lastUpdate && (
                      <p className="text-xs text-safe">
                        Updated {contact.lastUpdate}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="flex items-center space-x-2">
                    <Switch checked={contact.isSharing} disabled={!isSharing} />
                    <Badge
                      variant={contact.isSharing ? "default" : "outline"}
                      className={
                        contact.isSharing ? "bg-safe text-safe-foreground" : ""
                      }
                    >
                      {contact.isSharing ? "Sharing" : "Paused"}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-20 border-trust text-trust hover:bg-trust hover:text-trust-foreground"
          >
            <div className="text-center space-y-2">
              <Timer className="w-6 h-6 mx-auto" />
              <div className="text-sm font-medium">Set Auto-Stop Timer</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-20 border-safe text-safe hover:bg-safe hover:text-safe-foreground"
          >
            <div className="text-center space-y-2">
              <Shield className="w-6 h-6 mx-auto" />
              <div className="text-sm font-medium">Safe Zone Alert</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-20 border-warning text-warning hover:bg-warning hover:text-warning-foreground sm:col-span-2 lg:col-span-1"
          >
            <div className="text-center space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto" />
              <div className="text-sm font-medium">Emergency Signal</div>
            </div>
          </Button>
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {locationSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-foreground">
                    {session.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {session.startTime} • {session.duration} minutes •{" "}
                    {session.contactsCount} contacts
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={session.isActive ? "default" : "outline"}
                    className={
                      session.isActive ? "bg-safe text-safe-foreground" : ""
                    }
                  >
                    {session.isActive ? "Active" : "Completed"}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
