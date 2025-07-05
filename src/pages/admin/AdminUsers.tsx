import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { 
  Home,
  Gavel,
  Package,
  Users,
  Settings,
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  BarChart3
} from 'lucide-react';

const adminSidebarItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/admin/auctions', label: 'Manage Auctions', icon: <Gavel className="h-5 w-5" /> },
  { path: '/admin/products', label: 'Manage Products', icon: <Package className="h-5 w-5" /> },
 
  { path: '/admin/reports', label: 'Reports', icon: <BarChart3 className="h-5 w-5" /> },
  { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

// Mock user data - in real app, this would come from API
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    mobile_number: '9876543210',
    wallet_balance: 5000,
    auctions: ['auction1', 'auction2'],
    status: 'active',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'janesmith',
    mobile_number: '9876543211',
    wallet_balance: 3500,
    auctions: ['auction1'],
    status: 'active',
    created_at: '2024-01-20T14:20:00Z'
  },
  {
    id: '3',
    name: 'Bob Wilson',
    username: 'bobwilson',
    mobile_number: '9876543212',
    wallet_balance: 1200,
    auctions: [],
    status: 'inactive',
    created_at: '2024-02-01T09:15:00Z'
  }
];

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleUserAction = (userId: string, action: string) => {
    // Mock implementation - in real app, this would call API
    const user = users.find(u => u.id === userId);
    if (user) {
      if (action === 'activate') {
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
        showSuccess(`User ${user.name} activated successfully`);
      } else if (action === 'deactivate') {
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'inactive' } : u));
        showSuccess(`User ${user.name} deactivated successfully`);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile_number.includes(searchTerm)
  );

  const userColumns = [
    {
      key: 'name',
      label: 'User Details',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">@{row.username}</div>
        </div>
      )
    },
    {
      key: 'mobile_number',
      label: 'Contact',
      render: (value: string) => (
        <div className="flex items-center text-sm text-slate-600">
          <Phone className="h-4 w-4 mr-1" />
          {value}
        </div>
      )
    },
    {
      key: 'wallet_balance',
      label: 'Wallet Balance',
      render: (value: number) => (
        <span className="font-semibold text-green-600">₹{value.toLocaleString()}</span>
      )
    },
    {
      key: 'auctions',
      label: 'Auctions',
      render: (value: string[]) => (
        <span className="text-sm text-slate-600">{value.length} registered</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value === 'active' ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (value: string) => (
        <span className="text-sm text-slate-600">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          {row.status === 'active' ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleUserAction(row.id, 'deactivate')}
            >
              <UserX className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleUserAction(row.id, 'activate')}
            >
              <UserCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalWalletBalance = users.reduce((sum, u) => sum + u.wallet_balance, 0);

  return (
    <Layout title="User Management" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
              <p className="text-slate-600">Monitor and manage user accounts</p>
            </div>
          </div>
        </Card>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Total Users</h3>
            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
          </Card>
          
          <Card className="text-center">
            <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Active Users</h3>
            <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
          </Card>
          
          <Card className="text-center">
            <UserX className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Inactive Users</h3>
            <p className="text-2xl font-bold text-red-600">{users.length - activeUsers}</p>
          </Card>
          
          <Card className="text-center">
            <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Total Wallet Value</h3>
            <p className="text-2xl font-bold text-purple-600">₹{totalWalletBalance.toLocaleString()}</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search users by name, username, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Registered Users</h3>
            <Button variant="secondary">
              Export Users
            </Button>
          </div>
          
          <Table
            columns={userColumns}
            data={filteredUsers}
            emptyMessage="No users found matching your search criteria"
          />
        </Card>
      </div>
    </Layout>
  );
};