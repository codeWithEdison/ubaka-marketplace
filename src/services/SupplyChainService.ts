import { supabase } from '@/integrations/supabase/client';

export interface Supplier {
    id: string;
    name: string;
    reliability: number;
    lead_time: number;
    on_time_delivery: number;
    status: 'active' | 'warning' | 'critical';
    created_at: string;
    updated_at: string;
}

export interface Shipment {
    id: string;
    supplier_id: string;
    supplier_name: string;
    items_count: number;
    status: 'delivered' | 'in-transit' | 'pending' | 'delayed';
    expected_date: string;
    created_at: string;
    updated_at: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    stock: number;
    threshold: number;
    supplier_id: string;
    supplier_name: string;
    created_at: string;
    updated_at: string;
}

export const fetchSuppliers = async () => {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

    if (error) {
        throw new Error(error.message);
    }

    return data as Supplier[];
};

export const fetchShipments = async () => {
    const { data, error } = await supabase
        .from('shipments')
        .select(`
      *,
      suppliers (
        name
      )
    `)
        .order('expected_date', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data.map(shipment => ({
        ...shipment,
        supplier_name: shipment.suppliers.name
    })) as Shipment[];
};

export const fetchInventory = async () => {
    const { data, error } = await supabase
        .from('inventory')
        .select(`
      *,
      suppliers (
        name
      )
    `)
        .order('name');

    if (error) {
        throw new Error(error.message);
    }

    return data.map(item => ({
        ...item,
        supplier_name: item.suppliers.name
    })) as InventoryItem[];
};

export const createSupplier = async (supplierData: Partial<Supplier>) => {
    const { data, error } = await supabase
        .from('suppliers')
        .insert(supplierData)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as Supplier;
};

export const createShipment = async (shipmentData: Partial<Shipment>) => {
    const { data, error } = await supabase
        .from('shipments')
        .insert(shipmentData)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as Shipment;
};

export const createInventoryItem = async (itemData: Partial<InventoryItem>) => {
    const { data, error } = await supabase
        .from('inventory')
        .insert(itemData)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as InventoryItem;
};

export const updateInventoryStock = async (itemId: string, newStock: number) => {
    const { data, error } = await supabase
        .from('inventory')
        .update({ stock: newStock })
        .eq('id', itemId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as InventoryItem;
}; 