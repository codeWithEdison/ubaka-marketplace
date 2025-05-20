
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  inStock: boolean;
  featured?: boolean;
  new?: boolean; // Using 'new' instead of 'isNew'
  discount?: number;
  specifications?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Premium Cement",
    description: "High-quality Portland cement for all your construction needs. Provides excellent strength and durability.",
    price: 14.99,
    category: "Building Materials",
    image: "https://images.unsplash.com/photo-1571993004081-e3817dafbc0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    rating: 4.8,
    inStock: true,
    featured: true,
    specifications: {
      "Type": "Portland",
      "Weight": "50kg",
      "Setting Time": "45 minutes",
      "Strength Class": "42.5N",
    }
  },
  {
    id: "p2",
    name: "Structural Steel Beams",
    description: "Heavy-duty steel I-beams for structural support in construction projects.",
    price: 89.95,
    category: "Structural Components",
    image: "https://images.unsplash.com/photo-1530412242123-ac60b0889aad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    rating: 4.9,
    inStock: true,
    new: true,
    specifications: {
      "Material": "Carbon Steel",
      "Length": "6m",
      "Weight": "25kg/m",
      "Load Capacity": "15 tons",
    }
  },
  {
    id: "p3",
    name: "Ceramic Floor Tiles",
    description: "Elegant and durable ceramic tiles for indoor and outdoor flooring applications.",
    price: 2.49,
    category: "Flooring",
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    rating: 4.7,
    inStock: true,
    discount: 15,
    featured: true,
    specifications: {
      "Size": "30cm x 30cm",
      "Thickness": "8mm",
      "Material": "Ceramic",
      "Water Resistance": "High",
    }
  },
  {
    id: "p4",
    name: "Insulation Panels",
    description: "High-performance thermal insulation panels for energy-efficient construction.",
    price: 32.99,
    category: "Insulation",
    image: "https://images.unsplash.com/photo-1610309835404-2160ec9dd859?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    rating: 4.6,
    inStock: true,
    featured: true,
    specifications: {
      "R-Value": "R-15",
      "Thickness": "10cm",
      "Material": "Polystyrene",
      "Size": "1.2m x 2.4m",
    }
  },
  {
    id: "p5",
    name: "Architectural Glass",
    description: "Premium quality glass panels for modern architectural designs.",
    price: 75.50,
    category: "Windows & Doors",
    image: "https://images.unsplash.com/photo-1614633836648-68e29898aa01?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    rating: 4.8,
    inStock: true,
    new: true,
    specifications: {
      "Thickness": "8mm",
      "Type": "Tempered",
      "Size": "1m x 2m",
      "UV Protection": "Yes",
    }
  },
  {
    id: "p6",
    name: "Premium Hardwood Flooring",
    description: "Luxurious oak hardwood flooring for elegant interiors and lasting beauty.",
    price: 5.99,
    category: "Flooring",
    image: "https://images.unsplash.com/photo-1622120332513-a515e226becb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    rating: 4.9,
    inStock: true,
    featured: true,
    specifications: {
      "Wood Type": "Oak",
      "Thickness": "18mm",
      "Width": "120mm",
      "Finish": "Natural Oil",
    }
  },
  {
    id: "p7",
    name: "Copper Plumbing Pipes",
    description: "High-grade copper pipes for reliable plumbing installations.",
    price: 22.75,
    category: "Plumbing",
    image: "https://images.unsplash.com/photo-1584831064883-2e00e5f0c60c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    rating: 4.7,
    inStock: true,
    discount: 10,
    specifications: {
      "Diameter": "22mm",
      "Length": "3m",
      "Material": "Copper",
      "Pressure Rating": "16 bar",
    }
  },
  {
    id: "p8",
    name: "Electrical Wiring Bundle",
    description: "Complete electrical wiring kit for residential and commercial installations.",
    price: 129.99,
    category: "Electrical",
    image: "https://images.unsplash.com/photo-1600443295039-a68ed5506aec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    rating: 4.5,
    inStock: true,
    specifications: {
      "Wire Gauge": "14 AWG",
      "Length": "100m",
      "Insulation": "PVC",
      "Certification": "UL Listed",
    }
  },
];

export const categories: Category[] = [
  {
    id: "c1",
    name: "Building Materials",
    description: "Foundation materials, cement, bricks, and concrete products",
    image: "https://images.unsplash.com/photo-1518707495364-2ca69da1bc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    count: 42
  },
  {
    id: "c2",
    name: "Structural Components",
    description: "Steel beams, columns, trusses, and structural supports",
    image: "https://images.unsplash.com/photo-1543674892-7d64d45facfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    count: 24
  },
  {
    id: "c3",
    name: "Flooring",
    description: "Tiles, hardwood, laminate, and vinyl flooring options",
    image: "https://images.unsplash.com/photo-1622120332513-a515e226becb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    count: 36
  },
  {
    id: "c4",
    name: "Insulation",
    description: "Thermal and acoustic insulation for efficient buildings",
    image: "https://images.unsplash.com/photo-1610309835404-2160ec9dd859?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    count: 18
  },
  {
    id: "c5",
    name: "Windows & Doors",
    description: "Windows, doors, frames, and architectural glass",
    image: "https://images.unsplash.com/photo-1614633836648-68e29898aa01?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    count: 29
  },
  {
    id: "c6",
    name: "Plumbing",
    description: "Pipes, fittings, fixtures, and plumbing supplies",
    image: "https://images.unsplash.com/photo-1584831064883-2e00e5f0c60c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    count: 31
  },
  {
    id: "c7",
    name: "Electrical",
    description: "Wiring, fixtures, panels, and electrical components",
    image: "https://images.unsplash.com/photo-1600443295039-a68ed5506aec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    count: 27
  },
  {
    id: "c8",
    name: "Tools & Equipment",
    description: "Hand tools, power tools, and construction equipment",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    count: 48
  },
];

// For managing shopping cart data
export interface CartItem {
  product: Product;
  quantity: number;
}

// Helpers for cart management
export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const getNewProducts = (): Product[] => {
  return products.filter(product => product.new);
};

export const getDiscountedProducts = (): Product[] => {
  return products.filter(product => product.discount && product.discount > 0);
};
