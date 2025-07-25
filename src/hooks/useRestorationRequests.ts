import { useState, useEffect } from 'react';
import { supabase, RestorationRequest } from '../lib/supabase';

export function useRestorationRequests() {
  const [requests, setRequests] = useState<RestorationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching requests from Supabase...');
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Mapear os dados da tabela customers para o formato RestorationRequest
      const requestsData = (data || []).map(customer => ({
        ...customer,
        // Mapear campos para compatibilidade
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        original_image_url: customer.image_url?.[0] || '',
        restored_image_url: customer.image_url?.[1] || null,
        status: customer.payment_status === 'completed' ? 'completed' : 
                customer.payment_status === 'processing' ? 'processing' : 'pending',
        notes: null,
        updated_at: customer.created_at
      }));
      
      console.log('Setting requests data:', requestsData);
      setRequests(requestsData);
    } catch (err) {
      console.error('Error in fetchRequests:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar pedidos';
      setError(errorMessage);
      setRequests([]); // Garantir que requests seja um array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: RestorationRequest['status'], notes?: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          status, 
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar o estado local
      setRequests(prev => 
        prev.map(req => 
          req.id === id 
            ? { ...req, status, notes: notes || req.notes, updated_at: new Date().toISOString() }
            : req
        )
      );
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
      return false;
    }
  };

  const updateRestoredImage = async (id: string, restoredImageUrl: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          restored_image_url: restoredImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      setRequests(prev => 
        prev.map(req => 
          req.id === id 
            ? { ...req, restored_image_url: restoredImageUrl, updated_at: new Date().toISOString() }
            : req
        )
      );
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar imagem restaurada');
      return false;
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    updateRequestStatus,
    updateRestoredImage
  };
}