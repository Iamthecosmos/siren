import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Square,
  Phone,
  MessageSquare,
  Timer,
  Calendar,
  Bell,
  Shield,
  Activity,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
}

interface CheckInSession {
  id: string;
  destination: string;
  startTime: string;
  estimatedDuration: number; // minutes
  checkInInterval: number; // minutes
  isActive: boolean;
  missedCheckIns: number;
  lastCheckIn?: string;
  status: "active" | "completed" | "escalated" | "cancelled";
  emergencyContacts: string[]; // contact IDs
}

interface CheckInLog {
  id: string;
  sessionId: string;
  timestamp: string;
  type: "check-in" | "missed" | "escalation" | "completion";
  message: string;
}

export default function CheckIn() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("setup");
  const [activeSession, setActiveSession] = useState<CheckInSession | null>(
    null,
  );
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);

  // Setup form state
  const [destination, setDestination] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [checkInInterval, setCheckInInterval] = useState(15);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const recentSessions: CheckInSession[] = [
    {
      id: "1",
      destination: "University Library",
      startTime: "2024-01-15 14:30",
      estimatedDuration: 120,
      checkInInterval: 30,
      isActive: false,
      missedCheckIns: 0,
      lastCheckIn: "2024-01-15 16:30",
      status: "completed",
      emergencyContacts: ["1", "2"],
    },
    {
      id: "2",
      destination: "Evening Walk - Central Park",
      startTime: "2024-01-14 19:00",
      estimatedDuration: 45,
      checkInInterval: 15,
      isActive: false,
      missedCheckIns: 1,
      status: "escalated",
      emergencyContacts: ["1", "3"],
    },
  ];

  const checkInLogs: CheckInLog[] = [
    {
      id: "1",
      sessionId: "1",
      timestamp: "2024-01-15 16:30",
      type: "completion",
      message: "Session completed successfully",
    },
    {
      id: "2",
      sessionId: "2",
      timestamp: "2024-01-14 19:45",
      type: "escalation",
      message: "Emergency contact called - Mom",
    },
  ];

  useEffect(() => {
    if (activeSession && activeSession.isActive) {
      setActiveTab("monitor");
      startTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeSession]);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleMissedCheckIn();
          return activeSession?.checkInInterval * 60 || 900; // Reset to interval
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startCheckInSession = () => {
    if (!destination.trim() || selectedContacts.length === 0) {
      return;
    }

    const newSession: CheckInSession = {
      id: Date.now().toString(),
      destination,
      startTime: new Date().toISOString(),
      estimatedDuration,
      checkInInterval,
      isActive: true,
      missedCheckIns: 0,
      status: "active",
      emergencyContacts: selectedContacts,
    };

    setActiveSession(newSession);
    setTimeRemaining(checkInInterval * 60); // Convert to seconds

    // Clear form
    setDestination("");
    setEstimatedDuration(60);
    setCheckInInterval(15);
    setSelectedContacts([]);
    setCustomMessage("");
  };

  const handleCheckIn = () => {
    if (!activeSession) return;

    const updatedSession = {
      ...activeSession,
      lastCheckIn: new Date().toISOString(),
      missedCheckIns: 0, // Reset missed count
    };

    setActiveSession(updatedSession);
    setTimeRemaining(activeSession.checkInInterval * 60);

    // Log the check-in
    console.log("Check-in successful at", new Date().toISOString());
  };

  const handleMissedCheckIn = () => {
    if (!activeSession) return;

    const missedCount = activeSession.missedCheckIns + 1;
    const updatedSession = {
      ...activeSession,
      missedCheckIns: missedCount,
    };

    setActiveSession(updatedSession);

    if (missedCount === 1 || missedCount === 2) {
      // Send message to emergency contacts
      sendEmergencyMessage(missedCount);
    } else if (missedCount >= 3) {
      // Escalate to phone calls
      escalateToPhoneCalls();
    }
  };

  const sendEmergencyMessage = (missedCount: number) => {
    console.log(
      `Sending emergency message (missed ${missedCount}) to contacts:`,
      activeSession?.emergencyContacts,
    );
    // In real implementation, this would send actual messages
  };

  const escalateToPhoneCalls = () => {
    setShowEscalationDialog(true);
    console.log(
      "Escalating to phone calls - contacting emergency contacts in priority order",
    );

    // Update session status
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        status: "escalated",
      });
    }
  };

  const completeSession = () => {
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        isActive: false,
        status: "completed",
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      setTimeRemaining(0);
      setActiveTab("history");
    }
  };

  const cancelSession = () => {
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        isActive: false,
        status: "cancelled",
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      setTimeRemaining(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-safe";
      case "completed":
        return "text-trust";
      case "escalated":
        return "text-emergency";
      case "cancelled":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return Activity;
      case "completed":
        return CheckCircle;
      case "escalated":
        return AlertTriangle;
      case "cancelled":
        return XCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-trust/5 overflow-x-hidden">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-muted px-4 py-2 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-3" />
                Back
              </Button>
              <div className="flex items-center space-x-3 min-w-0">
                <Clock className="w-6 h-6 text-trust flex-shrink-0" />
                <h1 className="text-xl font-bold text-foreground truncate">
                  Safety Check-In
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0">
              <ThemeToggle />
              <Badge
                variant={activeSession?.isActive ? "default" : "outline"}
                className="px-3 py-1"
              >
                {activeSession?.isActive ? "🟢 Active" : "⚪ Ready"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-12"
        >
          <TabsList className="flex w-full overflow-x-auto overflow-y-hidden gap-2 p-1">
            <TabsTrigger
              value="setup"
              className="flex-shrink-0 min-w-fit px-6 py-3 text-sm font-medium whitespace-nowrap"
            >
              📝 Setup
            </TabsTrigger>
            <TabsTrigger
              value="monitor"
              disabled={!activeSession?.isActive}
              className="flex-shrink-0 min-w-fit px-6 py-3 text-sm font-medium whitespace-nowrap"
            >
              📊 Monitor
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="flex-shrink-0 min-w-fit px-6 py-3 text-sm font-medium whitespace-nowrap"
            >
              👥 Contacts
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-shrink-0 min-w-fit px-6 py-3 text-sm font-medium whitespace-nowrap"
            >
              📜 History
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Setup Safety Check-In</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Where are you going?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">
                      Estimated Duration (minutes)
                    </Label>
                    <Select
                      value={estimatedDuration.toString()}
                      onValueChange={(value) =>
                        setEstimatedDuration(parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="interval">Check-In Interval (minutes)</Label>
                  <Select
                    value={checkInInterval.toString()}
                    onValueChange={(value) =>
                      setCheckInInterval(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="10">Every 10 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Emergency Contacts</Label>
                  <div className="space-y-3 mt-2">
                    {emergencyContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-trust/10 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-trust" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {contact.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {contact.relationship} • Priority{" "}
                              {contact.priority}
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContacts([
                                ...selectedContacts,
                                contact.id,
                              ]);
                            } else {
                              setSelectedContacts(
                                selectedContacts.filter(
                                  (id) => id !== contact.id,
                                ),
                              );
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">
                    Custom Emergency Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a custom message for your emergency contacts..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={startCheckInSession}
                  disabled={
                    !destination.trim() ||
                    selectedContacts.length === 0 ||
                    activeSession?.isActive
                  }
                  className="w-full bg-trust hover:bg-trust/90 text-trust-foreground"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Safety Check-In
                </Button>
              </CardContent>
            </Card>

            {/* Quick Setup Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Setup Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Evening Walk", duration: 45, interval: 15 },
                    { name: "Study Session", duration: 120, interval: 30 },
                    { name: "Night Out", duration: 240, interval: 60 },
                  ].map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => {
                        setEstimatedDuration(template.duration);
                        setCheckInInterval(template.interval);
                        setDestination(template.name);
                      }}
                      className="h-16 flex flex-col"
                    >
                      <div className="font-semibold">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.duration}min • Check every {template.interval}
                        min
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-8">
            {activeSession && (
              <>
                {/* Active Session Status */}
                <Card className="border-trust/20 bg-trust/5">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-trust" />
                        <span>Active Check-In Session</span>
                      </div>
                      <Badge className="bg-trust text-trust-foreground">
                        {activeSession.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {activeSession.destination}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Destination
                        </p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-trust">
                          {formatTime(timeRemaining)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Until Next Check-In
                        </p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {activeSession.missedCheckIns}/3
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Missed Check-Ins
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Next Check-In</span>
                        <span>{formatTime(timeRemaining)}</span>
                      </div>
                      <Progress
                        value={
                          ((activeSession.checkInInterval * 60 -
                            timeRemaining) /
                            (activeSession.checkInInterval * 60)) *
                          100
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Warning for missed check-ins */}
                    {activeSession.missedCheckIns > 0 && (
                      <div
                        className={`p-4 rounded-lg border ${
                          activeSession.missedCheckIns >= 3
                            ? "border-emergency bg-emergency/10"
                            : "border-warning bg-warning/10"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <AlertTriangle
                            className={`w-5 h-5 ${
                              activeSession.missedCheckIns >= 3
                                ? "text-emergency"
                                : "text-warning"
                            }`}
                          />
                          <p className="font-semibold">
                            {activeSession.missedCheckIns >= 3
                              ? "Emergency Escalation Active"
                              : `${activeSession.missedCheckIns} Missed Check-In${activeSession.missedCheckIns > 1 ? "s" : ""}`}
                          </p>
                        </div>
                        <p className="text-sm mt-1">
                          {activeSession.missedCheckIns >= 3
                            ? "Emergency contacts are being called in priority order"
                            : `Messages sent to emergency contacts. ${3 - activeSession.missedCheckIns} more missed check-ins will trigger phone calls.`}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <Button
                        onClick={handleCheckIn}
                        className="flex-1 bg-safe hover:bg-safe/90 text-safe-foreground"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        I'm Safe - Check In
                      </Button>
                      <Button
                        onClick={completeSession}
                        variant="outline"
                        className="border-trust text-trust hover:bg-trust hover:text-trust-foreground"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Complete Session
                      </Button>
                      <Button
                        onClick={cancelSession}
                        variant="outline"
                        className="border-emergency text-emergency hover:bg-emergency hover:text-emergency-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contacts Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Emergency Contacts Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeSession.emergencyContacts.map((contactId) => {
                      const contact = emergencyContacts.find(
                        (c) => c.id === contactId,
                      );
                      if (!contact) return null;

                      return (
                        <div
                          key={contactId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-trust/10 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-trust" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {contact.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Priority {contact.priority}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {activeSession.missedCheckIns > 0 && (
                              <Badge
                                variant="outline"
                                className="border-warning text-warning"
                              >
                                Notified
                              </Badge>
                            )}
                            {activeSession.missedCheckIns >= 3 &&
                              contact.priority === 1 && (
                                <Badge className="bg-emergency text-emergency-foreground">
                                  Calling
                                </Badge>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Emergency Contacts</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Add Contact
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
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
                        <p className="text-xs text-muted-foreground">
                          Priority {contact.priority} - Will be contacted{" "}
                          {contact.priority === 1
                            ? "first"
                            : `${contact.priority === 2 ? "second" : "third"}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-3 h-3 mr-1" />
                        Test Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Test Message
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Escalation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Escalation Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
                      <MessageSquare className="w-6 h-6 text-warning" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      1st & 2nd Miss
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Emergency message sent to all selected contacts
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-emergency/10 rounded-lg flex items-center justify-center mx-auto">
                      <Phone className="w-6 h-6 text-emergency" />
                    </div>
                    <h3 className="font-semibold text-foreground">3rd Miss</h3>
                    <p className="text-sm text-muted-foreground">
                      Phone calls start with Priority 1 contact
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-emergency/10 rounded-lg flex items-center justify-center mx-auto">
                      <Bell className="w-6 h-6 text-emergency" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      Escalation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      If no answer, calls next priority contact
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Check-In History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentSessions.map((session) => {
                  const StatusIcon = getStatusIcon(session.status);
                  return (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <StatusIcon
                            className={`w-5 h-5 ${getStatusColor(session.status)}`}
                          />
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {session.destination}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.startTime).toLocaleString()} •
                              {session.estimatedDuration} min • Check every{" "}
                              {session.checkInInterval} min
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={getStatusColor(session.status)}
                          >
                            {session.status}
                          </Badge>
                          {session.missedCheckIns > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {session.missedCheckIns} missed check-in
                              {session.missedCheckIns > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Escalation Dialog */}
        <Dialog
          open={showEscalationDialog}
          onOpenChange={setShowEscalationDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-emergency" />
                <span>Emergency Escalation Active</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-emergency/10 border border-emergency/20 rounded-lg p-4">
                <p className="font-semibold text-emergency">
                  3 missed check-ins detected
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Emergency contacts are being called in priority order
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Calling sequence:</h4>
                {emergencyContacts
                  .filter((c) =>
                    activeSession?.emergencyContacts.includes(c.id),
                  )
                  .sort((a, b) => a.priority - b.priority)
                  .map((contact, index) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded"
                    >
                      <span>
                        {contact.name} ({contact.phone})
                      </span>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {index === 0 ? "Calling..." : `Next ${index + 1}`}
                      </Badge>
                    </div>
                  ))}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    handleCheckIn();
                    setShowEscalationDialog(false);
                  }}
                  className="flex-1 bg-safe hover:bg-safe/90"
                >
                  I'm Safe - Stop Escalation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEscalationDialog(false)}
                >
                  Continue Calling
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
