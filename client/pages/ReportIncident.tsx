import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Checkbox } from "@/components/ui/checkbox";
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
  Flag,
  MapPin,
  AlertTriangle,
  Camera,
  Upload,
  Shield,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface IncidentForm {
  type: string;
  severity: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  description: string;
  dateTime: string;
  photos: File[];
  isAnonymous: boolean;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  policeNotified: boolean;
  witnessCount: string;
}

export default function ReportIncident() {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<IncidentForm>({
    type: "",
    severity: "",
    location: "",
    description: "",
    dateTime: "",
    photos: [],
    isAnonymous: false,
    reporterName: "",
    reporterPhone: "",
    reporterEmail: "",
    policeNotified: false,
    witnessCount: "",
  });

  const incidentTypes = [
    { value: "theft", label: "🏃‍♂️ Theft/Robbery", icon: "🏃‍♂️" },
    { value: "assault", label: "👊 Physical Assault", icon: "👊" },
    { value: "harassment", label: "😠 Harassment", icon: "😠" },
    { value: "vandalism", label: "🔨 Vandalism", icon: "🔨" },
    { value: "suspicious", label: "👀 Suspicious Activity", icon: "👀" },
    { value: "drug", label: "💊 Drug Activity", icon: "💊" },
    { value: "weapon", label: "🔫 Weapon Sighting", icon: "🔫" },
    { value: "accident", label: "🚗 Traffic Accident", icon: "🚗" },
    { value: "other", label: "❓ Other", icon: "❓" },
  ];

  const severityLevels = [
    {
      value: "low",
      label: "Low",
      color: "bg-safe",
      description: "Minor concern",
    },
    {
      value: "medium",
      label: "Medium",
      color: "bg-warning",
      description: "Moderate threat",
    },
    {
      value: "high",
      label: "High",
      color: "bg-emergency",
      description: "Serious danger",
    },
    {
      value: "critical",
      label: "Critical",
      color: "bg-emergency",
      description: "Immediate threat",
    },
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          };
          setCurrentLocation(coords);
          setFormData((prev) => ({
            ...prev,
            location: coords.address,
            coordinates: { lat: coords.lat, lng: coords.lng },
          }));
        },
        (error) => {
          console.error("Location error:", error);
        },
      );
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files].slice(0, 5), // Max 5 photos
    }));
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setShowSuccess(true);

    // Auto close success dialog and redirect
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/danger-zones");
    }, 3000);
  };

  const updateField = (field: keyof IncidentForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-warning/5 overflow-x-hidden">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/danger-zones")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back
              </Button>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-6 h-6 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Flag className="w-3 h-3 text-warning" />
                </div>
                <h1 className="text-lg font-bold text-foreground truncate">
                  Report Safety Incident
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <ThemeToggle />
              <Badge variant="outline" className="px-2 py-1 text-xs">
                🔒 Secure
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Information Banner */}
        <Card className="border-trust/20 bg-trust/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-trust/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-trust" />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-trust text-lg">
                  🛡️ Help Keep Your Community Safe
                </h3>
                <p className="text-muted-foreground">
                  Your report helps build a safer community. All reports are
                  reviewed and shared with relevant authorities when
                  appropriate.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-trust" />
                    <span>Reports are encrypted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-trust" />
                    <span>Anonymous option available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-trust" />
                    <span>Reviewed within 24 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Notice */}
        <Card className="border-emergency/20 bg-emergency/5">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="w-8 h-8 text-emergency" />
              <div>
                <h3 className="font-semibold text-emergency text-lg">
                  🚨 Emergency Situations
                </h3>
                <p className="text-muted-foreground">
                  If you're in immediate danger, call emergency services (911,
                  999, etc.) first before filing this report.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Incident Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Flag className="w-5 h-5 text-warning" />
                <span>📝 Incident Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Incident Type */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  What type of incident occurred?
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {incidentTypes.map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={
                        formData.type === type.value ? "default" : "outline"
                      }
                      className={`h-auto p-4 text-left justify-start ${
                        formData.type === type.value
                          ? "bg-warning text-warning-foreground"
                          : ""
                      }`}
                      onClick={() => updateField("type", type.value)}
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{type.label}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Severity Level */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  How serious was this incident?
                </Label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {severityLevels.map((level) => (
                    <Button
                      key={level.value}
                      type="button"
                      variant={
                        formData.severity === level.value
                          ? "default"
                          : "outline"
                      }
                      className={`h-auto p-4 text-center ${
                        formData.severity === level.value
                          ? level.color + " text-white"
                          : ""
                      }`}
                      onClick={() => updateField("severity", level.value)}
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs opacity-90">
                          {level.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date and Time */}
              <div className="space-y-3">
                <Label htmlFor="datetime" className="text-base font-semibold">
                  When did this happen?
                </Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => updateField("dateTime", e.target.value)}
                  required
                  max={new Date().toISOString().slice(0, 16)}
                  className="h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-trust" />
                <span>📍 Location Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="location" className="text-base font-semibold">
                  Where did this incident occur?
                </Label>
                <div className="flex space-x-3">
                  <Input
                    id="location"
                    placeholder="Street address, landmark, or description..."
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    required
                    className="h-12"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="px-4 py-3 h-12"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Use Current
                  </Button>
                </div>
                {currentLocation && (
                  <p className="text-sm text-muted-foreground">
                    📍 Current coordinates: {currentLocation.address}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="witnesses" className="text-base font-semibold">
                  How many witnesses were present?
                </Label>
                <Select
                  value={formData.witnessCount}
                  onValueChange={(value) => updateField("witnessCount", value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select witness count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1-2">1-2 people</SelectItem>
                    <SelectItem value="3-5">3-5 people</SelectItem>
                    <SelectItem value="6-10">6-10 people</SelectItem>
                    <SelectItem value="10+">More than 10</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span>📄 Detailed Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="description"
                  className="text-base font-semibold"
                >
                  Please describe what happened in detail
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the incident: who was involved, what happened, how it occurred, any identifying details..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  required
                  rows={6}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Include as many details as possible. This helps authorities
                  understand and respond appropriately.
                </p>
              </div>

              {/* Photo Upload */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Evidence Photos (Optional)
                </Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <Label htmlFor="photos" className="cursor-pointer">
                        <div className="space-y-2">
                          <p className="font-medium">Upload Photos</p>
                          <p className="text-sm text-muted-foreground">
                            Add up to 5 photos of the incident location or
                            evidence
                          </p>
                        </div>
                      </Label>
                      <Input
                        id="photos"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("photos")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Photos
                    </Button>
                  </div>
                </div>

                {formData.photos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected Photos:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs p-2">
                            <span className="truncate">{photo.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                            onClick={() => removePhoto(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <User className="w-5 h-5 text-safe" />
                <span>👤 Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
                <Checkbox
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) =>
                    updateField("isAnonymous", checked)
                  }
                />
                <Label
                  htmlFor="anonymous"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Submit this report anonymously</span>
                </Label>
              </div>

              {!formData.isAnonymous && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-semibold">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Full name"
                      value={formData.reporterName}
                      onChange={(e) =>
                        updateField("reporterName", e.target.value)
                      }
                      required={!formData.isAnonymous}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-base font-semibold">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.reporterPhone}
                      onChange={(e) =>
                        updateField("reporterPhone", e.target.value)
                      }
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="email" className="text-base font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.reporterEmail}
                      onChange={(e) =>
                        updateField("reporterEmail", e.target.value)
                      }
                      className="h-12"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id="police"
                  checked={formData.policeNotified}
                  onCheckedChange={(checked) =>
                    updateField("policeNotified", checked)
                  }
                />
                <Label
                  htmlFor="police"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>
                    I have already contacted police about this incident
                  </span>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.type ||
                !formData.severity ||
                !formData.location ||
                !formData.description ||
                !formData.dateTime
              }
              className="bg-warning hover:bg-warning/90 text-warning-foreground px-12 py-4 text-lg h-auto"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-warning-foreground border-t-transparent rounded-full animate-spin mr-3" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <Flag className="w-5 h-5 mr-3" />
                  🚀 Submit Safety Report
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center space-x-3 text-xl">
                <div className="w-12 h-12 bg-safe/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-safe" />
                </div>
                <span>✅ Report Submitted!</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-2">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Thank you for helping keep your community safe. Your report
                  has been received and will be reviewed.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📧 You'll receive a confirmation email shortly</p>
                  <p>���� Reports are typically reviewed within 24 hours</p>
                  <p>👮 Relevant authorities will be notified if needed</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
