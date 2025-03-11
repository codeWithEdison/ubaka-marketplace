
import { useState } from 'react';
import { Plus, Package, Edit, Trash2, Check, X, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/AdminSidebar';
import { products, categories, Product } from '@/lib/data';

const AdminProducts = () => {
  const [productList, setProductList] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  
  const filteredProducts = productList.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddProduct = (newProduct: Product) => {
    setProductList(prev => [...prev, newProduct]);
    setIsAddDialogOpen(false);
    toast({
      title: "Product added",
      description: `${newProduct.name} has been added successfully.`,
    });
  };
  
  const handleEditProduct = (updatedProduct: Product) => {
    setProductList(prev => 
      prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setIsEditDialogOpen(false);
    toast({
      title: "Product updated",
      description: `${updatedProduct.name} has been updated successfully.`,
    });
  };
  
  const handleDeleteProduct = () => {
    if (selectedProduct) {
      setProductList(prev => prev.filter(product => product.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);
      toast({
        title: "Product deleted",
        description: `${selectedProduct.name} has been deleted successfully.`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Product Management</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <AdminSidebar />
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-2 lg:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm 
                      categories={categories.map(c => c.name)} 
                      onSubmit={handleAddProduct} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-10 h-10 object-cover rounded-md"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {product.inStock ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                <Check className="mr-1 h-3 w-3" />
                                In Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                <X className="mr-1 h-3 w-3" />
                                Out of Stock
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="h-3.5 w-3.5 text-primary fill-primary mr-1" />
                              {product.rating}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog open={isEditDialogOpen && selectedProduct?.id === product.id} onOpenChange={(open) => {
                                setIsEditDialogOpen(open);
                                if (open) setSelectedProduct(product);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Edit Product</DialogTitle>
                                  </DialogHeader>
                                  {selectedProduct && (
                                    <ProductForm 
                                      product={selectedProduct} 
                                      categories={categories.map(c => c.name)} 
                                      onSubmit={handleEditProduct} 
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              <Dialog open={isDeleteDialogOpen && selectedProduct?.id === product.id} onOpenChange={(open) => {
                                setIsDeleteDialogOpen(open);
                                if (open) setSelectedProduct(product);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Product</DialogTitle>
                                  </DialogHeader>
                                  <p>Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.</p>
                                  <div className="flex justify-end space-x-2 mt-4">
                                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleDeleteProduct}>
                                      Delete
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

interface ProductFormProps {
  product?: Product;
  categories: string[];
  onSubmit: (product: Product) => void;
}

const ProductForm = ({ product, categories, onSubmit }: ProductFormProps) => {
  const defaultProduct: Product = {
    id: product?.id || `p${Date.now()}`,
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || categories[0],
    image: product?.image || 'https://images.unsplash.com/photo-1518707495364-2ca69da1bc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    rating: product?.rating || 4.0,
    inStock: product?.inStock ?? true,
    featured: product?.featured || false,
    new: product?.new || false,
    discount: product?.discount || 0,
    specifications: product?.specifications || {},
  };
  
  const [formData, setFormData] = useState<Product>(defaultProduct);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleInputChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input 
            id="price" 
            name="price" 
            type="number" 
            min="0" 
            step="0.01" 
            value={formData.price} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="discount">Discount (%)</Label>
          <Input 
            id="discount" 
            name="discount" 
            type="number" 
            min="0" 
            max="100" 
            step="1" 
            value={formData.discount} 
            onChange={handleInputChange} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input 
            id="image" 
            name="image" 
            value={formData.image} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Input 
            id="rating" 
            name="rating" 
            type="number" 
            min="0" 
            max="5" 
            step="0.1" 
            value={formData.rating} 
            onChange={handleInputChange} 
            required 
          />
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <Label htmlFor="description">Description</Label>
        <textarea 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleInputChange} 
          rows={4} 
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>
      
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="inStock"
            checked={formData.inStock} 
            onCheckedChange={(checked) => handleCheckboxChange('inStock', checked === true)} 
          />
          <Label htmlFor="inStock">In Stock</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="featured"
            checked={formData.featured} 
            onCheckedChange={(checked) => handleCheckboxChange('featured', checked === true)} 
          />
          <Label htmlFor="featured">Featured Product</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="new"
            checked={formData.new} 
            onCheckedChange={(checked) => handleCheckboxChange('new', checked === true)} 
          />
          <Label htmlFor="new">New Product</Label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="submit">
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default AdminProducts;
