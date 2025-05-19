
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/data';

export const fetchProducts = async (
  { 
    category = '', 
    search = '', 
    minPrice = 0, 
    maxPrice = 0, 
    inStock = true,
    featured = false, 
    isNew = false, 
    page = 1,
    limit = 12,
    sortBy = 'name',
    sortOrder = 'asc'
  } = {}
) => {
  let query = supabase.from('products').select(`
    *,
    categories:category_id (id, name),
    ratings:product_ratings (average_rating, review_count)
  `, { count: 'exact' });

  // Apply filters
  if (category) {
    query = query.eq('category_id', category);
  }
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  
  if (minPrice > 0) {
    query = query.gte('price', minPrice);
  }
  
  if (maxPrice > 0) {
    query = query.lte('price', maxPrice);
  }
  
  if (inStock !== null) {
    query = query.eq('in_stock', inStock);
  }
  
  if (featured) {
    query = query.eq('featured', true);
  }
  
  if (isNew) {
    query = query.eq('is_new', true);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);
  
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  return { 
    products: data || [], 
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
};

export const fetchProductById = async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories:category_id (id, name),
      ratings:product_ratings (average_rating, review_count)
    `)
    .eq('id', productId)
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const createProduct = async (productData: Omit<Product, 'id'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const updateProduct = async (productId: string, productData: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', productId)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const deleteProduct = async (productId: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
};

export const updateProductInventory = async (productId: string, inStock: boolean) => {
  const { data, error } = await supabase
    .from('products')
    .update({ in_stock: inStock })
    .eq('id', productId)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};
