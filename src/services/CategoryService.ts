import { supabase } from '@/integrations/supabase/client';
import { Category, DbCategory } from '@/lib/utils';

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*, product_count:products(count)')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    image: category.image,
    count: category.product_count?.[0]?.count || 0,
    created_at: category.created_at,
    updated_at: category.updated_at
  })) as Category[];
};

export const fetchCategoryById = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*, product_count:products(count)')
    .eq('id', categoryId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    image: data.image,
    count: data.product_count?.[0]?.count || 0,
    created_at: data.created_at,
    updated_at: data.updated_at
  } as Category;
};

export const createCategory = async (categoryData: Omit<Category, 'id'>) => {
  const dbCategory: Omit<DbCategory, 'id'> = {
    name: categoryData.name,
    description: categoryData.description,
    image: categoryData.image
  };

  const { data, error } = await supabase
    .from('categories')
    .insert(dbCategory)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    image: data.image,
    count: 0,
    created_at: data.created_at,
    updated_at: data.updated_at
  } as Category;
};

export const updateCategory = async (categoryId: string, categoryData: Partial<Category>) => {
  const dbCategory: Partial<DbCategory> = {
    name: categoryData.name,
    description: categoryData.description,
    image: categoryData.image
  };

  const { data, error } = await supabase
    .from('categories')
    .update(dbCategory)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    image: data.image,
    count: 0, // We'll need to fetch this separately if needed
    created_at: data.created_at,
    updated_at: data.updated_at
  } as Category;
};

export const deleteCategory = async (categoryId: string) => {
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
