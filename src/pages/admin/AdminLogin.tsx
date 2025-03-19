
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple authentication (in a real app, this would be server-side)
    if (username === 'admin' && password === 'password') {
      // Set a flag in localStorage to indicate the user is logged in
      localStorage.setItem('adminIsLoggedIn', 'true');
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">Admin Login</h1>
          <p className="text-muted-foreground mt-2">Sign in to access the admin panel</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all hover:bg-primary/90"
          >
            Login
          </button>
          
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Demo credentials: admin / password</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
