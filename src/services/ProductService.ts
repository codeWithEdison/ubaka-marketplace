import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/data';

export interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_url: string | null;
  discount: number | null;
  featured: boolean | null;
  in_stock: boolean | null;
  is_new: boolean | null;
  specifications: any | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
  } | null;
  ratings?: {
    average_rating: number | null;
    review_count: number | null;
  }[] | null;
}

export const mapDbProductToProduct = (dbProduct: DbProduct): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    image: dbProduct.image_url || '',
    category: dbProduct.categories ? {
      id: dbProduct.categories.id,
      name: dbProduct.categories.name
    } : 'Uncategorized',
    rating: dbProduct.ratings && dbProduct.ratings[0] ? 
      dbProduct.ratings[0].average_rating || 0 : 0,
    discount: dbProduct.discount || 0,
    new: dbProduct.is_new || false,
    featured: dbProduct.featured || false,
    inStock: dbProduct.in_stock !== null ? dbProduct.in_stock : true,
    specifications: dbProduct.specifications || {}
  };
}

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
  
  const products = data?.map(mapDbProductToProduct) || [];
  
  return { 
    products,
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0
  };
};

export const fetchProductById = async (productId: string): Promise<Product> => {
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
  
  if (!data) {
    throw new Error('Product not found');
  }
  
  return mapDbProductToProduct(data);
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
