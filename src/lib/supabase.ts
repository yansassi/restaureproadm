import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase não encontradas:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'Definida' : 'Não definida',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Definida' : 'Não definida'
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos TypeScript para os dados
export interface RestorationRequest {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  image_url: string[]; // Array de URLs das imagens
  payment_status?: string;
  image_count?: number;
  plan_id?: string;
  plan_name?: string;
  plan_price?: number;
  plan_images?: number;
  payment_fee: number;
  real_profit: number;
  delivery_method: string[];
  order_number: string;
  // Campos para compatibilidade com o componente
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  original_image_url: string;
  restored_image_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  updated_at: string;
}

export interface DatabaseError {
  message: string;
  details: string;
  hint: string;
}