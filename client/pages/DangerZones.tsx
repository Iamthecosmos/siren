import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  AlertTriangle,
  MapPin,
  Search,
  Shield,
  Clock,
  Users,
  Navigation,
  Eye,
  Flag,
  TrendingUp,
  TrendingDown,
  Calendar,
  Phone,
  Share,
  Route,
  Target,
  CheckCircle,
  XCircle,
  Info,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
}

interface SafetyIncident {
  id: string;
  type:
    | "theft"
    | "assault"
    | "harassment"
    | "vandalism"
    | "suspicious"
    | "other";
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  reportedBy: string;
  verified: boolean;
  distance?: number;
}

interface SafetyRating {
  overall: number;
  dayTime: number;
  nightTime: number;
  trend: "improving" | "declining" | "stable";
  confidence: number;
}

interface AreaSafety {
  location: string;
  coordinates: { lat: number; lng: number };
  rating: SafetyRating;
  recentIncidents: SafetyIncident[];
  lastUpdated: string;
  population: number;
  policePresence: "high" | "medium" | "low";
}

interface RouteCheck {
  id: string;
  origin: string;
  destination: string;
  safetyScore: number;
  warnings: string[];
  recommendedTime: string;
  alternativeRoute?: boolean;
}

export default function DangerZones() {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null,
  );
  const [locationPermission, setLocationPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");
  const [activeTab, setActiveTab] = useState("current");
  const [searchLocation, setSearchLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIncident, setSelectedIncident] =
    useState<SafetyIncident | null>(null);
  const [routeOrigin, setRouteOrigin] = useState("");
  const [routeDestination, setRouteDestination] = useState("");

  // Sample data
  const currentAreaSafety: AreaSafety = {
    location: "Downtown Main Street",
    coordinates: { lat: 40.7128, lng: -74.006 },
    rating: {
      overall: 6.8,
      dayTime: 8.2,
      nightTime: 4.5,
      trend: "improving",
      confidence: 85,
    },
    recentIncidents: [
      {
        id: "1",
        type: "theft",
        location: "Main St & 5th Ave",
        coordinates: { lat: 40.713, lng: -74.0058 },
        timestamp: "2024-01-15 22:30",
        severity: "medium",
        description: "Phone snatching reported near subway entrance",
        reportedBy: "community_member",
        verified: true,
        distance: 0.2,
      },
      {
        id: "2",
        type: "harassment",
        location: "Central Park entrance",
        coordinates: { lat: 40.7125, lng: -74.0062 },
        timestamp: "2024-01-14 19:15",
        severity: "low",
        description: "Verbal harassment reported",
        reportedBy: "anonymous",
        verified: false,
        distance: 0.3,
      },
    ],
    lastUpdated: "2024-01-15 23:45",
    population: 25000,
    policePresence: "medium",
  };

  const nearbyIncidents: SafetyIncident[] = [
    {
      id: "3",
      type: "suspicious",
      location: "Oak Street Plaza",
      coordinates: { lat: 40.7135, lng: -74.0055 },
      timestamp: "2024-01-15 20:00",
      severity: "low",
      description: "Suspicious individual loitering near ATM",
      reportedBy: "security_camera",
      verified: true,
      distance: 0.5,
    },
    {
      id: "4",
      type: "assault",
      location: "River Road Park",
      coordinates: { lat: 40.714, lng: -74.007 },
      timestamp: "2024-01-13 23:45",
      severity: "high",
      description: "Physical assault reported, police involved",
      reportedBy: "police_report",
      verified: true,
      distance: 0.8,
    },
  ];

  const routeChecks: RouteCheck[] = [
    {
      id: "1",
      origin: "Current Location",
      destination: "City Mall",
      safetyScore: 7.2,
      warnings: ["Well-lit path", "High foot traffic"],
      recommendedTime: "Before 10 PM",
      alternativeRoute: false,
    },
    {
      id: "2",
      origin: "Current Location",
      destination: "University Campus",
      safetyScore: 4.1,
      warnings: [
        "Recent incidents reported",
        "Poor lighting",
        "Avoid after dark",
      ],
      recommendedTime: "Daylight hours only",
      alternativeRoute: true,
    },
  ];

  useEffect(() => {
    requestLocationAccess();
  }, []);

  const requestLocationAccess = () => {
    if (!navigator.geolocation) {
      setLocationPermission("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission("granted");
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: "Downtown Main Street", // Simulated reverse geocoding
          accuracy: position.coords.accuracy,
        });
      },
      () => {
        setLocationPermission("denied");
      },
    );
  };

  const searchArea = async () => {
    if (!searchLocation.trim()) return;

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      // Results would be displayed here
    }, 1500);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-emergency bg-emergency/10 border-emergency/20";
      case "high":
        return "text-emergency bg-emergency/10 border-emergency/20";
      case "medium":
        return "text-warning bg-warning/10 border-warning/20";
      case "low":
        return "text-safe bg-safe/10 border-safe/20";
      default:
        return "text-muted-foreground bg-muted/10 border-muted/20";
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case "theft":
        return Target;
      case "assault":
        return AlertTriangle;
      case "harassment":
        return Users;
      case "suspicious":
        return Eye;
      default:
        return Flag;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-safe";
    if (rating >= 6) return "text-warning";
    return "text-emergency";
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-warning/5">
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
                <AlertTriangle className="w-6 h-6 text-warning" />
                <h1 className="text-xl font-bold text-foreground">
                  Danger Zones
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Badge
                variant={
                  locationPermission === "granted" ? "default" : "destructive"
                }
              >
                {locationPermission === "granted"
                  ? "Location Active"
                  : "Location Needed"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Location Permission */}
        {locationPermission !== "granted" && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Navigation className="w-8 h-8 text-warning" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Location Access Required
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enable location access to check danger zones and safety
                    information for your current area.
                  </p>
                </div>
                <Button
                  onClick={requestLocationAccess}
                  className="bg-warning hover:bg-warning/90 text-warning-foreground"
                >
                  Enable Location
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="current">Current Area</TabsTrigger>
            <TabsTrigger value="search">Search Areas</TabsTrigger>
            <TabsTrigger value="routes">Route Safety</TabsTrigger>
            <TabsTrigger value="reports">Community Reports</TabsTrigger>
          </TabsList>

          {/* Current Area Safety */}
          <TabsContent value="current" className="space-y-6">
            {currentLocation && (
              <>
                {/* Current Location Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Current Location Safety</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center space-y-2">
                        <div className="text-3xl font-bold text-foreground">
                          <span
                            className={getRatingColor(
                              currentAreaSafety.rating.overall,
                            )}
                          >
                            {currentAreaSafety.rating.overall}/10
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Overall Safety
                        </p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="text-3xl font-bold text-safe">
                          {currentAreaSafety.rating.dayTime}/10
                        </div>
                        <p className="text-sm text-muted-foreground">Daytime</p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="text-3xl font-bold text-emergency">
                          {currentAreaSafety.rating.nightTime}/10
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Nighttime
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {currentAreaSafety.rating.trend === "improving" ? (
                          <TrendingUp className="w-4 h-4 text-safe" />
                        ) : currentAreaSafety.rating.trend === "declining" ? (
                          <TrendingDown className="w-4 h-4 text-emergency" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-warning rotate-90" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          Safety trend: {currentAreaSafety.rating.trend}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {currentAreaSafety.rating.confidence}% confident
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Police Presence</p>
                        <p className="font-medium capitalize">
                          {currentAreaSafety.policePresence}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="font-medium">
                          {formatTimeAgo(currentAreaSafety.lastUpdated)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Incidents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Recent Incidents Nearby</span>
                      </div>
                      <Badge variant="outline">
                        {currentAreaSafety.recentIncidents.length} reports
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentAreaSafety.recentIncidents.map((incident) => {
                      const IconComponent = getIncidentIcon(incident.type);
                      return (
                        <div
                          key={incident.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${getSeverityColor(incident.severity)}`}
                          onClick={() => setSelectedIncident(incident)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold capitalize">
                                  {incident.type}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {incident.distance}km away
                                  </Badge>
                                  {incident.verified && (
                                    <CheckCircle className="w-3 h-3 text-safe" />
                                  )}
                                </div>
                              </div>
                              <p className="text-sm opacity-90 mt-1">
                                {incident.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs opacity-75">
                                <span>{incident.location}</span>
                                <span>{formatTimeAgo(incident.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-16 border-trust text-trust hover:bg-trust hover:text-trust-foreground"
                    onClick={() => navigate("/emergency")}
                  >
                    <div className="text-center">
                      <Shield className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm">Emergency SOS</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-16 border-safe text-safe hover:bg-safe hover:text-safe-foreground"
                    onClick={() => navigate("/location")}
                  >
                    <div className="text-center">
                      <Share className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm">Share Location</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-16 border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                  >
                    <div className="text-center">
                      <Flag className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm">Report Incident</div>
                    </div>
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Search Areas */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Check Area Safety</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter address, landmark, or area name..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && searchArea()}
                  />
                  <Button
                    onClick={searchArea}
                    disabled={isSearching || !searchLocation.trim()}
                    className="bg-trust hover:bg-trust/90"
                  >
                    {isSearching ? (
                      <div className="w-4 h-4 border-2 border-trust-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {isSearching && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Analyzing safety data for "{searchLocation}"...
                    </p>
                    <Progress value={65} className="w-full" />
                  </div>
                )}

                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> Search for specific addresses,
                    neighborhoods, business names, or landmarks to get detailed
                    safety information before visiting.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Popular Searches */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Safety Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Downtown Plaza",
                    "University District",
                    "Central Train Station",
                    "River Park",
                    "Shopping Mall",
                    "Airport Area",
                  ].map((area, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchLocation(area);
                        searchArea();
                      }}
                      className="justify-start"
                    >
                      <MapPin className="w-3 h-3 mr-2" />
                      {area}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Route Safety */}
          <TabsContent value="routes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Route className="w-5 h-5" />
                  <span>Route Safety Checker</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="origin">From</Label>
                    <Input
                      id="origin"
                      placeholder="Starting location..."
                      value={routeOrigin}
                      onChange={(e) => setRouteOrigin(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination">To</Label>
                    <Input
                      id="destination"
                      placeholder="Destination..."
                      value={routeDestination}
                      onChange={(e) => setRouteDestination(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full bg-trust hover:bg-trust/90"
                  disabled={!routeOrigin.trim() || !routeDestination.trim()}
                >
                  <Route className="w-4 h-4 mr-2" />
                  Check Route Safety
                </Button>
              </CardContent>
            </Card>

            {/* Recent Route Checks */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Route Checks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {routeChecks.map((route) => (
                  <div key={route.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {route.origin} → {route.destination}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Recommended: {route.recommendedTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${getRatingColor(route.safetyScore)}`}
                        >
                          {route.safetyScore}/10
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Safety Score
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {route.warnings.map((warning, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <Info className="w-3 h-3 text-trust" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>

                    {route.alternativeRoute && (
                      <div className="mt-3 p-2 bg-warning/10 rounded border border-warning/20">
                        <p className="text-sm text-warning">
                          ⚠️ Alternative route recommended for better safety
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Reports */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Community Safety Reports</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Flag className="w-4 h-4 mr-2" />
                    Report Incident
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...currentAreaSafety.recentIncidents, ...nearbyIncidents].map(
                  (incident) => {
                    const IconComponent = getIncidentIcon(incident.type);
                    return (
                      <div
                        key={incident.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(incident.severity)}`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold capitalize text-foreground">
                                {incident.type} - {incident.severity} severity
                              </h4>
                              <div className="flex items-center space-x-2">
                                {incident.distance && (
                                  <Badge variant="outline" className="text-xs">
                                    {incident.distance}km away
                                  </Badge>
                                )}
                                {incident.verified ? (
                                  <CheckCircle className="w-4 h-4 text-safe" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-warning" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {incident.description}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>{incident.location}</span>
                                <span>{formatTimeAgo(incident.timestamp)}</span>
                                <span>
                                  by {incident.reportedBy.replace("_", " ")}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Phone className="w-3 h-3 mr-1" />
                                Contact Police
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Incident Detail Dialog */}
        {selectedIncident && (
          <Dialog
            open={!!selectedIncident}
            onOpenChange={() => setSelectedIncident(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {selectedIncident.type} Incident Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div
                  className={`p-3 rounded border ${getSeverityColor(selectedIncident.severity)}`}
                >
                  <p className="font-semibold">
                    Severity: {selectedIncident.severity}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedIncident.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold">Location</h4>
                    <p className="text-muted-foreground">
                      {selectedIncident.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">When</h4>
                    <p className="text-muted-foreground">
                      {formatTimeAgo(selectedIncident.timestamp)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Distance</h4>
                    <p className="text-muted-foreground">
                      {selectedIncident.distance}km away
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Status</h4>
                    <p
                      className={
                        selectedIncident.verified ? "text-safe" : "text-warning"
                      }
                    >
                      {selectedIncident.verified ? "Verified" : "Unverified"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Flag className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                  <Button className="flex-1 bg-emergency hover:bg-emergency/90">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Police
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
