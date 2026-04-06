import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getCurrentUser } from '../lib/auth';
import { User, Settings as SettingsIcon, Database, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { getExpenses, getCategories } from '../lib/storage';

export function Settings() {
  const user = getCurrentUser();
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Update user profile logic would go here
    toast.success('Profile updated successfully');
  };

  const handleExportData = () => {
    if (!user) return;

    const data = {
      expenses: getExpenses(user.id),
      categories: getCategories(),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Data exported successfully');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      localStorage.clear();
      toast.success('All data cleared');
      window.location.reload();
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">Email cannot be changed</p>
              </div>
              <Button type="submit">
                <SettingsIcon className="size-4 mr-2" />
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5" />
              Data Management
            </CardTitle>
            <CardDescription>Export or clear your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Export Data</h3>
              <p className="text-sm text-gray-500 mb-4">
                Download all your expenses and categories as a JSON file
              </p>
              <Button onClick={handleExportData} variant="outline">
                <Download className="size-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2 text-red-600">Danger Zone</h3>
              <p className="text-sm text-gray-500 mb-4">
                Permanently delete all your data. This action cannot be undone.
              </p>
              <Button onClick={handleClearData} variant="destructive">
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Storage</span>
              <span>Local Storage</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Updated</span>
              <span>April 2026</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
