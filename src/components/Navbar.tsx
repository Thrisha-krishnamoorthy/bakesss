import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import BrandLogo from './BrandLogo';
import AuthButton from './AuthButton';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const location = useLocation();

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="w-full mx-auto px-6 sm:px-8 lg:px-12">
        <div className="content-container">
          <div className="flex justify-between items-center py-8 md:py-10">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <BrandLogo className="h-12 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-2xl font-medium transition-colors hover:text-primary ${
                    location.pathname === link.path 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Cart and mobile menu buttons */}
            <div className="flex items-center space-x-8">
              <AuthButton />
              
              <Link to="/cart" className="relative">
                <div className="flex items-center justify-center bg-white p-4 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105">
                  <ShoppingBag className="h-9 w-9 text-[#9b87f5]" />
                </div>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#9b87f5] text-white rounded-full h-8 w-8 flex items-center justify-center text-lg font-medium animate-scale-in">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-4 rounded-full hover:bg-accent transition-colors md:hidden"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-9 w-9" />
                ) : (
                  <Menu className="h-9 w-9" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden z-50 shadow-xl`}
      >
        <div className="px-8 py-8 space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block py-4 text-3xl font-medium ${
                location.pathname === link.path 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
