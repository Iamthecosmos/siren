import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Play,
  Pause,
  Upload,
  Star,
  Download,
  Filter,
  Search,
  Mic,
} from "lucide-react";
import { VoiceContribution, api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const Voices = () => {
  const [voices, setVoices] = useState<VoiceContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    gender: "",
    ageRange: "",
    language: "en",
    sort: "recent",
    search: "",
  });
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    voiceType: "emergency",
    gender: "",
    ageRange: "",
    accent: "",
    language: "en",
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadVoices();
  }, [filters]);

  const loadVoices = async () => {
    setIsLoading(true);
    setError("");

    const response = await api.getVoices({
      type: filters.type || undefined,
      gender: filters.gender || undefined,
      ageRange: filters.ageRange || undefined,
      language: filters.language,
      sort: filters.sort,
    });

    if (response.data) {
      let filteredVoices = response.data.voices;

      // Client-side search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredVoices = filteredVoices.filter(
          (voice) =>
            voice.title.toLowerCase().includes(searchLower) ||
            voice.description.toLowerCase().includes(searchLower),
        );
      }

      setVoices(filteredVoices);
    } else {
      setError(response.error || "Failed to load voices");
    }

    setIsLoading(false);
  };

  const handlePlayVoice = async (voiceId: string, filePath: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    // Track download
    await api.trackDownload(voiceId);

    // Simple audio play - in a real app, you'd want a proper audio player
    const audio = new Audio(`http://localhost:3001${filePath}`);
    audio.onended = () => setPlayingVoice(null);
    setPlayingVoice(voiceId);
    audio.play().catch((err) => {
      console.error("Playback failed:", err);
      setPlayingVoice(null);
      toast({
        title: "Playback failed",
        description: "Could not play this voice recording",
        variant: "destructive",
      });
    });
  };

  const handleRateVoice = async (voiceId: string, rating: number) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/voices" } } });
      return;
    }

    const response = await api.rateVoice(voiceId, rating);

    if (response.data) {
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this voice!",
      });
      loadVoices(); // Reload to update ratings
    } else {
      toast({
        title: "Rating failed",
        description: response.error || "Could not submit rating",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/voices" } } });
      return;
    }

    if (!uploadFile) {
      toast({
        title: "No file selected",
        description: "Please select an audio file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("voiceFile", uploadFile);
    Object.entries(uploadData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await api.uploadVoice(formData);

    if (response.data) {
      toast({
        title: "Voice uploaded!",
        description: "Your voice has been uploaded and is pending approval.",
      });
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadData({
        title: "",
        description: "",
        voiceType: "emergency",
        gender: "",
        ageRange: "",
        accent: "",
        language: "en",
      });
      loadVoices();
    } else {
      toast({
        title: "Upload failed",
        description: response.error || "Could not upload voice",
        variant: "destructive",
      });
    }

    setIsUploading(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "emergency":
        return "bg-red-100 text-red-800";
      case "casual":
        return "bg-blue-100 text-blue-800";
      case "professional":
        return "bg-purple-100 text-purple-800";
      case "family":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Link>
              <div className="ml-6">
                <h1 className="text-xl font-semibold text-gray-900">
                  Voice Library
                </h1>
                <p className="text-sm text-gray-600">
                  Community-contributed voices for fake calls
                </p>
              </div>
            </div>

            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Upload Voice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Voice Recording</DialogTitle>
                  <DialogDescription>
                    Share your voice to help others with fake calls
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voiceFile">Audio File</Label>
                    <Input
                      id="voiceFile"
                      type="file"
                      accept=".mp3,.wav,.m4a,.ogg"
                      onChange={(e) =>
                        setUploadFile(e.target.files?.[0] || null)
                      }
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Supported: MP3, WAV, M4A, OGG (max 10MB, 5 minutes)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={uploadData.title}
                      onChange={(e) =>
                        setUploadData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Emergency Mom Voice"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadData.description}
                      onChange={(e) =>
                        setUploadData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Concerned mother calling about safety..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Voice Type</Label>
                      <Select
                        value={uploadData.voiceType}
                        onValueChange={(value) =>
                          setUploadData((prev) => ({
                            ...prev,
                            voiceType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="professional">
                            Professional
                          </SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={uploadData.gender}
                        onValueChange={(value) =>
                          setUploadData((prev) => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Age Range</Label>
                      <Select
                        value={uploadData.ageRange}
                        onValueChange={(value) =>
                          setUploadData((prev) => ({
                            ...prev,
                            ageRange: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="teen">Teen</SelectItem>
                          <SelectItem value="adult">Adult</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Accent</Label>
                      <Input
                        value={uploadData.accent}
                        onChange={(e) =>
                          setUploadData((prev) => ({
                            ...prev,
                            accent: e.target.value,
                          }))
                        }
                        placeholder="American, British..."
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload Voice"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search voices..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Voice Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.gender}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.ageRange}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, ageRange: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Age Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Ages</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="teen">Teen</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sort}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, sort: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    type: "",
                    gender: "",
                    ageRange: "",
                    search: "",
                  }))
                }
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Voice Library */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : voices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No voices found
              </h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.type || filters.gender
                  ? "No voices match your current filters."
                  : "No voices have been uploaded yet."}
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                Upload First Voice
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {voices.map((voice) => (
              <Card
                key={voice.uuid}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        {voice.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(voice.voiceType)}>
                          {voice.voiceType}
                        </Badge>
                        <Badge variant="outline">
                          {voice.gender} • {voice.ageRange}
                        </Badge>
                      </div>
                    </div>
                    {voice.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4 line-clamp-2">
                    {voice.description}
                  </CardDescription>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Duration: {formatDuration(voice.duration)}</span>
                      <span>{voice.format.toUpperCase()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{voice.ratingAverage.toFixed(1)}</span>
                        <span className="text-gray-400">
                          ({voice.ratingCount})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>{voice.downloadCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      onClick={() =>
                        handlePlayVoice(voice.uuid, voice.filePath)
                      }
                      className="flex items-center gap-2"
                    >
                      {playingVoice === voice.uuid ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {playingVoice === voice.uuid ? "Pause" : "Play"}
                    </Button>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRateVoice(voice.uuid, rating)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Star
                            className={`h-3 w-3 ${
                              rating <= voice.ratingAverage
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {voice.user && (
                    <div className="text-xs text-gray-500 mt-2">
                      Uploaded by @{voice.user.username}
                      {voice.user.isVerified && " ✓"}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Authentication Prompt */}
        {!isAuthenticated && (
          <Card className="mt-8">
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Join the voice library
              </h3>
              <p className="text-gray-600 mb-4">
                Sign up to upload voices, rate recordings, and contribute to the
                community.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate("/register")}>Sign Up</Button>
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Voices;
