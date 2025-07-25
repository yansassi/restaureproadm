import { useState, useEffect } from 'react';
import { supabase, RestorationRequest } from '../lib/supabase';

export function useRestorationRequests() {
  const [requests, setRequests] = useState<RestorationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
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