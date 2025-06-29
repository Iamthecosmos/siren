import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Clock() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Secret access: Triple-click the time display within 2 seconds
  const handleTimeClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 2000) {
      setClickCount((prev) => prev + 1);
      if (clickCount >= 2) {
        navigate("/");
        return;
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);
  };

  const formatTime = (date: Date) => {
    if (is24Hour) {
      return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } else {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    switch (timeOfDay) {
      case "morning":
        return "Good Morning";
      case "afternoon":
        return "Good Afternoon";
      case "evening":
        return "Good Evening";
      default:
        return "Good Night";
    }
  };

  const getBackgroundGradient = () => {
    const timeOfDay = getTimeOfDay();
    switch (timeOfDay) {
      case "morning":
        return "from-orange-100 via-yellow-50 to-blue-100";
      case "afternoon":
        return "from-blue-100 via-sky-50 to-cyan-100";
      case "evening":
        return "from-purple-100 via-pink-50 to-orange-100";
      default:
        return "from-slate-900 via-blue-900 to-purple-900";
    }
  };

  const getTextColor = () => {
    const timeOfDay = getTimeOfDay();
    return timeOfDay === "night" ? "text-white" : "text-slate-800";
  };

  const alarms = [
    { time: "07:00", label: "Wake Up", enabled: true },
    { time: "12:30", label: "Lunch", enabled: false },
    { time: "18:00", label: "Dinner", enabled: true },
  ];

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Main Clock Display */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="space-y-2">
              <div
                className={`text-5xl md:text-6xl font-mono font-bold ${getTextColor()} cursor-pointer select-none`}
                onClick={handleTimeClick}
              >
                {formatTime(currentTime)}
              </div>
              <div className={`text-lg ${getTextColor()}/80`}>
                {formatDate(currentTime)}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {timezone}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIs24Hour(!is24Hour)}
                className="text-xs"
              >
                {is24Hour ? "12H" : "24H"}
              </Button>
            </div>

            <div className={`text-xl ${getTextColor()}/90 font-medium`}>
              {getGreeting()}
            </div>
          </CardContent>
        </Card>

        {/* Weather Widget */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold text-slate-800">
                  72°F
                </div>
                <div className="text-sm text-slate-600">Partly Cloudy</div>
              </div>
              <div className="text-4xl">⛅</div>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              New York, NY • H: 75° L: 65°
            </div>
          </CardContent>
        </Card>

        {/* Alarms */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Alarms
            </h3>
            <div className="space-y-2">
              {alarms.map((alarm, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-mono text-slate-800">
                      {alarm.time}
                    </div>
                    <div className="text-sm text-slate-600">{alarm.label}</div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full ${
                      alarm.enabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="bg-white/80 backdrop-blur-sm h-12"
          >
            ⏰ Timer
          </Button>
          <Button
            variant="outline"
            className="bg-white/80 backdrop-blur-sm h-12"
          >
            ⏱️ Stopwatch
          </Button>
          <Button
            variant="outline"
            className="bg-white/80 backdrop-blur-sm h-12"
          >
            🌍 World
          </Button>
        </div>

        {/* Secret hint */}
        <div className="text-center">
          <p className="text-xs text-white/60">
            ClockApp Pro v3.2 • Tap time 3x quickly
          </p>
        </div>
      </div>
    </div>
  );
}
