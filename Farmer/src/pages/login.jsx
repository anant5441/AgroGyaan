import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Phone, Lock, User, Leaf } from 'lucide-react';
import agricultureImage from '@/assets/agri-login-illustration.jpg';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [userRole, setUserRole] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Implement actual login logic
    console.log('Login attempt:', { ...formData, role: userRole, method: loginMethod });
    navigate('/');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-6 animate-fade-in">
          <div className="relative">
            <img 
              src={agricultureImage} 
              alt="Agricultural illustration"
              className="w-full max-w-md rounded-3xl shadow-card hover:shadow-glow transition-all duration-500 hover-scale"
            />
            <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-3xl"></div>
          </div>
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              AGROGYAAN
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Connecting farmers and buyers through technology for a sustainable future
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto animate-fade-in">
          <Card className="p-8 shadow-card bg-card/95 backdrop-blur-sm border-border/50 hover:shadow-glow transition-all duration-300">
            
            {/* Mobile Header for small screens */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                <Leaf className="h-6 w-6 text-primary" />
                AGROGYAAN
              </h1>
              <p className="text-muted-foreground mt-2">Welcome back!</p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
                <p className="text-muted-foreground mt-2">Sign in to your account</p>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Select Your Role</Label>
                <RadioGroup value={userRole} onValueChange={setUserRole} className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer" className="cursor-pointer">Buyer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="seller" id="seller" />
                    <Label htmlFor="seller" className="cursor-pointer">Seller</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="cursor-pointer">Admin</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Login Method Toggle */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Login Method</Label>
                <div className="flex rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      loginMethod === 'email' 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('mobile')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      loginMethod === 'mobile' 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    Mobile
                  </button>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email/Mobile Input */}
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-sm font-medium text-foreground">
                    {loginMethod === 'email' ? 'Email Address' : 'Mobile Number'}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {loginMethod === 'email' ? (
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <Input
                      id="identifier"
                      type={loginMethod === 'email' ? 'email' : 'tel'}
                      placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your mobile number'}
                      value={formData.identifier}
                      onChange={(e) => handleInputChange('identifier', e.target.value)}
                      className="pl-10 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary-light transition-colors duration-200 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium py-3 text-base rounded-lg shadow-lg hover:shadow-glow transition-all duration-300 hover-scale"
                  disabled={!userRole || !formData.identifier || !formData.password}
                >
                  Sign In
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button className="text-primary hover:text-primary-light font-medium transition-colors duration-200">
                    Sign up here
                  </button>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;