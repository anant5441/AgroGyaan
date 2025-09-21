import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Phone, Lock, User, Leaf, Loader2, X, ArrowLeft } from 'lucide-react';
import agricultureImage from '@/assets/agri-login-illustration.jpg';

// Custom Toast Component with better styling
const Toast = ({ message, description, variant = "default", onClose }) => {
  const bgColor = variant === "destructive" 
    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
    : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
  const textColor = variant === "destructive" 
    ? "text-red-800 dark:text-red-200" 
    : "text-green-800 dark:text-green-200";
  const iconColor = variant === "destructive" 
    ? "text-red-400 dark:text-red-300" 
    : "text-green-400 dark:text-green-300";
  
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
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast, ToastComponent } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [userRole, setUserRole] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: ''
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
          identifier: loginData.identifier,
          password: loginData.password,
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

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    if (!signupData.role) {
      toast({
        title: "Role required",
        description: "Please select your role to continue",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Make API call to register endpoint
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          password: signupData.password,
          role: signupData.role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || `Registration failed (Status: ${response.status})`);
      }

      // Show success toast
      toast({
        title: "Registration successful",
        description: "Your account has been created. Logging you in...",
      });

      // Auto-login after successful registration
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: signupData.email,
          password: signupData.password,
          role: signupData.role
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.msg || loginData.error || `Auto-login failed (Status: ${loginResponse.status})`);
      }

      // Save token and user data from actual response
      const { token, user } = loginData;
      localStorage.setItem('token', token);
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      // Wait a moment for the user to see the success message
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect based on role
      switch (signupData.role) {
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
      console.error('Signup error:', error);
      
      let errorMessage = error.message;
      let variant = "destructive";
      
      // Provide more specific error messages
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server. Please make sure the backend is running on http://localhost:5000';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('User already exists')) {
        errorMessage = 'An account with this email or phone already exists. Please try logging in instead.';
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginInputChange = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignupInputChange = (field, value) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setUserRole('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-900 dark:to-brown  -800 flex items-center justify-center p-4">
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
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-amber-400/10 dark:from-green-600/10 dark:to-amber-600/10 rounded-3xl"></div>
          </div>
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
              <Leaf className="h-8 w-8 text-green-600 dark:text-green-500" />
              AGROGYAAN
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md">
              Connecting farmers and buyers through technology for a sustainable future
            </p>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="p-8 shadow-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
            
            {/* Mobile Header for small screens */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
                <Leaf className="h-6 w-6 text-green-600 dark:text-green-500" />
                AGROGYAAN
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {isLogin ? 'Welcome back!' : 'Create an account'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {isLogin ? 'Sign in to your account' : 'Join our agricultural community'}
                </p>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Your Role</Label>
                <RadioGroup 
                  value={isLogin ? userRole : signupData.role} 
                  onValueChange={isLogin ? setUserRole : (value) => handleSignupInputChange('role', value)} 
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="buyer" className="text-green-600 dark:text-green-500" />
                    <Label htmlFor="buyer" className="cursor-pointer text-gray-700 dark:text-gray-300">Buyer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="farmer" id="farmer" className="text-green-600 dark:text-green-500" />
                    <Label htmlFor="farmer" className="cursor-pointer text-gray-700 dark:text-gray-300">Farmer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="supplier" id="supplier" className="text-green-600 dark:text-green-500" />
                    <Label htmlFor="supplier" className="cursor-pointer text-gray-700 dark:text-gray-300">Supplier</Label>
                  </div>
                </RadioGroup>
              </div>

              {isLogin ? (
                // LOGIN FORM
                <>
                  {/* Login Method Toggle */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Login Method</Label>
                    <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                      <button
                        type="button"
                        onClick={() => setLoginMethod('email')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                          loginMethod === 'email' 
                            ? 'bg-green-600 text-white shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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
                      <Label htmlFor="identifier" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {loginMethod === 'email' ? 'Email Address' : 'Mobile Number'}
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {loginMethod === 'email' ? (
                            <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          ) : (
                            <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <Input
                          id="identifier"
                          type={loginMethod === 'email' ? 'email' : 'tel'}
                          placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your mobile number'}
                          value={loginData.identifier}
                          onChange={(e) => handleLoginInputChange('identifier', e.target.value)}
                          className="pl-10 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 transition-all duration-200 hover:border-green-400 dark:hover:border-green-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => handleLoginInputChange('password', e.target.value)}
                          className="pl-10 pr-10 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 transition-all duration-200 hover:border-green-400 dark:hover:border-green-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
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
                          className="data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500"
                          disabled={isLoading}
                        />
                        <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 transition-colors duration-200 font-medium"
                        disabled={isLoading}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* Login Button */}
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      disabled={!userRole || !loginData.identifier || !loginData.password || isLoading}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account?{' '}
                      <button 
                        onClick={toggleAuthMode}
                        className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors duration-200"
                        disabled={isLoading}
                      >
                        Sign up here
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                // SIGNUP FORM
                <>
                  <button
                    onClick={toggleAuthMode}
                    className="flex items-center text-sm text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 transition-colors duration-200 font-medium"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to login
                  </button>

                  <form onSubmit={handleSignup} className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={signupData.name}
                          onChange={(e) => handleSignupInputChange('name', e.target.value)}
                          className="pl-10 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 transition-all duration-200 hover:border-green-400 dark:hover:border-green-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupData.email}
                          onChange={(e) => handleSignupInputChange('email', e.target.value)}
                          className="pl-10 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 transition-all duration-200 hover:border-green-400 dark:hover:border-green-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                          // required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={signupData.phone}
                          onChange={(e) => handleSignupInputChange('phone', e.target.value)}
                          className="pl-10 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 transition-all duration-200 hover:border-green-400 dark:hover:border-green-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={signupData.password}
                          onChange={(e) => handleSignupInputChange('password', e.target.value)}
                          className="pl-10 pr-10 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 transition-all duration-200 hover:border-green-400 dark:hover:border-green-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={signupData.confirmPassword}
                          onChange={(e) => handleSignupInputChange('confirmPassword', e.target.value)}
                          className="pl-10 pr-10 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 transition-all duration-200 hover:border-green-400 dark:hover:border-green-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember-signup" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                          className="data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500"
                          disabled={isLoading}
                        />
                        <Label htmlFor="remember-signup" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                    </div>

                    {/* Sign Up Button */}
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      disabled={!signupData.role || !signupData.name || !signupData.phone || !signupData.password || !signupData.confirmPassword || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Already have an account?{' '}
                      <button 
                        onClick={toggleAuthMode}
                        className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors duration-200"
                        disabled={isLoading}
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;