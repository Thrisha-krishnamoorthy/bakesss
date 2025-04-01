import { Link } from 'react-router-dom';
import { LogIn, LogOut, UserCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AuthButton = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Link to="/login">
        <Button variant="outline" size="lg" className="gap-3 text-xl py-6 px-8">
          <LogIn className="h-6 w-6" />
          <span className="hidden md:inline">Login</span>
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="gap-3 text-xl py-6 px-8">
          <UserCircle className="h-6 w-6" />
          <span className="hidden md:inline">{user?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xl py-3">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="text-lg py-3 cursor-pointer">
          <Link to="/orders" className="cursor-pointer w-full">
            My Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-lg py-3 cursor-pointer">
          {/* <Link to="/profile" className="cursor-pointer w-full">
            Profile
          </Link> */}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-destructive focus:text-destructive text-lg py-3"
        >
          <LogOut className="h-6 w-6 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthButton;
