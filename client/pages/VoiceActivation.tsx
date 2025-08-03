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
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  Square,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Phone,
  MessageSquare,
  Users,
  Settings,
  Activity,
  Shield,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
}

interface VoicePhrase {
  id: string;
  phrase: string;
  audioBlob?: Blob;
  dateRecorded: string;
  isActive: boolean;
  sensitivity: number;
}

interface EmergencyTrigger {
  id: string;
  timestamp: string;
  phrase: string;
  confidence: number;
  action: "call_primary" | "message_all" | "test_mode";
  contacts: string[];
}

export default function VoiceActivation() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("setup");
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedPhrase, setRecordedPhrase] = useState<VoicePhrase | null>(
    null,
  );
  const [micPermission, setMicPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");
  const [sensitivity, setSensitivity] = useState(70);
  const [testMode, setTestMode] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isEmergencyTriggered, setIsEmergencyTriggered] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

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

  const recentTriggers: EmergencyTrigger[] = [
    {
      id: "1",
      timestamp: "2024-01-15 14:30",
      phrase: "I need help now",
      confidence: 85,
      action: "test_mode",
      contacts: ["1", "2"],
    },
  ];

  useEffect(() => {
    requestMicrophonePermission();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      setMicPermission("denied");
    }
  };

  const startRecording = async () => {
    if (micPermission !== "granted") {
      await requestMicrophonePermission();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const newPhrase: VoicePhrase = {
          id: Date.now().toString(),
          phrase: "Custom emergency phrase",
          audioBlob,
          dateRecorded: new Date().toISOString(),
          isActive: true,
          sensitivity,
        };
        setRecordedPhrase(newPhrase);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setupAudioAnalyzer(stream);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  };

  const setupAudioAnalyzer = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    microphone.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAudioLevel = () => {
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);

        if (isRecording) {
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      }
    };

    updateAudioLevel();
  };

  const startListening = () => {
    if (!recordedPhrase) {
      return;
    }

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          const confidence = event.results[i][0].confidence;

          // Check if the transcript contains the emergency phrase
          if (
            transcript.includes(recordedPhrase.phrase.toLowerCase()) &&
            confidence * 100 >= sensitivity
          ) {
            triggerEmergency(transcript, confidence * 100);
            break;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start(); // Restart recognition
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } else {
      alert("Speech recognition not supported in this browser");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const triggerEmergency = async (
    detectedPhrase: string,
    confidence: number,
  ) => {
    setIsEmergencyTriggered(true);

    const primaryContact = emergencyContacts.find((c) => c.priority === 1);
    const otherContacts = emergencyContacts.filter((c) => c.priority !== 1);

    if (testMode) {
      // Test mode - just log and show dialog
      console.log("TEST MODE: Emergency phrase detected:", detectedPhrase);
      console.log("Would call:", primaryContact?.name);
      console.log(
        "Would message:",
        otherContacts.map((c) => c.name),
      );
    } else {
      // Real mode - actual emergency contact
      if (primaryContact) {
        // In real implementation, this would make an actual call
        window.location.href = `tel:${primaryContact.phone}`;
      }

      // Send messages to other contacts
      otherContacts.forEach((contact) => {
        // In real implementation, this would send actual SMS/messages
        console.log(
          `Sending emergency message to ${contact.name}: ${contact.phone}`,
        );
      });
    }

    // Log the trigger
    const newTrigger: EmergencyTrigger = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      phrase: detectedPhrase,
      confidence,
      action: testMode ? "test_mode" : "call_primary",
      contacts: emergencyContacts.map((c) => c.id),
    };

    setTimeout(() => {
      setIsEmergencyTriggered(false);
    }, 5000);
  };

  const playRecordedPhrase = () => {
    if (recordedPhrase?.audioBlob) {
      const audio = new Audio(URL.createObjectURL(recordedPhrase.audioBlob));
      audio.play();
    }
  };

  const deleteRecordedPhrase = () => {
    setRecordedPhrase(null);
    if (isListening) {
      stopListening();
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
                <Mic className="w-6 h-6 text-trust" />
                <h1 className="text-lg sm:text-xl font-extrabold text-foreground">
                  Voice Activation
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Badge variant={isListening ? "default" : "outline"}>
                {isListening ? "Listening" : "Ready"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-12 space-y-8 sm:space-y-12">
        {/* Emergency Trigger Dialog */}
        {isEmergencyTriggered && (
          <Card className="border-emergency bg-emergency/5 animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <AlertTriangle className="w-8 h-8 text-emergency" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Emergency Phrase Detected!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {testMode
                      ? "Test mode: Simulating emergency contact"
                      : "Contacting emergency contacts..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="flex w-full overflow-x-auto overflow-y-hidden gap-1 p-1">
            <TabsTrigger value="setup" className="flex-shrink-0 min-w-fit px-[15px] py-3 text-sm font-medium whitespace-nowrap m-0">Setup</TabsTrigger>
            <TabsTrigger value="monitor" className="flex-shrink-0 min-w-fit px-[15px] py-3 text-sm font-medium whitespace-nowrap m-0">Monitor</TabsTrigger>
            <TabsTrigger value="settings" className="flex-shrink-0 min-w-fit px-[15px] py-3 text-sm font-medium whitespace-nowrap m-0">Settings</TabsTrigger>
            <TabsTrigger value="history" className="flex-shrink-0 min-w-fit px-[15px] py-3 text-sm font-medium whitespace-nowrap m-0">History</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            {/* Microphone Permission */}
            {micPermission !== "granted" && (
              <Card className="border-warning bg-warning/5">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <MicOff className="w-8 h-8 text-warning" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        Microphone Access Required
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Voice activation needs microphone access to detect your
                        emergency phrase.
                      </p>
                    </div>
                    <Button
                      onClick={requestMicrophonePermission}
                      className="bg-warning hover:bg-warning/90 text-warning-foreground"
                    >
                      Grant Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Record Emergency Phrase */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="w-5 h-5" />
                  <span>Record Emergency Phrase</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!recordedPhrase ? (
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        Record Your Emergency Phrase
                      </h3>
                      <p className="text-muted-foreground">
                        Choose a unique phrase that you can say clearly in an
                        emergency. Avoid common words to prevent accidental
                        triggers.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="phrase-text">Emergency Phrase</Label>
                      <Input
                        id="phrase-text"
                        placeholder="e.g., 'I need help now' or 'Emergency assistance required'"
                        onChange={(e) => {
                          if (recordedPhrase) {
                            setRecordedPhrase({
                              ...recordedPhrase,
                              phrase: e.target.value,
                            });
                          }
                        }}
                      />
                    </div>

                    {/* Audio Level Indicator */}
                    {isRecording && (
                      <div className="space-y-2">
                        <div className="flex justify-center space-x-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-8 rounded ${
                                audioLevel > i * 25 ? "bg-trust" : "bg-muted"
                              } transition-colors`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Say your emergency phrase clearly
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center">
                      {!isRecording ? (
                        <Button
                          onClick={startRecording}
                          disabled={micPermission !== "granted"}
                          className="w-32 h-32 rounded-full bg-emergency hover:bg-emergency/90 text-emergency-foreground"
                        >
                          <div className="text-center">
                            <Mic className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-sm">Record</div>
                          </div>
                        </Button>
                      ) : (
                        <Button
                          onClick={stopRecording}
                          className="w-32 h-32 rounded-full bg-safe hover:bg-safe/90 text-safe-foreground"
                        >
                          <div className="text-center">
                            <Square className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-sm">Stop</div>
                          </div>
                        </Button>
                      )}
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 text-sm">
                      <h4 className="font-semibold mb-2">
                        Tips for a good emergency phrase:
                      </h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Use 3-5 words for best recognition</li>
                        <li>• Avoid common phrases like "hello" or "okay"</li>
                        <li>• Speak clearly and at normal volume</li>
                        <li>• Test in a quiet environment first</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      <CheckCircle className="w-16 h-16 text-safe mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Emergency Phrase Recorded
                        </h3>
                        <p className="text-muted-foreground">
                          "{recordedPhrase.phrase}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Recorded on{" "}
                          {new Date(
                            recordedPhrase.dateRecorded,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <Button onClick={playRecordedPhrase} variant="outline">
                        <Play className="w-4 h-4 mr-2" />
                        Play Recording
                      </Button>
                      <Button
                        onClick={deleteRecordedPhrase}
                        variant="outline"
                        className="border-emergency text-emergency"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Re-record
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={startListening}
                        disabled={isListening}
                        className="h-16 bg-trust hover:bg-trust/90 text-trust-foreground"
                      >
                        <div className="text-center">
                          <Mic className="w-5 h-5 mx-auto mb-1" />
                          <div className="text-sm">Start Voice Monitoring</div>
                        </div>
                      </Button>
                      <Button
                        onClick={() => setActiveTab("monitor")}
                        variant="outline"
                        className="h-16 border-trust text-trust hover:bg-trust hover:text-trust-foreground"
                      >
                        <div className="text-center">
                          <Activity className="w-5 h-5 mx-auto mb-1" />
                          <div className="text-sm">View Monitoring</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-6">
            {recordedPhrase ? (
              <>
                {/* Monitoring Status */}
                <Card
                  className={`border-2 ${isListening ? "border-trust bg-trust/5" : "border-muted"}`}
                >
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center space-x-2 mb-4">
                      {isListening ? (
                        <Activity className="w-5 h-5 text-trust animate-pulse" />
                      ) : (
                        <MicOff className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span>Voice Monitoring</span>
                    </CardTitle>
                    <Badge variant={isListening ? "default" : "outline"}>
                      {isListening ? "Active" : "Inactive"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                      <div className="text-2xl font-bold text-foreground">
                        {isListening
                          ? "Listening for emergency phrase..."
                          : "Voice monitoring is off"}
                      </div>
                      <p className="text-muted-foreground">
                        Emergency phrase: "{recordedPhrase.phrase}"
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sensitivity: {sensitivity}% •{" "}
                        {testMode ? "Test Mode" : "Live Mode"}
                      </p>
                    </div>

                    <div className="flex justify-center space-x-4">
                      {!isListening ? (
                        <Button
                          onClick={startListening}
                          className="bg-trust hover:bg-trust/90 text-trust-foreground"
                        >
                          <Mic className="w-4 h-4 mr-2" />
                          Start Monitoring
                        </Button>
                      ) : (
                        <Button
                          onClick={stopListening}
                          variant="outline"
                          className="border-emergency text-emergency hover:bg-emergency hover:text-emergency-foreground"
                        >
                          <MicOff className="w-4 h-4 mr-2" />
                          Stop Monitoring
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Action Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Emergency Action Plan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">
                          When phrase is detected:
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3 p-3 bg-emergency/10 rounded-lg">
                            <Phone className="w-5 h-5 text-emergency" />
                            <div>
                              <p className="font-medium">
                                1. Call Primary Contact
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {
                                  emergencyContacts.find(
                                    (c) => c.priority === 1,
                                  )?.name
                                }{" "}
                                will be called immediately
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-warning/10 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-warning" />
                            <div>
                              <p className="font-medium">
                                2. Message Other Contacts
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {
                                  emergencyContacts.filter(
                                    (c) => c.priority !== 1,
                                  ).length
                                }{" "}
                                other contacts will receive emergency messages
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">
                          Contact Order:
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
                                      : "bg-warning text-warning-foreground"
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
                  <MicOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Emergency Phrase Recorded
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You need to record an emergency phrase before you can start
                    voice monitoring.
                  </p>
                  <Button
                    onClick={() => setActiveTab("setup")}
                    className="bg-trust hover:bg-trust/90"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Record Emergency Phrase
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
                  <span>Voice Recognition Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sensitivity">
                      Recognition Sensitivity: {sensitivity}%
                    </Label>
                    <div className="mt-2">
                      <input
                        type="range"
                        id="sensitivity"
                        min="50"
                        max="95"
                        value={sensitivity}
                        onChange={(e) =>
                          setSensitivity(parseInt(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Higher sensitivity = easier to trigger, but may have false
                      positives
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Test Mode
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Practice with voice activation without actually
                        contacting emergency services
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={testMode}
                      onChange={(e) => setTestMode(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                </div>

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-warning">
                        Important Safety Notes
                      </h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>
                          • Test your emergency phrase regularly in a quiet
                          environment
                        </li>
                        <li>
                          • Make sure your emergency contacts are up to date
                        </li>
                        <li>
                          • Voice activation may not work reliably in very noisy
                          environments
                        </li>
                        <li>
                          • Always have backup emergency contact methods
                          available
                        </li>
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
                  <span>Activation History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTriggers.length > 0 ? (
                  recentTriggers.map((trigger) => (
                    <div key={trigger.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            "{trigger.phrase}"
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(trigger.timestamp).toLocaleString()} •
                            Confidence: {trigger.confidence}%
                          </p>
                        </div>
                        <Badge
                          variant={
                            trigger.action === "test_mode"
                              ? "outline"
                              : "default"
                          }
                        >
                          {trigger.action === "test_mode" ? "Test" : "Live"}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">
                      No Activations Yet
                    </h3>
                    <p className="text-muted-foreground">
                      Voice activation history will appear here when your
                      emergency phrase is detected.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
