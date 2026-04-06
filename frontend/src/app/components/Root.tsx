import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { getCurrentUser } from '../lib/auth';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';

export function Root() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    // Check backend connection
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          toast.success(data.message);
        }
      })
      .catch(err => {
        console.error('Backend connection error:', err);
        toast.error('Backend is unreachable');
      });

    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login', { replace: true });
    } else {
      setUser(currentUser);
      setIsChecking(false);
    }
  }, []);

  if (isChecking || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}