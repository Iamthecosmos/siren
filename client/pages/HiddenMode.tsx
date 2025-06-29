import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  ArrowLeft,
  Eye,
  Calculator as CalculatorIcon,
  Clock as ClockIcon,
  Shield,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HiddenMode() {
  const navigate = useNavigate();

  const hiddenModes = [
    {
      id: "calculator",
      name: "Calculator",
      description: "Disguise as a standard calculator app",
      icon: CalculatorIcon,
      color: "bg-trust",
      route: "/calculator",
      secretMethod: "Enter: 1234567890",
    },
    {
      id: "clock",
      name: "Digital Clock",
      description: "Appear as a clock and weather app",
      icon: ClockIcon,
      color: "bg-safe",
      route: "/clock",
      secretMethod: "Triple-tap the time display",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-trust/5">
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
                <Eye className="w-6 h-6 text-trust" />
                <h1 className="text-xl font-bold text-foreground">
                  Hidden Mode
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Important Notice */}
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Info className="w-6 h-6 text-warning mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Safety First - How Hidden Mode Works
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Hidden Mode disguises Siren as innocent apps like a
                    calculator or clock. This provides protection in situations
                    where having a safety app visible might put you at risk.
                  </p>
                  <p className="font-medium text-warning">
                    ⚠️ Remember the secret method to return to Siren - it's your
                    only way back!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mode Selection */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Choose Your Disguise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hiddenModes.map((mode) => (
              <Card
                key={mode.id}
                className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                onClick={() => navigate(mode.route)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 ${mode.color} rounded-xl flex items-center justify-center`}
                    >
                      <mode.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-trust transition-colors">
                        {mode.name}
                      </h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        {mode.description}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground text-sm mb-2">
                      Secret Return Method:
                    </h4>
                    <p className="text-sm text-muted-foreground font-mono">
                      {mode.secretMethod}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground text-sm">
                      Perfect for:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {mode.id === "calculator" ? (
                        <>
                          <li>• Public spaces where discretion is needed</li>
                          <li>• When phone might be checked by others</li>
                          <li>• Professional or academic environments</li>
                        </>
                      ) : (
                        <>
                          <li>• Extended periods of discretion needed</li>
                          <li>• When phone is in plain sight</li>
                          <li>• Situations requiring passive monitoring</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <Button
                    className={`w-full ${mode.color} hover:opacity-90 text-white`}
                  >
                    <mode.icon className="w-4 h-4 mr-2" />
                    Activate {mode.name} Mode
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>How Hidden Mode Protects You</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-trust/10 rounded-lg flex items-center justify-center mx-auto">
                  <Eye className="w-6 h-6 text-trust" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Visual Disguise
                </h3>
                <p className="text-sm text-muted-foreground">
                  App appears completely normal to outside observers
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-safe/10 rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-safe" />
                </div>
                <h3 className="font-semibold text-foreground">Secret Access</h3>
                <p className="text-sm text-muted-foreground">
                  Only you know the hidden method to return to safety features
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
                  <CalculatorIcon className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Fully Functional
                </h3>
                <p className="text-sm text-muted-foreground">
                  Disguised apps work normally to maintain the deception
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Notice */}
        <Card className="border-emergency/20 bg-emergency/5">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Shield className="w-8 h-8 text-emergency mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Emergency Override
                </h3>
                <p className="text-muted-foreground">
                  In true emergencies, you can still call emergency services
                  directly from your phone's dialer, even while in hidden mode.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
