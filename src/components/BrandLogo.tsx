import React from 'react';
import { Link } from 'react-router-dom';
import { Croissant } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = "" }) => {
  return (
    <Link 
      to="/" 
      className={`flex items-center gap-4 transition-all hover:opacity-90 ${className}`}
    >
      <div className="flex items-center justify-center bg-gradient-to-br from-primary/90 to-primary p-4 rounded-full">
        <Croissant className="h-10 w-10 text-primary-foreground" />
      </div>
      <div className="font-serif font-medium whitespace-nowrap">
        <span className="text-3xl md:text-4xl tracking-tight">
          <span className="text-primary">Baked</span>
          <span className="text-[#9b87f5] ml-2">Goods</span>
        </span>
      </div>
    </Link>
  );
};

export default BrandLogo;
