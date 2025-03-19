
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../utils/data';
import { Product } from '../utils/types';

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const { data: filteredProducts } = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => {
      if (activeCategory === 'all') {
        return products;
      }
      return products.filter(product => product.category === activeCategory);
    },
    initialData: products,
  });
  
  return (
    <>
      <Navbar />
      <main className="page-container pt-24 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4">Our Fresh Baked Goods</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our selection of freshly baked bread, pastries, and treats. 
            Everything is made with love using traditional recipes and the finest ingredients.
          </p>
        </div>
        
        <div className="mb-10">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-md text-sm md:text-base transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Shop;
