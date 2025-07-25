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
  Search,
  Calendar,
  User,
  Mail,
  Phone,
  DollarSign,
  Package,
  Trash2
} from 'lucide-react';

interface OrdersListProps {
  requests: RestorationRequest[];
  onViewRequest: (request: RestorationRequest) => void;
  onUpdateStatus: (id: string, status: RestorationRequest['status'], notes?: string) => Promise<boolean>;
  onDeleteRequest: (id: string) => Promise<boolean>;
}

export function OrdersList({ requests, onViewRequest, onUpdateStatus, onDeleteRequest }: OrdersListProps) {
  const [filter, setFilter] = useState<'all' | RestorationRequest['status']>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = 
      request.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      request.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      (request.customer_phone && request.customer_phone.toLowerCase().includes(search.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'name':
        comparison = a.customer_name.localeCompare(b.customer_name);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

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

  const handleDeleteRequest = async (request: RestorationRequest) => {
    const confirmMessage = `Tem certeza que deseja excluir o pedido de ${request.customer_name}?\n\nEsta ação não pode ser desfeita e irá:\n• Remover o registro do banco de dados\n• Excluir todas as imagens associadas\n• Remover permanentemente todos os dados`;
    
    if (window.confirm(confirmMessage)) {
      const success = await onDeleteRequest(request.id);
      if (success) {
        // Mostrar mensagem de sucesso (opcional)
        alert('Pedido excluído com sucesso!');
      } else {
        alert('Erro ao excluir pedido. Tente novamente.');
      }
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
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Todos os Pedidos</h1>
          <p className="text-gray-600 mt-1">Visualização completa de todos os pedidos de restauração</p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
          {sortedRequests.length} de {requests.length} pedidos
        </div>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtro por Status */}
          <div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendentes</option>
                <option value="processing">Processando</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>

          {/* Ordenação */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setSortBy(sort as any);
                setSortOrder(order as any);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date-desc">Mais Recentes</option>
              <option value="date-asc">Mais Antigos</option>
              <option value="name-asc">Nome A-Z</option>
              <option value="name-desc">Nome Z-A</option>
              <option value="status-asc">Status A-Z</option>
              <option value="status-desc">Status Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos em Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedRequests.length > 0 ? (
          sortedRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header do Card */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1">{getStatusText(request.status)}</span>
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(request.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                    <button
                      onClick={() => handleDeleteRequest(request)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Excluir pedido"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
              </div>

              {/* Imagem Preview */}
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={request.original_image_url}
                  alt="Imagem original"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBIMTMwVjEzMEgxMDBWNzBaIiBmaWxsPSIjOUI5QkE0Ii8+CjxwYXRoIGQ9Ik03MCA3MEgxMDBWMTMwSDcwVjcwWiIgZmlsbD0iIzlCOUJBNCIvPgo8L3N2Zz4K';
                  }}
                />
              </div>

              {/* Informações do Cliente */}
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900 truncate">{request.customer_name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 truncate">{request.customer_email}</span>
                </div>

                {request.customer_phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{request.customer_phone}</span>
                  </div>
                )}

                {/* Informações do Plano */}
                {(request.plan_name || request.plan_price) && (
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    {request.plan_name && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{request.plan_name}</span>
                      </div>
                    )}
                    {request.plan_price && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-600">
                          R$ {Number(request.plan_price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {request.notes && (
                  <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 border border-blue-200">
                    <p className="line-clamp-2">{request.notes}</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between space-x-2">
                  <button
                    onClick={() => onViewRequest(request)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Ver Detalhes</span>
                  </button>
                  
                  <button
                    onClick={() => handleDownloadImage(
                      request.original_image_url, 
                      `original_${request.customer_name}_${request.id}.jpg`
                    )}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Download Original"
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
                      title="Download Restaurada"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
              <div className="text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum pedido encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}