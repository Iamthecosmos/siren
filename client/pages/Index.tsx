import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Shield,
  Phone,
  MessageSquare,
  MapPin,
  AlertTriangle,
  Users,
  Eye,
  Clock,
  Volume2,
  Smartphone,
  Heart,
  Mic,
  FileText,
  User,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const quickActions = [
    {
      title: "Emergency SOS",
      description: "Instant alert to emergency contacts",
      icon: Shield,
      color: "emergency",
      action: () => navigate("/emergency"),
    },
    {
      title: "Fake Call",
      description: "Simulate a call to exit situations",
      icon: Phone,
      color: "trust",
      action: () => navigate("/fake-call"),
    },
    {
      title: "Share Location",
      description: "Share live location with trusted contacts",
      icon: MapPin,
      color: "safe",
      action: () => navigate("/location"),
    },
    {
      title: "Quick Dial",
      description: "Instant access to emergency services",
      icon: Phone,
      color: "warning",
      action: () => navigate("/quick-dial"),
    },
  ];

  const safetyFeatures = [
    {
      icon: AlertTriangle,
      title: "Danger Zone Alerts",
      description: "Get warned about unsafe areas based on community reports",
      action: () => navigate("/danger-zones"),
    },
    {
      icon: Eye,
      title: "Hidden Mode",
      description: "Disguise the app as a calculator for discretion",
      action: () => navigate("/hidden-mode"),
    },
    {
      icon: Clock,
      title: "Check-In Timer",
      description: "Automated safety check-ins with emergency escalation",
      action: () => navigate("/check-in"),
    },
  ];

  const handsFreeModes = [
    {
      icon: Volume2,
      title: "Voice Activation",
      description: "Secret phrase triggers emergency alert",
      action: () => navigate("/voice-activation"),
    },
    {
      icon: Smartphone,
      title: "Shake Alert",
      description: "Shake pattern sends instant SOS",
      action: () => navigate("/shake-alert"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-trust/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(255, 108, 250, 1)",
                  fontFamily: "Tapestry, sans-serif",
                }}
              ></div>
              <div className="text-xl font-bold text-foreground ml-3 sm:pr-0 pr-[9px]">
                Siren
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user?.fullName || user?.username}
                    {user?.isVerified && " ✓"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => navigate("/register")}>
                    Sign Up
                  </Button>
                </div>
              )}
              <div className="sm:ml-3 ml-[10px]">
                <ThemeToggle />
              </div>
              <Badge
                variant="outline"
                className="text-safe border-safe ml-3 mt-[5px] sm:ml-3 ml-[9px]"
              >
                Online
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground px-4 pb-4 ml-[9px]">
          Your personal safety companion
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Emergency Banner */}
        <Card className="border-emergency/20 bg-emergency/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emergency rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-emergency-foreground" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    Emergency Ready
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your safety network is active. Tap any quick action for
                    immediate help.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-emergency hover:bg-emergency/90 text-emergency-foreground"
                  onClick={() => navigate("/emergency")}
                >
                  SOS
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        action.color === "emergency"
                          ? "bg-emergency"
                          : action.color === "trust"
                            ? "bg-trust"
                            : action.color === "safe"
                              ? "bg-safe"
                              : action.color === "warning"
                                ? "bg-warning"
                                : "bg-primary"
                      }`}
                    >
                      <action.icon
                        className={`w-6 h-6 ${
                          action.color === "emergency"
                            ? "text-emergency-foreground"
                            : action.color === "trust"
                              ? "text-trust-foreground"
                              : action.color === "safe"
                                ? "text-safe-foreground"
                                : action.color === "warning"
                                  ? "text-warning-foreground"
                                  : "text-primary-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Safety Features */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Safety Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safetyFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group cursor-pointer transition-all hover:shadow-md"
                onClick={feature.action}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-10 h-10 bg-trust/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-trust" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-trust transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Hands-Free Mode */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Hands-Free Safety
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {handsFreeModes.map((mode, index) => (
              <Card
                key={index}
                className="border-safe/20 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
                onClick={mode.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-safe/10 rounded-xl flex items-center justify-center">
                      <mode.icon className="w-6 h-6 text-safe" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {mode.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {mode.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-safe border-safe">
                      Setup
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Siren - Your trusted safety companion. Available 24/7 for
              emergencies.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              In case of immediate danger, call local emergency services
              directly.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
