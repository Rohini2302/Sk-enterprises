import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Building2, Save, Eye, EyeOff, Camera } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRole } from "@/context/RoleContext";
import { db } from "@/firebase";
import { ref, get, update } from "firebase/database";

const Profile = () => {
  const { user } = useRole();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    site: "",
    joinDate: "",
    status: ""
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Helper function to sanitize email for Firebase path
  const sanitizeEmail = (email: string) => email.replace(/[@.]/g, '_');

  // Fetch admin profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);

        // Get current user data to find creator
        const userEmailPath = sanitizeEmail(user.email);
        const userRef = ref(db, `users/${userEmailPath}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();

          // If user has managedBy field, fetch from creator's collection
          if (userData.managedBy) {
            const creatorEmail = userData.managedBy;
            const adminsRef = ref(db, `users/${creatorEmail}/admins`);
            const adminsSnapshot = await get(adminsRef);

            if (adminsSnapshot.exists()) {
              const adminsData = adminsSnapshot.val();

              // Find the admin record with matching email
              for (const adminId of Object.keys(adminsData)) {
                const adminData = adminsData[adminId];
                if (adminData.email === user.email) {
                  setFormData({
                    name: adminData.name || "",
                    email: adminData.email || "",
                    phone: adminData.phone || "",
                    department: adminData.department || "",
                    role: adminData.role || "",
                    site: adminData.site || "",
                    joinDate: adminData.joinDate || "",
                    status: adminData.status || ""
                  });
                  break;
                }
              }
            }
          } else {
            // For non-managed admins (created via signup), use current user data
            setFormData({
              name: userData.name || "",
              email: userData.email || "",
              phone: userData.phone || "",
              department: userData.department || "",
              role: userData.role || "",
              site: userData.site || "",
              joinDate: userData.createdAt || "",
              status: userData.status || "active"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.email]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    try {
      // Get current user data to find creator
      const userEmailPath = sanitizeEmail(user.email);
      const userRef = ref(db, `users/${userEmailPath}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();

        if (userData.managedBy) {
          // Update in creator's collection
          const creatorEmail = userData.managedBy;
          const adminsRef = ref(db, `users/${creatorEmail}/admins`);
          const adminsSnapshot = await get(adminsRef);

          if (adminsSnapshot.exists()) {
            const adminsData = adminsSnapshot.val();

            // Find and update the admin record
            for (const adminId of Object.keys(adminsData)) {
              const adminData = adminsData[adminId];
              if (adminData.email === user.email) {
                const adminRef = ref(db, `users/${creatorEmail}/admins/${adminId}`);
                await update(adminRef, {
                  name: formData.name,
                  phone: formData.phone,
                  department: formData.department,
                  site: formData.site,
                  updatedAt: new Date().toISOString()
                });

                // Also update the main user record
                await update(userRef, {
                  name: formData.name,
                  phone: formData.phone,
                  department: formData.department,
                  site: formData.site
                });

                toast.success("Profile updated successfully!");
                return;
              }
            }
          }
        } else {
          // For non-managed admins, update main user record
          await update(userRef, {
            name: formData.name,
            phone: formData.phone,
            department: formData.department,
            site: formData.site
          });
          toast.success("Profile updated successfully!");
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords don't match!");
      return;
    }

    if (passwordData.new.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast.success("Password updated successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
    }, 500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      toast.success("Avatar selected! Click 'Change Avatar' to save.");
    }
  };

  const handleSaveAvatar = () => {
    if (!avatarFile) {
      toast.error("Please select an image first");
      return;
    }

    // Simulate avatar upload
    setTimeout(() => {
      toast.success("Avatar updated successfully!");
      // In real app, you would upload the file to your server
      // and update the user's avatar URL
    }, 500);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="My Profile" subtitle="Manage your account settings" />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="My Profile" subtitle="Manage your account settings" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 max-w-4xl mx-auto space-y-6"
      >
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24 mb-4">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Profile avatar" />
                  ) : null}
                  <AvatarFallback className="text-2xl">
                    {formData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 cursor-pointer">
                  <div className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSaveAvatar}
                  disabled={!avatarFile}
                >
                  {avatarFile ? "Save Avatar" : "Change Avatar"}
                </Button>
                {avatarPreview && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                      toast.info("Avatar selection cancelled");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="department" 
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <div className="relative">
                  <Input 
                    id="current" 
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) => handlePasswordChange('current', e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <div className="relative">
                  <Input 
                    id="new" 
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) => handlePasswordChange('new', e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    id="confirm" 
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <p className="font-medium">{formData.role}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Member Since</Label>
                <p className="font-medium">
                  {formData.joinDate ? new Date(formData.joinDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="font-medium">Just now</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Account Status</Label>
                <p className="font-medium text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;