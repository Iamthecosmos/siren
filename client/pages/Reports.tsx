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
  ArrowLeft,
  Plus,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
} from "lucide-react";
import { CommunityReport, api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const Reports = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    severity: "",
    search: "",
  });
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
    getCurrentLocation();
  }, [filters]);

  const loadReports = async () => {
    setIsLoading(true);
    setError("");

    const response = await api.getReports({
      type: filters.type || undefined,
      severity: filters.severity || undefined,
      ...currentLocation,
      radius: 50, // 50km radius
    });

    if (response.data) {
      let filteredReports = response.data.reports;

      // Client-side search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredReports = filteredReports.filter(
          (report) =>
            report.title.toLowerCase().includes(searchLower) ||
            report.description.toLowerCase().includes(searchLower) ||
            report.address?.toLowerCase().includes(searchLower),
        );
      }

      setReports(filteredReports);
    } else {
      setError(response.error || "Failed to load reports");
    }

    setIsLoading(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Location access denied:", error);
        },
      );
    }
  };

  const handleVerifyReport = async (reportId: string) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/reports" } } });
      return;
    }

    const response = await api.verifyReport(reportId);

    if (response.data) {
      toast({
        title: "Report verified",
        description: "Thank you for helping verify this report.",
      });
      loadReports(); // Reload to update verification count
    } else {
      toast({
        title: "Verification failed",
        description: response.error || "Could not verify report",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getIncidentIcon = (type: string) => {
    return <AlertTriangle className="h-4 w-4" />; // Could expand with specific icons
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
                  Community Reports
                </h1>
                <p className="text-sm text-gray-600">
                  Safety incidents reported by the community
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/report-incident")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Report Incident
            </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
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
                  <SelectValue placeholder="Incident Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="assault">Assault</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="vandalism">Vandalism</SelectItem>
                  <SelectItem value="suspicious">
                    Suspicious Activity
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.severity}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, severity: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() =>
                  setFilters({ type: "", severity: "", search: "" })
                }
              >
                Clear Filters
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

        {/* Reports List */}
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
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reports found
              </h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.type || filters.severity
                  ? "No reports match your current filters."
                  : "No safety incidents have been reported yet."}
              </p>
              <Button onClick={() => navigate("/report-incident")}>
                Report First Incident
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card
                key={report.uuid}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 flex items-center gap-2">
                        {getIncidentIcon(report.incidentType)}
                        {report.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(report.severity)}>
                          {report.severity}
                        </Badge>
                        <Badge variant="outline">{report.incidentType}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">
                    {report.description}
                  </CardDescription>

                  <div className="space-y-2 text-sm text-gray-600">
                    {report.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{report.address}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDistanceToNow(new Date(report.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {report.policeNotified && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Police notified</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      {report.isVerified ? (
                        <Badge variant="secondary" className="text-green-600">
                          ✓ Verified
                        </Badge>
                      ) : (
                        <span className="text-gray-500">
                          {report.verificationCount} verification
                          {report.verificationCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {!report.isVerified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerifyReport(report.uuid)}
                        className="text-xs"
                      >
                        Verify
                      </Button>
                    )}
                  </div>

                  {report.user && (
                    <div className="text-xs text-gray-500 mt-2">
                      Reported by @{report.user.username}
                      {report.user.isVerified && " ✓"}
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
                Join the community
              </h3>
              <p className="text-gray-600 mb-4">
                Sign up to report incidents, verify reports, and help keep your
                community safe.
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

export default Reports;
