import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, UserPlus } from 'lucide-react';
import { categories } from '../utils/data';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Product } from '../utils/types';
import { fetchProducts } from '../utils/api';

const Index = () => {
  const [isHeroLoaded, setIsHeroLoaded] = useState(false);
  const [heroImageUrl] = useState('https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2980&q=80');
  const [isBakerImageLoaded, setIsBakerImageLoaded] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
  
  // Get random products for featured section (showing 3 products)
  const getRandomProducts = (products: Product[], count: number) => {
    if (products.length <= count) return products;
    
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  // Always ensure we have exactly 3 featured products
  let featuredProducts = getRandomProducts(allProducts, 3);
  
  // If we don't have enough products, create placeholder products to fill the grid
  if (featuredProducts.length < 3) {
    const placeholderProducts: Product[] = [
      {
        id: 'placeholder-1',
        name: 'Chocolate Chip Cookies',
        description: 'Classic chocolate chip cookies made with premium chocolate',
        price: 12.99,
        category: 'Cookies',
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
        featured: true,
        inStock: true,
        quantity: 20
      },
      {
        id: 'placeholder-2',
        name: 'Artisan Sourdough Bread',
        description: 'Traditional sourdough bread with a crispy crust',
        price: 8.99,
        category: 'Breads',
        image: 'https://images.unsplash.com/photo-1585478259715-1c195a3c7fbc',
        featured: true,
        inStock: true,
        quantity: 15
      },
      {
        id: 'placeholder-3',
        name: 'Blueberry Muffins',
        description: 'Fluffy muffins packed with fresh blueberries',
        price: 9.99,
        category: 'Pastries',
        image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa',
        featured: true,
        inStock: true,
        quantity: 25
      }
    ];
    
    // Add only as many placeholder products as needed to reach 3 total
    const neededPlaceholders = 3 - featuredProducts.length;
    featuredProducts = [...featuredProducts, ...placeholderProducts.slice(0, neededPlaceholders)];
  }
  
  useEffect(() => {
    // Preload hero image
    const img = new Image();
    img.src = heroImageUrl;
    img.onload = () => setIsHeroLoaded(true);

    // Preload baker image
    const bakerImg = new Image();
    bakerImg.src = "https://images.unsplash.com/photo-1591247378419-2c8a71f593f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2680&q=80";
    bakerImg.onload = () => setIsBakerImageLoaded(true);
  }, [heroImageUrl]);

  // Get unique categories from actual API products
  const uniqueCategories = [...new Set(allProducts.map(product => product.category))];
  
  // Create category data for display
  const categoryDisplayData = [
    {
      id: 'Artisan Breads',
      name: 'Artisan Breads',
      image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80'
    },
    {
      id: 'Pastries',
      name: 'Pastries',
      image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2796&q=80'
    },
    {
      id: 'Cookies & Treats',
      name: 'Cookies & Treats',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80'
    }
  ];

  // Filter categoryDisplayData to only include categories that exist in our products
  const availableCategories = categoryDisplayData.filter(cat => 
    uniqueCategories.includes(cat.id)
  );

  return (
    <>
      <Navbar />
      <main>
        {/* Hero section */}
        <section 
          className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden w-full"
          aria-label="Hero banner"
        >
          <div 
            className={`absolute inset-0 transition-opacity duration-1000 ${isHeroLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url(${heroImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="relative z-10 text-center px-6 sm:px-8 lg:px-12 max-w-6xl mx-auto">
            <span className="inline-block bg-primary/90 text-primary-foreground text-lg font-medium py-2 px-5 rounded-full mb-8 backdrop-blur-sm animate-fade-in">
              Handcrafted with love
            </span>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-light text-white mb-10 animate-fade-in">
              Artisanal Baked Goods for Every Occasion
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-12 max-w-4xl mx-auto animate-fade-in">
              Delicious, handcrafted breads and pastries made with the finest ingredients and traditional techniques.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-fade-in">
              <Link 
                to="/shop" 
                className="bg-primary text-primary-foreground px-10 py-6 rounded-xl font-medium transition-all hover:bg-primary/90 btn-hover flex items-center text-2xl"
              >
                Shop Now <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="bg-white/20 backdrop-blur-sm text-white px-10 py-6 rounded-xl font-medium transition-all hover:bg-white/30 btn-hover flex items-center text-2xl"
                >
                  Create Account <UserPlus className="ml-3 h-6 w-6" />
                </Link>
              )}
              {isAuthenticated ? (
                <Link
                  to="/about"
                  className="bg-white/20 backdrop-blur-sm text-white px-10 py-6 rounded-xl font-medium transition-all hover:bg-white/30 btn-hover text-2xl"
                >
                  Our Story
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        {/* Featured products section */}
        <section className="page-container py-20">
          <div className="content-container">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-5xl font-serif font-light text-primary">Featured Products</h2>
              <Link 
                to="/shop" 
                className="text-xl font-medium text-primary flex items-center hover:underline"
              >
                View all <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
            
            <div className="featured-products-grid gap-8 xl:gap-10">
              {isLoading ? (
                // Show loading placeholders
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="bg-muted animate-pulse rounded-lg p-4 h-64" />
                ))
              ) : featuredProducts.length > 0 ? (
                featuredProducts.slice(0, 3).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No products available right now.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categories section */}
        <section className="page-container">
          <div className="content-container">
            <h2 className="section-title">Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${encodeURIComponent(category.id)}`}
                  className="relative overflow-hidden rounded-lg aspect-[4/3] group hover:shadow-lg transition-all"
                >
                  <div 
                    className="absolute inset-0 bg-black opacity-40 group-hover:opacity-30 transition-opacity" 
                  />
                  <div 
                    className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${category.image})` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <h3 className="text-white text-2xl font-medium text-center">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* About section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-accent mt-16">
          <div className="content-container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-2">Our Approach</span>
                <h2 className="section-title">Crafted with Passion</h2>
                <p className="text-muted-foreground mb-6">
                  At Baked Bliss, we believe in the art of traditional baking. Each loaf of bread, each pastry, and every cookie is made by hand using time-honored techniques and the finest ingredients sourced from local farmers whenever possible.
                </p>
                <p className="text-muted-foreground mb-6">
                  Our master bakers bring decades of experience to their craft, ensuring that every item that leaves our bakery meets our exacting standards of quality and taste.
                </p>
                <Link 
                  to="/about"
                  className="text-primary inline-flex items-center font-medium hover:underline"
                >
                  Learn more about our story <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="relative rounded-lg overflow-hidden aspect-square">
                {!isBakerImageLoaded && (
                  <div className="absolute inset-0 bg-muted animate-pulse" />
                )}
                <img 
                  src="https://images.unsplash.com/photo-1591247378419-2c8a71f593f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2680&q=80" 
                  alt="Baker working with dough" 
                  className={`object-cover w-full h-full ${isBakerImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setIsBakerImageLoaded(true)}
                  onError={() => {
                    console.error("Failed to load baker image, trying fallback");
                    // If the original image fails, try a fallback
                    const img = document.createElement('img');
                    img.src = "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80";
                    img.onload = () => {
                      const imgElement = document.querySelector('[alt="Baker working with dough"]') as HTMLImageElement;
                      if (imgElement) {
                        imgElement.src = img.src;
                        setIsBakerImageLoaded(true);
                      }
                    };
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        {/* <section className="page-container">
          <h2 className="section-title text-center">What Our Customers Say</h2>
          <div className="grid gap-8 md:grid-cols-3 mt-8">
            {[
              {
                name: "Sarah Johnson",
                quote: "The sourdough bread is absolutely incredible. It's better than any bakery in town!",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80"
              },
              {
                name: "Michael Chen",
                quote: "Their croissants are the highlight of my weekends. Perfectly flaky and buttery.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2787&q=80"
              },
              {
                name: "Emily Rodriguez",
                quote: "I ordered a custom cake for my daughter's birthday and it was both beautiful and delicious!",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2788&q=80"
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-lg border border-border flex flex-col items-center text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-muted-foreground italic mb-4">{testimonial.quote}</p>
                <p className="font-medium">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </section> */}
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default Index;
