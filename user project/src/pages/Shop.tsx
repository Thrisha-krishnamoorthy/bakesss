
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { categories } from '../utils/data';
import { Product } from '../utils/types';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../utils/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'all');
  
  // Update active category when URL params change
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);
  
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
  
  // Filter products by the active category
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);
  
  // Get unique categories from products
  const uniqueCategories = ['all', ...new Set(products.map(product => product.category))];
  
  // Function to handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSearchParams({ category });
  };

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
        
        {/* Category tabs using shadcn UI Tabs component */}
        <div className="mb-10">
          <Tabs defaultValue={activeCategory} onValueChange={handleCategoryChange}>
            <TabsList className="flex flex-wrap justify-center w-full mb-6">
              {uniqueCategories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="text-sm md:text-base px-4 py-2"
                >
                  {category === 'all' ? 'All Products' : category}
                </TabsTrigger>
              ))}
            </TabsList>

            {uniqueCategories.map((category) => (
              <TabsContent key={category} value={category} className="mt-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(8).fill(0).map((_, i) => (
                      <div key={i} className="bg-muted animate-pulse rounded-lg p-4 h-64" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Error loading products. Please try again later.</p>
                  </div>
                ) : category === 'all' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))
                    ) : (
                      <div className="text-center py-12 col-span-full">
                        <p className="text-muted-foreground">No products found in this category.</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Shop;
