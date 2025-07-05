import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { 
  Home,
  Gavel,
  Package,
  Users,
  Settings,
  Lock,
  User,
  Save,
  BarChart3
} from 'lucide-react';

const adminSidebarItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/admin/auctions', label: 'Manage Auctions', icon: <Gavel className="h-5 w-5" /> },
  { path: '/admin/products', label: 'Manage Products', icon: <Package className="h-5 w-5" /> },
  
  { path: '/admin/reports', label: 'Reports', icon: <BarChart3 className="h-5 w-5" /> },
  { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

export const AdminSettings: React.FC = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    mobile_number: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { admin } = useAuth();
  const { showSuccess, showError } = useToast();

  React.useEffect(() => {
    if (admin) {
      setProfileData({
        name: admin.name || '',
        username: admin.username || '',
        mobile_number: admin.mobile_number || ''
      });
    }
  }, [admin]);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      // Mock implementation - in real app, this would call API
      showSuccess('Profile updated successfully!');
    } catch (error: any) {
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await authService.adminChangePassword({
        username: admin?.username || '',
        password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        role: 'admin'
      });
      
      showSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Settings" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Admin Settings</h2>
              <p className="text-slate-600">Manage your account settings and preferences</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900">Profile Information</h3>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Enter your full name"
              />
              
              <Input
                label="Username"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                placeholder="Enter your username"
                disabled
              />
              
              <Input
                label="Mobile Number"
                value={profileData.mobile_number}
                onChange={(e) => setProfileData({ ...profileData, mobile_number: e.target.value })}
                placeholder="Enter your mobile number"
              />
              
              <Button
                onClick={handleProfileUpdate}
                loading={loading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </div>
          </Card>

          {/* Password Settings */}
          <Card>
            <div className="flex items-center mb-6">
              <Lock className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
              
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
              
              <Button
                onClick={handlePasswordChange}
                loading={loading}
                variant="danger"
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </Card>
        </div>

        {/* System Settings */}
        <Card>
          <div className="flex items-center mb-6">
            <Settings className="h-6 w-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-slate-900">System Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Auction Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">Default Auction Duration</span>
                  <span className="text-sm font-medium text-slate-900">7 days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">Minimum Bid Increment</span>
                  <span className="text-sm font-medium text-slate-900">₹10</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">Auto Settlement</span>
                  <span className="text-sm font-medium text-slate-900">Enabled</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Notification Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">Email Notifications</span>
                  <span className="text-sm font-medium text-slate-900">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">Bid Alerts</span>
                  <span className="text-sm font-medium text-slate-900">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">Auction End Alerts</span>
                  <span className="text-sm font-medium text-slate-900">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};