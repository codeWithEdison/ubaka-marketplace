import { useState, useEffect } from 'react';
import { Plus, List, Edit, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/AdminSidebar';
import { Category } from '@/lib/utils';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/services/CategoryService';

const AdminCategories = () => {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategoryList(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCategories = categoryList.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddCategory = async (newCategory: Category) => {
    try {
      await createCategory(newCategory);
      await loadCategories();
      setIsAddDialogOpen(false);
      toast({
        title: "Category added",
        description: `${newCategory.name} has been added successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };
  
  const handleEditCategory = async (updatedCategory: Category) => {
    try {
      await updateCategory(updatedCategory.id, updatedCategory);
      await loadCategories();
      setIsEditDialogOpen(false);
      toast({
        title: "Category updated",
        description: `${updatedCategory.name} has been updated successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteCategory = async () => {
    if (selectedCategory) {
      try {
        await deleteCategory(selectedCategory.id);
        await loadCategories();
        setIsDeleteDialogOpen(false);
        toast({
          title: "Category deleted",
          description: `${selectedCategory.name} has been deleted successfully.`,
          variant: "destructive",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Category Management</h1>
          
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
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm onSubmit={handleAddCategory} />
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.length === 0 ? (
                  <p className="col-span-full text-center py-8 text-muted-foreground">
                    No categories found
                  </p>
                ) : (
                  filteredCategories.map((category) => (
                    <Card key={category.id}>
                      <CardContent className="p-0">
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{category.name}</h3>
                              <p className="text-sm text-muted-foreground mb-1">{category.description}</p>
                              <p className="text-sm">{category.count} Products</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Dialog open={isEditDialogOpen && selectedCategory?.id === category.id} onOpenChange={(open) => {
                              setIsEditDialogOpen(open);
                              if (open) setSelectedCategory(category);
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Category</DialogTitle>
                                </DialogHeader>
                                {selectedCategory && (
                                  <CategoryForm 
                                    category={selectedCategory} 
                                    onSubmit={handleEditCategory} 
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Dialog open={isDeleteDialogOpen && selectedCategory?.id === category.id} onOpenChange={(open) => {
                              setIsDeleteDialogOpen(open);
                              if (open) setSelectedCategory(category);
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Category</DialogTitle>
                                </DialogHeader>
                                <p>Are you sure you want to delete <strong>{category.name}</strong>? This action cannot be undone.</p>
                                <div className="flex justify-end space-x-2 mt-4">
                                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button variant="destructive" onClick={handleDeleteCategory}>
                                    Delete
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: Category) => void;
}

const CategoryForm = ({ category, onSubmit }: CategoryFormProps) => {
  const defaultCategory: Category = {
    id: category?.id || `c${Date.now()}`,
    name: category?.name || '',
    description: category?.description || '',
    image: category?.image || 'https://images.unsplash.com/photo-1518707495364-2ca69da1bc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    count: category?.count || 0,
  };
  
  const [formData, setFormData] = useState<Category>(defaultCategory);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description || ''} 
            onChange={handleInputChange} 
            rows={3} 
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input 
            id="image" 
            name="image" 
            value={formData.image || ''} 
            onChange={handleInputChange} 
            required 
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="submit">
          {category ? 'Update Category' : 'Add Category'}
        </Button>
      </div>
    </form>
  );
};

export default AdminCategories;
