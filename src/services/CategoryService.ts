
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/lib/data';

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*, products:products(count)')
    .order('name');
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data || [];
};

export const fetchCategoryById = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select()
    .eq('id', categoryId)
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const createCategory = async (categoryData: Omit<Category, 'id' | 'count'>) => {
  const { data, error } = await supabase
    .from('categories')
    .insert(categoryData)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const updateCategory = async (categoryId: string, categoryData: Partial<Category>) => {
  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const deleteCategory = async (categoryId: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
};
