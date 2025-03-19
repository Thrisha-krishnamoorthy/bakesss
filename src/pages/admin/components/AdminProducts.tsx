
import { useState } from 'react';
import { PlusCircle, Edit, X, CheckCircle, ImagePlus } from 'lucide-react';
import { products, categories } from '@/utils/data';
import { Product } from '@/utils/types';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const AdminProducts = () => {
  const [productList, setProductList] = useState<Product[]>(products);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const { toast } = useToast();

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProductName(product.name);
    setNewProductPrice(product.price.toString());
    setNewProductImage(product.image);
    setNewProductCategory(product.category);
    setNewProductQuantity('10'); // Default quantity, as it's not in our data model
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    
    // Validate inputs
    if (!newProductName || !newProductPrice || !newProductCategory) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Update product in list
    const updatedProducts = productList.map(p => 
      p.id === editingProduct.id 
        ? {
            ...p,
            name: newProductName,
            price: parseFloat(newProductPrice),
            image: newProductImage,
            category: newProductCategory,
          }
        : p
    );

    setProductList(updatedProducts);
    setEditingProduct(null);
    
    toast({
      title: "Success",
      description: "Product updated successfully",
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif">Products</h2>
        <button className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/90">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Product
        </button>
      </div>
      
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productList.map((product) => (
                <tr 
                  key={product.id} 
                  className="group hover:bg-muted/20 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden relative group-hover:ring-2 ring-primary">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button 
                                className="text-white p-1 rounded-full hover:bg-primary"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0">
                              <div className="p-4 space-y-4">
                                <div className="font-medium">Edit Product Image</div>
                                <Input 
                                  type="text" 
                                  placeholder="Image URL"
                                  defaultValue={product.image}
                                />
                                <div className="flex justify-end space-x-2">
                                  <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="ml-4 relative group">
                        <div className="text-sm font-medium relative">
                          {product.name}
                          <button 
                            className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    10
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Product</h3>
              <button 
                onClick={handleCancelEdit}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium mb-1">
                  Product Name
                </label>
                <Input
                  id="productName"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="productPrice" className="block text-sm font-medium mb-1">
                  Price
                </label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="productQuantity" className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <Input
                  id="productQuantity"
                  type="number"
                  value={newProductQuantity}
                  onChange={(e) => setNewProductQuantity(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="productCategory" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  id="productCategory"
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a category</option>
                  {categories
                    .filter(cat => cat.id !== 'all')
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div>
                <label htmlFor="productImage" className="block text-sm font-medium mb-1">
                  Image URL
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="productImage"
                    value={newProductImage}
                    onChange={(e) => setNewProductImage(e.target.value)}
                    className="w-full"
                  />
                  <button className="flex-shrink-0 p-2 border border-input rounded-md text-muted-foreground hover:bg-muted">
                    <ImagePlus className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="pt-3 flex justify-end space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-input rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
