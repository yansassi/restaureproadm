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
      
      // Verificar se o Supabase está configurado
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Variáveis de ambiente do Supabase não configuradas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
      }
      
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
        status: (customer.payment_status === 'completed' ? 'completed' : 
                customer.payment_status === 'processing' ? 'processing' : 
                customer.payment_status === 'cancelled' ? 'cancelled' : 'pending') as RestorationRequest['status'],
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
      // Mapear o status para o campo correto no banco de dados
      const paymentStatus = status === 'pending' ? 'pending' :
                           status === 'processing' ? 'processing' :
                           status === 'completed' ? 'completed' :
                           status === 'cancelled' ? 'cancelled' : 'pending';
      
      const { error } = await supabase
        .from('customers')
        .update({ 
          payment_status: paymentStatus
        })
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar o estado local
      setRequests(prev => 
        prev.map(req => 
          req.id === id 
            ? { ...req, status, payment_status: paymentStatus, notes: notes || req.notes, updated_at: new Date().toISOString() }
            : req
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating request status:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
      return false;
    }
  };

  const updateRestoredImage = async (id: string, restoredImageUrl: string) => {
    try {
      // Primeiro, buscar as imagens atuais
      const { data: currentData, error: fetchError } = await supabase
        .from('customers')
        .select('image_url')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Atualizar o array de imagens
      const currentImages = currentData?.image_url || [];
      const updatedImages = currentImages.length > 0 
        ? [currentImages[0], restoredImageUrl] 
        : [restoredImageUrl];
      
      const { error } = await supabase
        .from('customers')
        .update({ 
          image_url: updatedImages
        })
        .eq('id', id);

      if (error) throw error;
      
      setRequests(prev => 
        prev.map(req => 
          req.id === id 
            ? { ...req, restored_image_url: restoredImageUrl, image_url: updatedImages, updated_at: new Date().toISOString() }
            : req
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating restored image:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar imagem restaurada');
      return false;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      console.log('Iniciando exclusão do pedido:', id);
      
      // Primeiro, buscar as imagens associadas ao pedido
      const { data: requestData, error: fetchError } = await supabase
        .from('customers')
        .select('image_url')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Erro ao buscar dados do pedido:', fetchError);
        throw fetchError;
      }
      
      // Excluir imagens do Storage se existirem
      if (requestData?.image_url && requestData.image_url.length > 0) {
        console.log('Excluindo imagens do Storage:', requestData.image_url);
        
        const imagePaths = requestData.image_url.map(url => {
          // Extrair o caminho do arquivo da URL
          // Assumindo que as URLs seguem o padrão: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
          const urlParts = url.split('/');
          const bucketIndex = urlParts.findIndex(part => part === 'public') + 1;
          if (bucketIndex > 0 && bucketIndex < urlParts.length) {
            return urlParts.slice(bucketIndex + 1).join('/'); // Pular o nome do bucket
          }
          return null;
        }).filter(path => path !== null);
        
        if (imagePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('images') // Nome do bucket - ajuste conforme necessário
            .remove(imagePaths);
          
          if (storageError) {
            console.warn('Erro ao excluir imagens do Storage (continuando com exclusão do registro):', storageError);
            // Não interromper o processo se houver erro no storage
          } else {
            console.log('Imagens excluídas do Storage com sucesso');
          }
        }
      }
      
      // Excluir o registro do banco de dados
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Erro ao excluir registro do banco:', deleteError);
        throw deleteError;
      }
      
      console.log('Registro excluído do banco com sucesso');
      
      // Atualizar o estado local removendo o pedido
      setRequests(prev => prev.filter(req => req.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir pedido';
      setError(errorMessage);
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
    updateRestoredImage,
    deleteRequest
  };
}