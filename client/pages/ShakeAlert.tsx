import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Smartphone,
  Activity,
  AlertTriangle,
  CheckCircle,
  Phone,
  MessageSquare,
  Users,
  Settings,
  Timer,
  Zap,
  Shield,
  Bell,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MotionData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  timestamp: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
}

interface ShakeEvent {
  id: string;
  timestamp: string;
  magnitude: number;
  responded: boolean;
  escalated: boolean;
  responseTime?: number;
}

export default function ShakeAlert() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("setup");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [motionPermission, setMotionPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");
  const [sensitivity, setSensitivity] = useState(15);
  const [checkInTimeout, setCheckInTimeout] = useState(30);
  const [currentMotion, setCurrentMotion] = useState<MotionData | null>(null);
  const [isShakeDetected, setIsShakeDetected] = useState(false);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [checkInCountdown, setCheckInCountdown] = useState(0);
  const [isEscalating, setIsEscalating] = useState(false);

  const motionHistoryRef = useRef<MotionData[]>([]);
  const checkInTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sample data
  const emergencyContacts: EmergencyContact[] = [
    {
      id: "1",
      name: "Mom",
      phone: "+1 (555) 0123",
      relationship: "Mother",
      priority: 1,
    },
    {
      id: "2",
      name: "Dad",
      phone: "+1 (555) 0124",
      relationship: "Father",
      priority: 2,
    },
    {
      id: "3",
      name: "Sarah",
      phone: "+1 (555) 0125",
      relationship: "Best Friend",
      priority: 3,
    },
  ];

  const recentEvents: ShakeEvent[] = [
    {
      id: "1",
      timestamp: "2024-01-15 14:30",
      magnitude: 18.5,
      responded: true,
      escalated: false,
      responseTime: 12,
    },
    {
      id: "2",
      timestamp: "2024-01-14 19:45",
      magnitude: 22.1,
      responded: false,
      escalated: true,
    },
  ];

  useEffect(() => {
    return () => {
      if (checkInTimerRef.current) {
        clearTimeout(checkInTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const requestMotionPermission = async () => {
    if (typeof DeviceMotionEvent !== "undefined") {
      // Check if permission is needed (iOS 13+)
      if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
        try {
          const permission = await (
            DeviceMotionEvent as any
          ).requestPermission();
          setMotionPermission(permission === "granted" ? "granted" : "denied");
        } catch (error) {
          setMotionPermission("denied");
        }
      } else {
        // Android or older iOS - permission not required
        setMotionPermission("granted");
      }
    } else {
      setMotionPermission("denied");
    }
  };

  const startMonitoring = async () => {
    if (motionPermission !== "granted") {
      await requestMotionPermission();
      return;
    }

    if (typeof DeviceMotionEvent !== "undefined") {
      const handleMotion = (event: DeviceMotionEvent) => {
        const acceleration = event.accelerationIncludingGravity;
        if (
          acceleration &&
          acceleration.x !== null &&
          acceleration.y !== null &&
          acceleration.z !== null
        ) {
          const motionData: MotionData = {
            x: acceleration.x,
            y: acceleration.y,
            z: acceleration.z,
            magnitude: Math.sqrt(
              acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2,
            ),
            timestamp: Date.now(),
          };

          setCurrentMotion(motionData);
          analyzeMotion(motionData);
        }
      };

      window.addEventListener("devicemotion", handleMotion);
      setIsMonitoring(true);

      // Store the event listener for cleanup
      return () => {
        window.removeEventListener("devicemotion", handleMotion);
      };
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setCurrentMotion(null);
    motionHistoryRef.current = [];
  };

  const analyzeMotion = (motionData: MotionData) => {
    // Add to motion history
    motionHistoryRef.current.push(motionData);

    // Keep only last 10 readings for analysis
    if (motionHistoryRef.current.length > 10) {
      motionHistoryRef.current.shift();
    }

    // Detect sudden spike in motion (shake/jerk)
    if (
      motionData.magnitude > sensitivity &&
      motionHistoryRef.current.length >= 3
    ) {
      // Check if this is significantly higher than recent average
      const recentAverage =
        motionHistoryRef.current
          .slice(-5, -1)
          .reduce((sum, data) => sum + data.magnitude, 0) / 4;

      const spike = motionData.magnitude - recentAverage;

      if (spike > sensitivity * 0.6) {
        triggerShakeAlert(motionData.magnitude);
      }
    }
  };

  const triggerShakeAlert = (magnitude: number) => {
    if (isShakeDetected) return; // Prevent multiple triggers

    setIsShakeDetected(true);
    setShowCheckInDialog(true);
    setCheckInCountdown(checkInTimeout);

    // Start countdown timer
    countdownTimerRef.current = setInterval(() => {
      setCheckInCountdown((prev) => {
        if (prev <= 1) {
          escalateToEmergency(magnitude);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Set timeout for automatic escalation
    checkInTimerRef.current = setTimeout(() => {
      escalateToEmergency(magnitude);
    }, checkInTimeout * 1000);
  };

  const handleCheckIn = () => {
    // User responded - cancel escalation
    if (checkInTimerRef.current) {
      clearTimeout(checkInTimerRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    setShowCheckInDialog(false);
    setIsShakeDetected(false);
    setCheckInCountdown(0);

    // Log successful check-in
    console.log("Check-in successful - emergency escalation cancelled");
  };

  const escalateToEmergency = (magnitude: number) => {
    setIsEscalating(true);
    setShowCheckInDialog(false);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    const primaryContact = emergencyContacts.find((c) => c.priority === 1);
    const otherContacts = emergencyContacts.filter((c) => c.priority !== 1);

    // In real implementation, this would make actual calls/send messages
    if (primaryContact) {
      console.log(
        `Calling primary contact: ${primaryContact.name} (${primaryContact.phone})`,
      );
      // window.location.href = `tel:${primaryContact.phone}`;
    }

    otherContacts.forEach((contact) => {
      console.log(
        `Sending emergency message to: ${contact.name} (${contact.phone})`,
      );
    });

    // Log the event
    const newEvent: ShakeEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      magnitude,
      responded: false,
      escalated: true,
    };

    // Reset state after escalation
    setTimeout(() => {
      setIsEscalating(false);
      setIsShakeDetected(false);
    }, 5000);
  };

  const getSensitivityLabel = (value: number) => {
    if (value <= 10) return "Very Sensitive";
    if (value <= 15) return "Sensitive";
    if (value <= 20) return "Normal";
    if (value <= 25) return "Less Sensitive";
    return "Least Sensitive";
  };

  const getMotionLevel = () => {
    if (!currentMotion) return 0;
    return Math.min((currentMotion.magnitude / 30) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-trust/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-muted px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-3" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Smartphone className="w-6 h-6 text-trust" />
                  {isMonitoring && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-trust rounded-full animate-pulse"></div>
                  )}
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  Shake Alert
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Badge
                variant={isMonitoring ? "default" : "outline"}
                className={`px-3 py-1 ${isMonitoring ? "bg-trust text-trust-foreground animate-pulse" : ""}`}
              >
                {isMonitoring ? "🟢 Active" : "⚪ Ready"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Enhanced Escalation Dialog */}
        {isEscalating && (
          <Card className="border-emergency bg-emergency/5 animate-pulse">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-emergency/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-emergency animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-emergency">
                    🚨 Emergency Escalation Active
                  </h3>
                  <p className="text-muted-foreground">
                    Contacting emergency contacts due to missed check-in...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-12"
        >
          <TabsList className="flex w-full overflow-x-auto overflow-y-hidden gap-3 p-2">
            <TabsTrigger
              value="setup"
              className="flex-shrink-0 min-w-fit px-8 py-4 text-sm font-medium whitespace-nowrap"
            >
              📱 Setup
            </TabsTrigger>
            <TabsTrigger
              value="monitor"
              className="flex-shrink-0 min-w-fit px-8 py-4 text-sm font-medium whitespace-nowrap"
            >
              📊 Monitor
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-shrink-0 min-w-fit px-8 py-4 text-sm font-medium whitespace-nowrap"
            >
              ⚙️ Settings
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-shrink-0 min-w-fit px-8 py-4 text-sm font-medium whitespace-nowrap"
            >
              📜 History
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-8">
            {/* Motion Permission */}
            {motionPermission !== "granted" && (
              <Card className="border-warning bg-warning/5">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-6 h-6 text-warning" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          📱 Motion Sensor Access Required
                        </h3>
                        <p className="text-muted-foreground">
                          Shake alert needs access to your device's motion
                          sensors to detect sudden movements and trigger
                          emergency responses.
                        </p>
                      </div>
                      <Button
                        onClick={requestMotionPermission}
                        className="bg-warning hover:bg-warning/90 text-warning-foreground px-6 py-3"
                      >
                        🔓 Grant Access
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Setup Configuration */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-trust/10 rounded-full flex items-center justify-center">
                    <Settings className="w-4 h-4 text-trust" />
                  </div>
                  <span>⚙️ Configure Shake Alert</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="sensitivity"
                          className="text-base font-semibold"
                        >
                          🎯 Shake Sensitivity:{" "}
                          {getSensitivityLabel(sensitivity)}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Adjust how sensitive the detection is to device
                          movement
                        </p>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="range"
                          id="sensitivity"
                          min="8"
                          max="30"
                          value={sensitivity}
                          onChange={(e) =>
                            setSensitivity(parseInt(e.target.value))
                          }
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Very Sensitive</span>
                          <span className="font-semibold text-trust">
                            {sensitivity}
                          </span>
                          <span>Least Sensitive</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="timeout"
                          className="text-base font-semibold"
                        >
                          ⏱️ Check-In Timeout: {checkInTimeout} seconds
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          How long you have to respond before emergency
                          escalation
                        </p>
                      </div>
                      <Select
                        value={checkInTimeout.toString()}
                        onValueChange={(value) =>
                          setCheckInTimeout(parseInt(value))
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">
                            ⚡ 15 seconds (Quick)
                          </SelectItem>
                          <SelectItem value="30">
                            ⚖️ 30 seconds (Balanced)
                          </SelectItem>
                          <SelectItem value="45">
                            🕒 45 seconds (Moderate)
                          </SelectItem>
                          <SelectItem value="60">
                            ⏰ 1 minute (Relaxed)
                          </SelectItem>
                          <SelectItem value="120">
                            🕰️ 2 minutes (Extended)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-trust/10 to-safe/10 rounded-lg p-6 border border-trust/20">
                      <h4 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-trust" />
                        <span>🔄 How It Works</span>
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-trust rounded-full flex items-center justify-center text-xs font-bold text-white">
                            1
                          </div>
                          <div>
                            <p className="font-medium">📱 Motion Detection</p>
                            <p className="text-sm text-muted-foreground">
                              Device detects sudden shake/jerk movement
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center text-xs font-bold text-white">
                            2
                          </div>
                          <div>
                            <p className="font-medium">⚠️ Safety Check</p>
                            <p className="text-sm text-muted-foreground">
                              Check-in prompt appears with {checkInTimeout}s
                              countdown
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-emergency rounded-full flex items-center justify-center text-xs font-bold text-white">
                            3
                          </div>
                          <div>
                            <p className="font-medium">🚨 Emergency Response</p>
                            <p className="text-sm text-muted-foreground">
                              If no response: Call priority contact & message
                              others
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Motion Visualization */}
                    {isMonitoring && currentMotion && (
                      <div className="bg-gradient-to-r from-trust/10 to-safe/10 rounded-lg p-6 border border-trust/20">
                        <h4 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                          <Activity className="w-5 h-5 text-trust animate-pulse" />
                          <span>📊 Live Motion Data</span>
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">Current Level:</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-trust">
                                {currentMotion.magnitude.toFixed(1)}
                              </span>
                              <span className="text-muted-foreground">
                                / {sensitivity}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Progress
                              value={getMotionLevel()}
                              className="w-full h-3"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Calm</span>
                              <span className="font-semibold text-trust">
                                {Math.round(getMotionLevel())}%
                              </span>
                              <span>Threshold</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                            <div className="text-center p-2 bg-background/50 rounded">
                              <div className="font-bold">
                                X: {currentMotion.x.toFixed(1)}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-background/50 rounded">
                              <div className="font-bold">
                                Y: {currentMotion.y.toFixed(1)}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-background/50 rounded">
                              <div className="font-bold">
                                Z: {currentMotion.z.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  {!isMonitoring ? (
                    <Button
                      onClick={startMonitoring}
                      disabled={motionPermission !== "granted"}
                      className="bg-trust hover:bg-trust/90 text-trust-foreground px-8 py-4 text-lg h-auto"
                      size="lg"
                    >
                      <Activity className="w-5 h-5 mr-3" />
                      🚀 Start Shake Monitoring
                    </Button>
                  ) : (
                    <Button
                      onClick={stopMonitoring}
                      variant="outline"
                      className="border-emergency text-emergency hover:bg-emergency hover:text-emergency-foreground px-8 py-4 text-lg h-auto"
                      size="lg"
                    >
                      <XCircle className="w-5 h-5 mr-3" />
                      🛑 Stop Monitoring
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-6">
            {isMonitoring ? (
              <>
                {/* Monitoring Status */}
                <Card className="border-trust/20 bg-trust/5">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-trust animate-pulse" />
                        <span>Shake Monitoring Active</span>
                      </div>
                      <Badge className="bg-trust text-trust-foreground">
                        Live
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {getSensitivityLabel(sensitivity)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Sensitivity Level
                        </p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-trust">
                          {currentMotion?.magnitude.toFixed(1) || "0.0"}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Current Motion
                        </p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {checkInTimeout}s
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Response Time
                        </p>
                      </div>
                    </div>

                    {currentMotion && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Motion Level</span>
                          <span>
                            {currentMotion.magnitude.toFixed(1)} / {sensitivity}
                          </span>
                        </div>
                        <Progress value={getMotionLevel()} className="w-full" />
                        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                          <div>X: {currentMotion.x.toFixed(1)}</div>
                          <div>Y: {currentMotion.y.toFixed(1)}</div>
                          <div>Z: {currentMotion.z.toFixed(1)}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Emergency Action Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Emergency Response Plan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">
                          When shake is detected:
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3 p-3 bg-warning/10 rounded-lg">
                            <Timer className="w-5 h-5 text-warning" />
                            <div>
                              <p className="font-medium">1. Check-In Alert</p>
                              <p className="text-sm text-muted-foreground">
                                {checkInTimeout} second countdown starts
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-emergency/10 rounded-lg">
                            <Phone className="w-5 h-5 text-emergency" />
                            <div>
                              <p className="font-medium">2. Emergency Call</p>
                              <p className="text-sm text-muted-foreground">
                                If no response, call primary contact
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-safe/10 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-safe" />
                            <div>
                              <p className="font-medium">3. Notify Others</p>
                              <p className="text-sm text-muted-foreground">
                                Send messages to other contacts
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">
                          Emergency Contacts:
                        </h4>
                        <div className="space-y-2">
                          {emergencyContacts.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded"
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    contact.priority === 1
                                      ? "bg-emergency text-emergency-foreground"
                                      : "bg-trust text-trust-foreground"
                                  }`}
                                >
                                  {contact.priority}
                                </div>
                                <span className="font-medium">
                                  {contact.name}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {contact.priority === 1 ? "Call" : "Message"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Smartphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Shake Monitoring Disabled
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start monitoring to detect sudden phone movements and
                    trigger emergency protocols.
                  </p>
                  <Button
                    onClick={() => setActiveTab("setup")}
                    className="bg-trust hover:bg-trust/90"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Start Monitoring
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Shake Detection Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sensitivity-setting">
                      Detection Sensitivity: {sensitivity}
                    </Label>
                    <div className="mt-2">
                      <input
                        type="range"
                        id="sensitivity-setting"
                        min="8"
                        max="30"
                        value={sensitivity}
                        onChange={(e) =>
                          setSensitivity(parseInt(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Very Sensitive</span>
                      <span>Least Sensitive</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="timeout-setting">Response Timeout</Label>
                    <Select
                      value={checkInTimeout.toString()}
                      onValueChange={(value) =>
                        setCheckInTimeout(parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="45">45 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="120">2 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-warning">
                        Important Notes
                      </h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Test sensitivity in different environments</li>
                        <li>• May trigger during intense physical activity</li>
                        <li>• Keep emergency contacts updated</li>
                        <li>• Ensure device has sufficient battery</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Emergency Contacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          contact.priority === 1
                            ? "bg-emergency text-emergency-foreground"
                            : "bg-trust text-trust-foreground"
                        }`}
                      >
                        {contact.priority}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {contact.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {contact.relationship} • {contact.phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {contact.priority === 1
                        ? "Will be called"
                        : "Will receive message"}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Shake Alert History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            Shake Detected
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()} •
                            Magnitude: {event.magnitude}
                          </p>
                          {event.responseTime && (
                            <p className="text-xs text-muted-foreground">
                              Responded in {event.responseTime} seconds
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Badge
                            variant={event.responded ? "default" : "outline"}
                            className={
                              event.responded
                                ? "bg-safe text-safe-foreground"
                                : ""
                            }
                          >
                            {event.responded ? "Responded" : "No Response"}
                          </Badge>
                          {event.escalated && (
                            <Badge className="bg-emergency text-emergency-foreground">
                              Escalated
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">
                      No Shake Events Yet
                    </h3>
                    <p className="text-muted-foreground">
                      Shake detection history will appear here when events are
                      triggered.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Check-In Dialog */}
        <Dialog open={showCheckInDialog} onOpenChange={() => {}}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center space-x-3 text-xl">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning animate-pulse" />
                </div>
                <span>🚨 Shake Detected - Are You Safe?</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-8 p-2">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto border-4 border-warning/20">
                  <Smartphone className="w-10 h-10 text-warning animate-bounce" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground">
                    📱 Sudden Movement Detected!
                  </h3>
                  <p className="text-muted-foreground">
                    Please confirm you're safe to prevent emergency escalation
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-warning animate-pulse">
                    {checkInCountdown}
                  </div>
                  <div className="space-y-2">
                    <Progress
                      value={
                        ((checkInTimeout - checkInCountdown) / checkInTimeout) *
                        100
                      }
                      className="w-full h-4"
                    />
                    <div className="text-xs text-muted-foreground">
                      Time remaining before emergency contacts are notified
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleCheckIn}
                  className="w-full bg-safe hover:bg-safe/90 text-safe-foreground py-4 text-lg h-auto"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-3" />✅ I'm Safe - Cancel
                  Alert
                </Button>
                <div className="text-center p-4 bg-emergency/10 rounded-lg border border-emergency/20">
                  <p className="text-sm font-medium text-emergency">
                    ⚠️ If no response in {checkInCountdown} seconds:
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Emergency contacts will be called and messaged automatically
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
