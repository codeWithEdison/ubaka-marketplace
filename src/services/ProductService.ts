import { supabase } from '@/integrations/supabase/client';
import { Product, DbProduct } from '@/lib/utils';

export type ProductCategory = {
  id: string;
  name: string;
};

export const mapDbProductToProduct = (dbProduct: DbProduct): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    image: dbProduct.image || '',
    category: dbProduct.categories ? {
      id: dbProduct.categories.id,
      name: dbProduct.categories.name
    } : {
      id: 'uncategorized',
      name: 'Uncategorized'
    },
    rating: dbProduct.ratings && dbProduct.ratings[0] ?
      dbProduct.ratings[0].average_rating || 0 : 0,
    discount: dbProduct.discount || 0,
    new: dbProduct.new || false,
    featured: dbProduct.featured || false,
    inStock: dbProduct.in_stock !== null ? dbProduct.in_stock : true,
    specifications: dbProduct.specifications || {}
  };
};

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

  return mapDbProductToProduct(data as DbProduct);
};

export const createProduct = async (product: Omit<Product, 'id'>) => {
  // Transform the product to match database schema
  const dbProduct: Omit<DbProduct, 'id'> = {
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category_id: product.category.id,
    discount: product.discount,
    new: product.new,
    featured: product.featured,
    in_stock: product.inStock,
    specifications: product.specifications,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(dbProduct)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbProductToProduct(data as DbProduct);
};

export const updateProduct = async (productId: string, productData: Partial<Product>) => {
  // Transform the product data to match database schema
  const dbProduct: Partial<DbProduct> = {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    image: productData.image,
    category_id: productData.category?.id,
    discount: productData.discount,
    new: productData.new,
    featured: productData.featured,
    in_stock: productData.inStock,
    specifications: productData.specifications,
  };

  const { data, error } = await supabase
    .from('products')
    .update(dbProduct)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbProductToProduct(data as DbProduct);
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

export const fetchProductsByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories:category_id (id, name),
      ratings:product_ratings (average_rating, review_count)
    `)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapDbProductToProduct);
};
