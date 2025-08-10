import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Shield, Phone, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate phone number format
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      setIsLoading(false);
      return;
    }

    try {
      // In a real app, this would call an API to send OTP
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "OTP Sent!",
        description: `We've sent a verification code to ${phoneNumber}`,
      });

      setStep('otp');
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
    }

    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setIsLoading(false);
      return;
    }

    const result = await login(phoneNumber, otp);

    if (result.success) {
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      navigate(from, { replace: true });
    } else {
      setError(result.error || "Invalid OTP. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-red-600 hover:text-red-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <div className="bg-red-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Siren account</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 'phone' ? <Phone className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              {step === 'phone' ? 'Enter Phone Number' : 'Verify OTP'}
            </CardTitle>
            <CardDescription>
              {step === 'phone'
                ? 'Enter your phone number to receive a verification code'
                : `Enter the 6-digit code sent to ${phoneNumber}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send you a verification code via SMS
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="text-center text-lg tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                      setError('');
                    }}
                    className="flex-1"
                  >
                    Change Number
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="link"
                  onClick={handleSendOTP}
                  className="w-full text-sm"
                  disabled={isLoading}
                >
                  Didn't receive code? Resend
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="text-center text-sm text-gray-600">
          <p>Join the community to:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="bg-white px-2 py-1 rounded-full text-xs">
              Report incidents
            </span>
            <span className="bg-white px-2 py-1 rounded-full text-xs">
              Share voices
            </span>
            <span className="bg-white px-2 py-1 rounded-full text-xs">
              Stay safe together
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
