import { Mail, Phone, Instagram, Facebook, Twitter, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useAuth();
  
  return (
    <footer className="bg-secondary pt-16 pb-8 mt-16 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <h3 className="font-serif text-3xl mb-6 whitespace-nowrap">Baked Goods</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Handcrafted baked goods made with the finest ingredients and attention to detail.
            </p>
            <div className="flex space-x-6">
              <a href="https://instagram.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram size={28} />
              </a>
              <a href="https://facebook.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook size={28} />
              </a>
              <a href="https://twitter.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter size={28} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-2xl mb-6">Shop</h4>
            <ul className="space-y-4 text-lg">
              <li>
                <Link to="/shop?category=Artisan Breads" className="text-muted-foreground hover:text-primary transition-colors">
                  Artisan Breads
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Pastries" className="text-muted-foreground hover:text-primary transition-colors">
                  Pastries
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Cookies & Treats" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookies & Treats
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-2xl mb-6">Information</h4>
            <ul className="space-y-4 text-lg">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              {!isAuthenticated && (
                <li>
                  <Link to="/register" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                    <UserPlus size={14} className="mr-1" /> Register
                  </Link>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-2xl mb-6">Contact Us</h4>
            <ul className="space-y-6 text-lg">
              <li className="flex items-start">
                <Mail size={16} className="mr-2 mt-0.5 text-muted-foreground" />
                <a href="mailto:hello@bakedbliss.com" className="text-muted-foreground hover:text-primary transition-colors">
                  hello@bakedbliss.com
                </a>
              </li>
              <li className="flex items-start">
                <Phone size={16} className="mr-2 mt-0.5 text-muted-foreground" />
                <a href="tel:+1234567890" className="text-muted-foreground hover:text-primary transition-colors">
                  (123) 456-7890
                </a>
              </li>
              <li className="mt-6 text-muted-foreground">
                <p>123 Bakery Street</p>
                <p>San Francisco, CA 94110</p>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-12 text-center text-lg text-muted-foreground">
          <p>&copy; {currentYear} Baked Goods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
