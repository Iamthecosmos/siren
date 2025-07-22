import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Phone,
  PhoneCall,
  PhoneOff,
  Plus,
  Play,
  Pause,
  User,
  Mic,
  Volume2,
  Heart,
  Star,
  Download,
  Share,
  Edit,
  Trash2,
  Image,
  Upload,
  FileText,
  Headphones,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Persona {
  id: string;
  name: string;
  relationship: string;
  avatar: string;
  personality: string;
  voiceId: string;
  conversationStyle: string;
  emergencyPhrases: string[];
  script: string;
  ttsVoice: string;
  customImage?: File;
}

interface CommunityVoice {
  id: string;
  name: string;
  description: string;
  creator: string;
  gender: "male" | "female" | "non-binary";
  accent: string;
  rating: number;
  downloads: number;
  isVerified: boolean;
  tags: string[];
  sampleUrl: string;
}

interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender: "male" | "female";
  speed: number;
  pitch: number;
  naturalness: "robotic" | "natural" | "very-natural";
}

export default function FakeCall() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("call");
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [newPersonaScript, setNewPersonaScript] = useState("");
  const [selectedTTSVoice, setSelectedTTSVoice] = useState("");
  const [isPlayingScript, setIsPlayingScript] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample data
  const personas: Persona[] = [
    {
      id: "1",
      name: "Mom",
      relationship: "Mother",
      avatar: "/placeholder.svg",
      personality: "Caring, concerned, asks about wellbeing",
      voiceId: "voice-1",
      conversationStyle: "Warm and nurturing",
      script:
        "Hi honey, I hope you're doing well. I was just thinking about you and wanted to check in. Are you eating properly? How's work going? You know I worry about you sometimes. Give me a call when you get this, okay? Love you so much.",
      ttsVoice: "tts-female-warm",
      emergencyPhrases: [
        "Are you okay?",
        "Where are you?",
        "I'm coming to get you",
      ],
    },
    {
      id: "2",
      name: "Alex (Best Friend)",
      relationship: "Best Friend",
      avatar: "/placeholder.svg",
      personality: "Casual, supportive, uses humor",
      voiceId: "voice-2",
      conversationStyle: "Friendly and relaxed",
      script:
        "Hey! What's up? I was just thinking we should hang out soon. Maybe grab some coffee or catch that movie we talked about? Let me know when you're free. Also, did you see what happened on social media today? It's crazy! Call me back when you can.",
      ttsVoice: "tts-neutral-casual",
      emergencyPhrases: [
        "Need me to come over?",
        "Want me to call you back in 5?",
      ],
    },
    {
      id: "3",
      name: "Dr. Sarah",
      relationship: "Doctor",
      avatar: "/placeholder.svg",
      personality: "Professional, urgent, medical concern",
      voiceId: "voice-3",
      conversationStyle: "Professional and authoritative",
      script:
        "Hello, this is Dr. Sarah from the medical center. I'm calling regarding your recent test results. We need to schedule a follow-up appointment as soon as possible. Please call our office at your earliest convenience to discuss the next steps. This is important for your health.",
      ttsVoice: "tts-female-professional",
      emergencyPhrases: ["You need to come in immediately", "This is urgent"],
    },
  ];

  const ttsVoices: TTSVoice[] = [
    {
      id: "tts-female-warm",
      name: "Emma - Warm Female",
      language: "English (US)",
      gender: "female",
      speed: 1.0,
      pitch: 1.1,
      naturalness: "very-natural",
    },
    {
      id: "tts-male-friendly",
      name: "David - Friendly Male",
      language: "English (US)",
      gender: "male",
      speed: 1.0,
      pitch: 1.0,
      naturalness: "very-natural",
    },
    {
      id: "tts-female-professional",
      name: "Sarah - Professional Female",
      language: "English (US)",
      gender: "female",
      speed: 0.9,
      pitch: 0.9,
      naturalness: "natural",
    },
    {
      id: "tts-neutral-casual",
      name: "Alex - Casual Neutral",
      language: "English (US)",
      gender: "female",
      speed: 1.1,
      pitch: 1.0,
      naturalness: "very-natural",
    },
  ];

  const communityVoices: CommunityVoice[] = [
    {
      id: "voice-1",
      name: "Emma - Caring Mother",
      description: "Warm, maternal voice perfect for family personas",
      creator: "VoiceArtist_Sarah",
      gender: "female",
      accent: "American Midwest",
      rating: 4.8,
      downloads: 1247,
      isVerified: true,
      tags: ["maternal", "warm", "caring"],
      sampleUrl: "/sample1.mp3",
    },
    {
      id: "voice-2",
      name: "Jordan - Friendly Peer",
      description: "Casual, young adult voice for friend personas",
      creator: "AudioPro_Mike",
      gender: "non-binary",
      accent: "West Coast",
      rating: 4.6,
      downloads: 892,
      isVerified: true,
      tags: ["casual", "young", "friendly"],
      sampleUrl: "/sample2.mp3",
    },
    {
      id: "voice-3",
      name: "Dr. Williams - Authority",
      description: "Professional, authoritative voice for formal situations",
      creator: "MedVoices_Team",
      gender: "female",
      accent: "British",
      rating: 4.9,
      downloads: 2103,
      isVerified: true,
      tags: ["professional", "authority", "medical"],
      sampleUrl: "/sample3.mp3",
    },
    {
      id: "voice-4",
      name: "Marcus - Deep & Calm",
      description: "Deep, reassuring male voice",
      creator: "DeepTones_Studio",
      gender: "male",
      accent: "Southern US",
      rating: 4.7,
      downloads: 756,
      isVerified: false,
      tags: ["deep", "calm", "reassuring"],
      sampleUrl: "/sample4.mp3",
    },
  ];

  const startCall = (personaId: string) => {
    setSelectedPersona(personaId);
    setIsCallActive(true);
    setCallDuration(0);

    // Simulate call duration
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Store interval ID for cleanup
    setTimeout(() => {
      clearInterval(interval);
    }, 300000); // 5 minutes max
  };

  const endCall = () => {
    setIsCallActive(false);
    setSelectedPersona(null);
    setCallDuration(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedPersonaData = personas.find((p) => p.id === selectedPersona);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const playScript = async (script: string, voiceId: string) => {
    setIsPlayingScript(true);

    // Simulate text-to-speech playback
    // In a real implementation, this would use Web Speech API or a TTS service
    try {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(script);
        const voice = ttsVoices.find((v) => v.id === voiceId);

        if (voice) {
          utterance.rate = voice.speed;
          utterance.pitch = voice.pitch;
          // Try to find a matching browser voice
          const voices = speechSynthesis.getVoices();
          const browserVoice = voices.find(
            (v) =>
              v.lang.includes("en") &&
              v.name.toLowerCase().includes(voice.gender),
          );
          if (browserVoice) {
            utterance.voice = browserVoice;
          }
        }

        utterance.onend = () => setIsPlayingScript(false);
        speechSynthesis.speak(utterance);
      } else {
        // Fallback: simulate playback duration
        setTimeout(() => {
          setIsPlayingScript(false);
        }, script.length * 50); // Rough estimate based on text length
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsPlayingScript(false);
    }
  };

  const stopScript = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    setIsPlayingScript(false);
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
                <Phone className="w-6 h-6 text-trust" />
                <h1 className="text-lg sm:text-xl font-extrabold text-foreground">Fake Call</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Badge variant={isCallActive ? "destructive" : "outline"}>
                {isCallActive ? "Call Active" : "Ready"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
        {isCallActive && selectedPersonaData ? (
          // Active Call Interface
          <div className="space-y-8">
            <Card className="border-trust/20 bg-gradient-to-br from-trust/5 to-safe/5">
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  <Avatar className="w-32 h-32 mx-auto border-4 border-trust/20">
                    <AvatarImage src={selectedPersonaData.avatar} />
                    <AvatarFallback className="text-2xl bg-trust/10">
                      {selectedPersonaData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedPersonaData.name}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedPersonaData.relationship}
                    </p>
                    <p className="text-lg font-mono text-trust mt-2">
                      {formatTime(callDuration)}
                    </p>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-16 h-16 rounded-full border-muted"
                    >
                      <Mic className="w-6 h-6" />
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className="w-16 h-16 rounded-full border-trust text-trust"
                      onClick={() =>
                        playScript(
                          selectedPersonaData.script,
                          selectedPersonaData.ttsVoice,
                        )
                      }
                      disabled={isPlayingScript}
                    >
                      {isPlayingScript ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>

                    <Button
                      size="lg"
                      onClick={endCall}
                      className="w-16 h-16 rounded-full bg-emergency hover:bg-emergency/90 text-emergency-foreground"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className="w-16 h-16 rounded-full border-muted"
                    >
                      <Volume2 className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Script Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Call Script</span>
                  <Badge variant="outline" className="ml-auto">
                    TTS:{" "}
                    {ttsVoices.find(
                      (v) => v.id === selectedPersonaData.ttsVoice,
                    )?.name || "Default"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-foreground leading-relaxed">
                    {selectedPersonaData.script}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      playScript(
                        selectedPersonaData.script,
                        selectedPersonaData.ttsVoice,
                      )
                    }
                    disabled={isPlayingScript}
                    className="flex-1"
                  >
                    {isPlayingScript ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Playing Script...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Play Script
                      </>
                    )}
                  </Button>
                  {isPlayingScript && (
                    <Button variant="outline" onClick={stopScript}>
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Responses */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Responses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPersonaData.emergencyPhrases.map((phrase, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-4"
                  >
                    "{phrase}"
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Main Interface
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="flex w-full overflow-x-auto overflow-y-hidden gap-2 p-1 pl-4 space-x-4">
              <TabsTrigger
                value="call"
                className="flex-shrink-0 min-w-fit px-6 py-3 text-sm font-medium whitespace-nowrap"
              >
                Start Call
              </TabsTrigger>
              <TabsTrigger
                value="personas"
                className="flex-shrink-0 min-w-fit px-6 py-3 text-sm font-medium whitespace-nowrap"
              >
                Personas
              </TabsTrigger>
              <TabsTrigger
                value="voices"
                className="flex-shrink-0 min-w-fit px-6 py-3 text-sm font-medium whitespace-nowrap"
              >
                Voice Library
              </TabsTrigger>
              <TabsTrigger
                value="tts"
                className="flex-shrink-0 min-w-fit px-6 py-3 text-sm font-medium whitespace-nowrap"
              >
                TTS Voices
              </TabsTrigger>
            </TabsList>

            <TabsContent value="call" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Fake Call</CardTitle>
                  <p className="text-muted-foreground">
                    Select a persona to start a realistic fake call that can
                    help you exit uncomfortable situations
                  </p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {personas.map((persona) => (
                    <Card
                      key={persona.id}
                      className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                      onClick={() => startCall(persona.id)}
                    >
                      <CardContent className="p-4 text-center space-y-3">
                        <Avatar className="w-16 h-16 mx-auto">
                          <AvatarImage src={persona.avatar} />
                          <AvatarFallback className="bg-trust/10">
                            {persona.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-trust transition-colors">
                            {persona.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {persona.relationship}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-trust hover:bg-trust/90"
                        >
                          <PhoneCall className="w-4 h-4 mr-2" />
                          Call Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personas" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Your Personas
                  </h2>
                  <p className="text-muted-foreground">
                    Create and manage fake caller personas for different
                    situations
                  </p>
                </div>
                <Dialog
                  open={isCreatingPersona}
                  onOpenChange={setIsCreatingPersona}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-trust hover:bg-trust/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Persona
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Persona</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            placeholder="e.g., Mom, Alex, Dr. Smith"
                          />
                        </div>
                        <div>
                          <Label htmlFor="relationship">Relationship</Label>
                          <Input
                            id="relationship"
                            placeholder="e.g., Mother, Friend, Doctor"
                          />
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="space-y-3">
                        <Label>Profile Image</Label>
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                            {selectedImage ? (
                              <img
                                src={URL.createObjectURL(selectedImage)}
                                alt="Selected"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Image className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose from Gallery
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Upload a photo from your device gallery
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* TTS Voice Selection */}
                      <div>
                        <Label htmlFor="tts-voice">Text-to-Speech Voice</Label>
                        <Select
                          value={selectedTTSVoice}
                          onValueChange={setSelectedTTSVoice}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a TTS voice" />
                          </SelectTrigger>
                          <SelectContent>
                            {ttsVoices.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{voice.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {voice.naturalness}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Script Writing */}
                      <div className="space-y-3">
                        <Label htmlFor="script">Call Script</Label>
                        <Textarea
                          id="script"
                          value={newPersonaScript}
                          onChange={(e) => setNewPersonaScript(e.target.value)}
                          placeholder="Write what this person would say during the call..."
                          rows={4}
                        />
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              playScript(newPersonaScript, selectedTTSVoice)
                            }
                            disabled={
                              !newPersonaScript ||
                              !selectedTTSVoice ||
                              isPlayingScript
                            }
                          >
                            {isPlayingScript ? (
                              <>
                                <Pause className="w-3 h-3 mr-1" />
                                Playing...
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 mr-1" />
                                Preview Script
                              </>
                            )}
                          </Button>
                          {isPlayingScript && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={stopScript}
                            >
                              <Pause className="w-3 h-3 mr-1" />
                              Stop
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Community Voice (Optional) */}
                      <div>
                        <Label htmlFor="community-voice">
                          Community Voice (Optional)
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a community voice (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {communityVoices.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id}>
                                {voice.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Community voices override TTS during calls
                        </p>
                      </div>

                      {/* Personality */}
                      <div>
                        <Label htmlFor="personality">Personality & Style</Label>
                        <Textarea
                          id="personality"
                          placeholder="Describe how this person speaks and acts..."
                          rows={2}
                        />
                      </div>

                      <Button className="w-full bg-trust hover:bg-trust/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Persona
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personas.map((persona) => (
                  <Card key={persona.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={persona.avatar} />
                          <AvatarFallback className="bg-trust/10">
                            {persona.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">
                              {persona.name}
                            </h3>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {persona.relationship}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {persona.personality}
                          </p>
                          <div className="space-y-2">
                            <div className="bg-muted/50 rounded p-2">
                              <p className="text-xs text-muted-foreground">
                                Script Preview:
                              </p>
                              <p className="text-xs text-foreground line-clamp-2">
                                {persona.script}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => startCall(persona.id)}
                                className="bg-trust hover:bg-trust/90"
                              >
                                <PhoneCall className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  playScript(persona.script, persona.ttsVoice)
                                }
                                disabled={isPlayingScript}
                              >
                                {isPlayingScript ? (
                                  <Pause className="w-3 h-3 mr-1" />
                                ) : (
                                  <Play className="w-3 h-3 mr-1" />
                                )}
                                Preview
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="voices" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Community Voice Library
                </h2>
                <p className="text-muted-foreground">
                  AI voices created and shared by the community. All voices
                  respect creator rights and attribution.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {communityVoices.map((voice) => (
                  <Card key={voice.id} className="group">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-foreground">
                                {voice.name}
                              </h3>
                              {voice.isVerified && (
                                <Badge
                                  variant="outline"
                                  className="border-safe text-safe"
                                >
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {voice.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              by {voice.creator}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {voice.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{voice.rating}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Download className="w-3 h-3" />
                              <span>{voice.downloads}</span>
                            </div>
                          </div>
                          <div className="text-xs">
                            {voice.gender} • {voice.accent}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="bg-trust hover:bg-trust/90"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Use Voice
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-trust/5 to-safe/5 border-trust/20">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-trust/10 rounded-lg flex items-center justify-center mx-auto">
                      <Mic className="w-6 h-6 text-trust" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Contribute Your Voice
                      </h3>
                      <p className="text-muted-foreground">
                        Help the community by sharing your AI voice samples. You
                        retain all rights to your contributions.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-trust text-trust hover:bg-trust hover:text-trust-foreground"
                    >
                      Upload Voice Sample
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tts" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Text-to-Speech Voices
                </h2>
                <p className="text-muted-foreground">
                  High-quality TTS voices for your personas. Perfect for
                  creating realistic call scripts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ttsVoices.map((voice) => (
                  <Card key={voice.id} className="group">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-foreground">
                                {voice.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`${
                                  voice.naturalness === "very-natural"
                                    ? "border-safe text-safe"
                                    : voice.naturalness === "natural"
                                      ? "border-trust text-trust"
                                      : "border-warning text-warning"
                                }`}
                              >
                                {voice.naturalness}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {voice.language}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Headphones className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Speed:
                            </span>
                            <span className="text-foreground">
                              {voice.speed}x
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Pitch:
                            </span>
                            <span className="text-foreground">
                              {voice.pitch}x
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Gender:
                            </span>
                            <span className="text-foreground capitalize">
                              {voice.gender}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              playScript(
                                "Hello, this is a sample of how I sound. I can help make your fake calls more realistic.",
                                voice.id,
                              )
                            }
                            disabled={isPlayingScript}
                          >
                            {isPlayingScript ? (
                              <>
                                <Pause className="w-3 h-3 mr-1" />
                                Playing...
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 mr-1" />
                                Sample
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-trust hover:bg-trust/90"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Use Voice
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-trust/5 to-safe/5 border-trust/20">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-trust/10 rounded-lg flex items-center justify-center mx-auto">
                      <Mic className="w-6 h-6 text-trust" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Premium TTS Voices
                      </h3>
                      <p className="text-muted-foreground">
                        Upgrade to access ultra-realistic AI voices with emotion
                        and accent controls
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-trust text-trust hover:bg-trust hover:text-trust-foreground"
                    >
                      View Premium Options
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
