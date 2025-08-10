import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Eye, EyeOff, ArrowLeft, Shield, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      letter: /[a-zA-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (field === "password") {
        checkPasswordStrength(value);
      }
    };

  const isFormValid = () => {
    return (
      formData.fullName &&
      formData.username &&
      formData.email &&
      formData.password &&
      formData.password === formData.confirmPassword &&
      Object.values(passwordStrength).every(Boolean)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Please check all fields and requirements");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await register({
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      toast({
        title: "Welcome to Siren!",
        description: "Your account has been created successfully.",
      });
      navigate("/");
    } else {
      setError(result.error || "Registration failed");
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
          <h1 className="text-2xl font-bold text-gray-900">Join Siren</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Fill in your details to create your Siren account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange("fullName")}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange("username")}
                  placeholder="johndoe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    placeholder="Create a strong password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Password Requirements */}
                <div className="text-xs space-y-1 mt-2">
                  <div
                    className={`flex items-center gap-2 ${passwordStrength.length ? "text-green-600" : "text-gray-500"}`}
                  >
                    <Check
                      className={`h-3 w-3 ${passwordStrength.length ? "opacity-100" : "opacity-30"}`}
                    />
                    At least 8 characters
                  </div>
                  <div
                    className={`flex items-center gap-2 ${passwordStrength.letter ? "text-green-600" : "text-gray-500"}`}
                  >
                    <Check
                      className={`h-3 w-3 ${passwordStrength.letter ? "opacity-100" : "opacity-30"}`}
                    />
                    Contains letters
                  </div>
                  <div
                    className={`flex items-center gap-2 ${passwordStrength.number ? "text-green-600" : "text-gray-500"}`}
                  >
                    <Check
                      className={`h-3 w-3 ${passwordStrength.number ? "opacity-100" : "opacity-30"}`}
                    />
                    Contains numbers
                  </div>
                  <div
                    className={`flex items-center gap-2 ${passwordStrength.special ? "text-green-600" : "text-gray-500"}`}
                  >
                    <Check
                      className={`h-3 w-3 ${passwordStrength.special ? "opacity-100" : "opacity-30"}`}
                    />
                    Contains special characters
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    placeholder="Confirm your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="text-center text-sm text-gray-600">
          <p>By joining Siren, you can:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="bg-white px-2 py-1 rounded-full text-xs">
              Report safety incidents
            </span>
            <span className="bg-white px-2 py-1 rounded-full text-xs">
              Contribute voice recordings
            </span>
            <span className="bg-white px-2 py-1 rounded-full text-xs">
              Help keep communities safe
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
