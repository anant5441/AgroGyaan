import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Phone, Lock, User, Leaf, Loader2, X } from 'lucide-react';
import agricultureImage from '@/assets/agri-login-illustration.jpg';

// Custom Toast Component with better styling
const Toast = ({ message, description, variant = "default", onClose }) => {
  const bgColor = variant === "destructive" 
    ? "bg-red-50 border-red-200" 
    : "bg-green-50 border-green-200";
  const textColor = variant === "destructive" 
    ? "text-red-800" 
    : "text-green-800";
  const iconColor = variant === "destructive" 
    ? "text-red-400" 
    : "text-green-400";
  
  const Icon = variant === "destructive" ? X : Leaf;
  
  return (
    <div className={`fixed top-6 right-6 z-50 border rounded-lg p-4 shadow-lg max-w-sm ${bgColor} animate-in slide-in-from-right-full duration-300 flex items-start gap-3`}>
      <div className={`mt-0.5 ${iconColor}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <h4 className={`font-medium ${textColor}`}>{message}</h4>
        {description && (
          <p className={`mt-1 text-sm ${textColor} opacity-90`}>{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Custom useToast hook
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (options) => {
    const id = Date.now().toString();
    const newToast = { id, ...options };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toast: showToast,
    ToastComponent: (
      <>
        {toasts.map((toast) => (
          <Toast 
            key={toast.id}
            message={toast.title} 
            description={toast.description} 
            variant={toast.variant} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </>
    )
  };
};

const Login = () => {
  const navigate = useNavigate();
  const { toast, ToastComponent } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [userRole, setUserRole] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const handleLogin = async (e) => {
  e.preventDefault();
  
  if (!userRole) {
    toast({
      title: "Role required",
      description: "Please select your role to continue",
      variant: "destructive"
    });
    return;
  }

  setIsLoading(true);

  try {
    // Make actual API call to your backend
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: formData.identifier,
        password: formData.password,
        role: userRole
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Check for specific error codes from the backend
      if (response.status === 400) {
        if (data.code === 'USER_NOT_FOUND') {
          throw new Error("USER_NOT_FOUND");
        } else if (data.code === 'ROLE_MISMATCH') {
          throw new Error("ROLE_MISMATCH");
        } else if (data.code === 'INVALID_CREDENTIALS') {
          throw new Error("WRONG_CREDENTIALS");
        }
      }
      throw new Error(data.msg || data.error || `Login failed (Status: ${response.status})`);
    }

    // Save token and user data from actual response
    const { token, user } = data;
    localStorage.setItem('token', token);
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('user', JSON.stringify(user));
    }

    // Show success toast
    toast({
      title: "Login successful",
      description: `Welcome back, ${user.name}! Redirecting...`,
    });

    // Wait a moment for the user to see the success message
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Redirect based on role
    switch (userRole) {
      case 'farmer':
        window.location.href = 'http://localhost:5173/';
        break;
      case 'buyer':
        window.location.href = 'http://localhost:5174/';
        break;
      case 'supplier':
        window.location.href = 'http://localhost:5175/';
        break;
      default:
        window.location.href = '/';
    }

  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = error.message;
    let variant = "destructive";
    
    // Provide more specific error messages
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Cannot connect to the server. Please make sure the backend is running on http://localhost:5000';
    } else if (error.message.includes('NetworkError')) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message === 'WRONG_CREDENTIALS') {
      errorMessage = 'Wrong credentials. Please check your email/phone and password.';
    } else if (error.message === 'ROLE_MISMATCH') {
      errorMessage = 'Role mismatch. This account has a different role. Please select the correct role.';
    } else if (error.message === 'USER_NOT_FOUND') {
      errorMessage = 'User not found. Please check your email/phone or sign up for a new account.';
    }
    
    toast({
      title: "Login failed",
      description: errorMessage,
      variant
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center p-4">
      {ToastComponent}
      
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <img 
              src={agricultureImage} 
              alt="Agricultural illustration"
              className="w-full max-w-md rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-amber-400/10 rounded-3xl"></div>
          </div>
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              AGROGYAAN
            </h1>
            <p className="text-xl text-gray-600 max-w-md">
              Connecting farmers and buyers through technology for a sustainable future
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="p-8 shadow-lg bg-white/95 backdrop-blur-sm border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            
            {/* Mobile Header for small screens */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                AGROGYAAN
              </h1>
              <p className="text-gray-600 mt-2">Welcome back!</p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-600 mt-2">Sign in to your account</p>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Select Your Role</Label>
                <RadioGroup value={userRole} onValueChange={setUserRole} className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer" className="cursor-pointer text-gray-700">Buyer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="farmer" id="farmer" />
                    <Label htmlFor="farmer" className="cursor-pointer text-gray-700">Farmer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="supplier" id="supplier" />
                    <Label htmlFor="supplier" className="cursor-pointer text-gray-700">Supplier</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Login Method Toggle */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Login Method</Label>
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      loginMethod === 'email' 
                        ? 'bg-green-600 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
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
                        ? 'bg-green-600 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
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
                  <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                    {loginMethod === 'email' ? 'Email Address' : 'Mobile Number'}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {loginMethod === 'email' ? (
                        <Mail className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Phone className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <Input
                      id="identifier"
                      type={loginMethod === 'email' ? 'email' : 'tel'}
                      placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your mobile number'}
                      value={formData.identifier}
                      onChange={(e) => handleInputChange('identifier', e.target.value)}
                      className="pl-10 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-green-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-green-400"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-green-600 hover:text-green-700 transition-colors duration-200 font-medium"
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  disabled={!userRole || !formData.identifier || !formData.password || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                    disabled={isLoading}
                  >
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