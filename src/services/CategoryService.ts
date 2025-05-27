import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/lib/utils';

export const fetchCategories = async () => {
  // Fetch all categories ordered by name
  const { data, error } = await supabase
    .from('categories')
    .select('*, product_count:products(count)')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  // Format the response to match our Category type
  return (data || []).map(category => ({
    id: category.id,
    name: category.name,
    description: category.description || '',
    image: category.image_url || '',
    count: category.product_count?.[0]?.count || 0,
  })) as Category[];
};

export const fetchCategoryById = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*, product_count:products(count)')
    .eq('id', categoryId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Category not found');
  }

  // Format the response to match our Category type
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    image: data.image_url || '',
    count: data.product_count?.[0]?.count || 0,
  } as Category;
};

export const createCategory = async (categoryData: Partial<Category>) => {
  // Check if user has admin permissions (you should implement this)
  const isAdmin = await checkIfUserIsAdmin();
  if (!isAdmin) {
    throw new Error('Admin privileges required to create categories');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: categoryData.name,
      description: categoryData.description,
      image_url: categoryData.image,
      parent_id: null // Removed parent property reference
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    image: data.image_url || '',
    count: 0, // New category has no products yet
  } as Category;
};

export const updateCategory = async (categoryId: string, categoryData: Partial<Category>) => {
  // Check if user has admin permissions
  const isAdmin = await checkIfUserIsAdmin();
  if (!isAdmin) {
    throw new Error('Admin privileges required to update categories');
  }

  const { data, error } = await supabase
    .from('categories')
    .update({
      name: categoryData.name,
      description: categoryData.description,
      image: categoryData.image,
      // parent_id: null
    })
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    image: data.image_url || '',
    count: 0, // We don't know the count here, would need another query
  } as Category;
};

export const deleteCategory = async (categoryId: string) => {
  // Check if user has admin permissions
  const isAdmin = await checkIfUserIsAdmin();
  if (!isAdmin) {
    throw new Error('Admin privileges required to delete categories');
  }

  // Check if category has products
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if (countError) {
    throw new Error(countError.message);
  }

  if (count && count > 0) {
    throw new Error(`Cannot delete category with ${count} products. Please move or delete the products first.`);
  }

  // Check if category has child categories
  const { count: childCount, error: childCountError } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('parent_id', categoryId);

  if (childCountError) {
    throw new Error(childCountError.message);
  }

  if (childCount && childCount > 0) {
    throw new Error(`Cannot delete category with ${childCount} child categories. Please move or delete them first.`);
  }

  // Delete the category
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

// Helper function to check if the current user has admin role
async function checkIfUserIsAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  const { data } = await supabase
    .from('user_roles')
    .select()
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  return !!data;
}
