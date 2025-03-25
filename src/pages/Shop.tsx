
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { categories } from '../utils/data';
import { Product } from '../utils/types';
import { useSearchParams } from 'react-router-dom';

const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch('http://localhost:5000/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    // Transform the data to match our Product type
    return data.map((item: any) => ({
      id: item.product_id.toString(),
      name: item.name,
      price: parseFloat(item.price),
      description: item.description || "",
      longDescription: item.description || "",
      image: item.image_url || "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
      category: item.category,
      ingredients: [],
      allergens: [],
      inStock: item.status === 'in_stock',
      quantity: item.quantity
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array if API fails
    return [];
  }
};

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'all');
  
  // Update active category when URL params change
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
  
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);
  
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
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg p-4 h-64" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Shop;
