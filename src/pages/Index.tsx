
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { products, categories } from '../utils/data';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Index = () => {
  const [isHeroLoaded, setIsHeroLoaded] = useState(false);
  const [heroImageUrl] = useState('https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2980&q=80');
  const [isBakerImageLoaded, setIsBakerImageLoaded] = useState(false);
  
  // Get featured products
  const featuredProducts = products.filter(product => product.featured);
  
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

  return (
    <>
      <Navbar />
      <main>
        {/* Hero section */}
        <section 
          className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
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
          
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <span className="inline-block bg-primary/90 text-primary-foreground text-sm font-medium py-1 px-3 rounded-full mb-6 backdrop-blur-sm animate-fade-in">
              Handcrafted with love
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white mb-6 animate-fade-in">
              Artisanal Baked Goods for Every Occasion
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in">
              Delicious, handcrafted breads and pastries made with the finest ingredients and traditional techniques.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
              <Link 
                to="/shop" 
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/90 btn-hover flex items-center"
              >
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-md font-medium transition-all hover:bg-white/30 btn-hover"
              >
                Our Story
              </Link>
            </div>
          </div>
        </section>

        {/* Featured products section */}
        <section className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Featured Products</h2>
            <Link 
              to="/shop" 
              className="text-sm font-medium text-primary flex items-center hover:underline"
            >
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="product-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Categories section */}
        <section className="page-container">
          <h2 className="section-title">Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(1).map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="relative overflow-hidden rounded-lg aspect-[4/3] group hover:shadow-lg transition-all"
              >
                <div 
                  className="absolute inset-0 bg-black opacity-40 group-hover:opacity-30 transition-opacity" 
                />
                <div 
                  className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 group-hover:scale-110"
                  style={{ 
                    backgroundImage: `url(${
                      category.id === 'bread' 
                        ? 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80' 
                        : category.id === 'pastries'
                        ? 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2796&q=80'
                        : 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80'
                    })` 
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <h3 className="text-white text-2xl font-medium text-center">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* About section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-accent mt-16">
          <div className="max-w-7xl mx-auto">
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
                      document.querySelector('[alt="Baker working with dough"]').src = img.src;
                      setIsBakerImageLoaded(true);
                    };
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section className="page-container">
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
        </section>

        {/* Newsletter section */}
        <section className="page-container bg-muted py-16 mt-16 rounded-lg">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-serif mb-4">Join Our Newsletter</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button 
                type="submit" 
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium transition-all hover:bg-primary/90 btn-hover"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Index;
