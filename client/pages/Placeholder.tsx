import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
interface PlaceholderProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function Placeholder({
  title,
  description,
  icon: Icon = Shield,
}: PlaceholderProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
                <Icon className="w-6 h-6 text-trust" />
                <h1 className="text-lg sm:text-xl font-extrabold text-foreground">{title}</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
        <Card className="border-trust/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-trust" />
            </div>
            <CardTitle className="text-2xl text-foreground">{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground text-lg">{description}</p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This feature is coming soon! We're working hard to bring you the
                best safety tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto bg-trust hover:bg-trust/90 text-trust-foreground"
                >
                  Return to Safety Dashboard
                </Button>
                <Button variant="outline" className="w-full sm:w-auto border-trust text-trust">
                  Get Notified When Ready
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Preview */}
        <Card className="mt-8 bg-gradient-to-r from-trust/5 to-safe/5 border-trust/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                What to Expect
              </h3>
              <p className="text-muted-foreground">
                This feature will provide you with advanced safety tools and
                real-time protection. Stay tuned for updates!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-trust/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-trust" />
                  </div>
                  <h4 className="font-semibold text-foreground">Secure</h4>
                  <p className="text-sm text-muted-foreground">
                    End-to-end encryption
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-safe/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-safe" />
                  </div>
                  <h4 className="font-semibold text-foreground">Fast</h4>
                  <p className="text-sm text-muted-foreground">
                    Instant response time
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-warning" />
                  </div>
                  <h4 className="font-semibold text-foreground">Reliable</h4>
                  <p className="text-sm text-muted-foreground">
                    Works offline too
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
