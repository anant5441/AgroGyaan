import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Mail, Phone, Lock, Save, Edit3, ArrowLeft, Eye, EyeOff } from 'lucide-react';
// import { useToast } from '@/components/ui/use-toast';

const Profile = () => {
  const navigate = useNavigate();
//   const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    language_pref: 'en',
    trust_score: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    language_pref: 'en'
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/login');
      return;
    }
    
    const userObj = JSON.parse(user);
    setUserData(userObj);
    setFormData({
      name: userObj.name,
      email: userObj.email,
      phone: userObj.phone,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      language_pref: userObj.language_pref || 'en'
    });
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
      
      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        language_pref: formData.language_pref
      };
      
      // Only include password fields if they are filled
      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("New passwords don't match");
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch(`http://localhost:5000/api/auth/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Update failed');
      }

      // Update local storage with new user data
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        language_pref: formData.language_pref
      };
      
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      setUserData(updatedUser);
      setIsEditing(false);
      
    //   toast({
    //     title: "Profile updated",
    //     description: "Your profile has been updated successfully",
    //   });
      
    } catch (error) {
      console.error('Update error:', error);
    //   toast({
    //     title: "Update failed",
    //     description: error.message,
    //     variant: "destructive"
    //   });
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "mr", name: "मराठी" },
    { code: "gu", name: "ગુજરાતી" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="p-8 shadow-lg bg-white/95 backdrop-blur-sm border border-gray-200/50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{userData.name}</h1>
                <p className="text-gray-600 capitalize">{userData.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${userData.trust_score || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">Trust Score: {userData.trust_score || 0}%</span>
                </div>
              </div>
            </div>
            
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
          </div>

          {!isEditing ? (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                <p className="text-gray-800">{userData.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                <p className="text-gray-800">{userData.email}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                <p className="text-gray-800">{userData.phone}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Role</Label>
                <p className="text-gray-800 capitalize">{userData.role}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Language Preference</Label>
                <p className="text-gray-800">
                  {languages.find(lang => lang.code === userData.language_pref)?.name || 'English'}
                </p>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                    Language Preference
                  </Label>
                  <select
                    id="language"
                    value={formData.language_pref}
                    onChange={(e) => handleInputChange('language_pref', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                      Current Password
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        className="pl-10 pr-10"
                        placeholder="Leave blank to keep current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;