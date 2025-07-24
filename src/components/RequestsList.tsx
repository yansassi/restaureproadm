import React, { useState } from 'react';
import { RestorationRequest } from '../lib/supabase';
import { 
  Eye, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PlayCircle,
  Filter,
  Search
} from 'lucide-react';

interface RequestsListProps {
  requests: RestorationRequest[];
  onViewRequest: (request: RestorationRequest) => void;
  onUpdateStatus: (id: string, status: RestorationRequest['status'], notes?: string) => Promise<boolean>;
}

export function RequestsList({ requests, onViewRequest, onUpdateStatus }: RequestsListProps) {
  const [filter, setFilter] = useState<'all' | RestorationRequest['status']>('all');
  const [search, setSearch] = useState('');

  console.log('RequestsList component rendered - requests:', requests.length, 'filter:', filter, 'search:', search);

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = 
      request.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      request.customer_email.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  console.log('RequestsList - filtered requests count:', filteredRequests.length);

  const handleDownloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
    }
  };

  const getStatusIcon = (status: RestorationRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: RestorationRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: RestorationRequest['status']) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos de Restauração</h1>
        <div className="text-sm text-gray-500">
          {filteredRequests.length} de {requests.length} pedidos
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="processing">Processando</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data do Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.customer_email}
                        </div>
                        {request.customer_phone && (
                          <div className="text-sm text-gray-500">
                            {request.customer_phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{getStatusText(request.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(request.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onViewRequest(request)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadImage(
                            request.original_image_url, 
                            `original_${request.customer_name}_${request.id}.jpg`
                          )}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Imagem Original"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {request.restored_image_url && (
                          <button
                            onClick={() => handleDownloadImage(
                              request.restored_image_url!, 
                              `restored_${request.customer_name}_${request.id}.jpg`
                            )}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Download Imagem Restaurada"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum pedido encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}