import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Shield, Phone, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phoneNumber: '',
    otp: '',
  });
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    if (step === 'details') {
      return formData.fullName && formData.username && formData.phoneNumber;
    }
    return formData.otp && formData.otp.length === 6;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // In a real app, this would call an API to send OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'OTP Sent!',
        description: `We've sent a verification code to ${formData.phoneNumber}`,
      });
      
      setStep('otp');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    }

    setIsLoading(false);
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await register({
      fullName: formData.fullName,
      username: formData.username,
      phoneNumber: formData.phoneNumber,
      otp: formData.otp,
    });

    if (result.success) {
      toast({
        title: 'Welcome to Siren!',
        description: 'Your account has been created successfully.',
      });
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
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
            <CardTitle className="flex items-center gap-2">
              {step === 'details' ? <User className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              {step === 'details' ? 'Account Details' : 'Verify Phone Number'}
            </CardTitle>
            <CardDescription>
              {step === 'details'
                ? 'Fill in your details to create your Siren account'
                : `Enter the 6-digit code sent to ${formData.phoneNumber}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 'details' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
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
                    onChange={handleInputChange('username')}
                    placeholder="johndoe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange('phoneNumber')}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send you a verification code via SMS
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !isFormValid()}
                >
                  {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={formData.otp}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      otp: e.target.value.replace(/\D/g, '').slice(0, 6) 
                    }))}
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
                      setStep('details');
                      setFormData(prev => ({ ...prev, otp: '' }));
                      setError('');
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isLoading || !isFormValid()}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
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
                Already have an account?{' '}
                <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
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
            <span className="bg-white px-2 py-1 rounded-full text-xs">Report safety incidents</span>
            <span className="bg-white px-2 py-1 rounded-full text-xs">Contribute voice recordings</span>
            <span className="bg-white px-2 py-1 rounded-full text-xs">Help keep communities safe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
