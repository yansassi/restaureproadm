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
  Image as ImageIcon,
  FileText,
  AlertCircle
} from 'lucide-react';

interface RequestsListProps {
  requests: RestorationRequest[];
  onViewRequest: (request: RestorationRequest) => void;
  onUpdateStatus: (id: string, status: RestorationRequest['status'], notes?: string) => Promise<boolean>;
}

export function RequestsList({ requests, onViewRequest, onUpdateStatus }: RequestsListProps) {
  const [filter, setFilter] = useState<'all' | RestorationRequest['status']>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  console.log('RequestsList component rendered - requests:', requests.length, 'filter:', filter, 'search:', search);

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = 
      request.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      request.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      (request.customer_phone && request.customer_phone.toLowerCase().includes(search.toLowerCase()));
    
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

  const handleQuickStatusUpdate = async (id: string, status: RestorationRequest['status']) => {
    await onUpdateStatus(id, status);
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

  const getPriorityRequests = () => {
    return filteredRequests.filter(req => req.status === 'pending').slice(0, 3);
  };

  const getRecentRequests = () => {
    return filteredRequests.slice(0, 10);
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos de Restauração</h1>
          <p className="text-gray-600 mt-1">Gerencie e acompanhe todos os pedidos de restauração de imagens</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {requests.filter(r => r.status === 'pending').length} Pendentes
              </span>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {requests.filter(r => r.status === 'processing').length} Em Processo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pedidos Prioritários */}
      {getPriorityRequests().length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-yellow-800">Pedidos Prioritários</h2>
            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              {getPriorityRequests().length} pendentes
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getPriorityRequests().map((request) => (
              <div key={request.id} className="bg-white rounded-lg p-4 shadow-sm border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 truncate">{request.customer_name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(request.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 truncate">{request.customer_email}</p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleQuickStatusUpdate(request.id, 'processing')}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
                  >
                    Iniciar Processo
                  </button>
                  <button
                    onClick={() => onViewRequest(request)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros e Controles */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-md">
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
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredRequests.length} de {requests.length} pedidos
            </span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tabela
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      {filteredRequests.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {getRecentRequests().map((request) => (
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

                  {request.notes && (
                    <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 border border-blue-200">
                      <div className="flex items-start space-x-1">
                        <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <p className="line-clamp-2">{request.notes}</p>
                      </div>
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

                  {/* Ações Rápidas de Status */}
                  {request.status === 'pending' && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleQuickStatusUpdate(request.id, 'processing')}
                          className="flex-1 px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-medium hover:bg-purple-100 transition-colors"
                        >
                          Iniciar
                        </button>
                        <button
                          onClick={() => handleQuickStatusUpdate(request.id, 'cancelled')}
                          className="flex-1 px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {request.status === 'processing' && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleQuickStatusUpdate(request.id, 'completed')}
                        className="w-full px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-medium hover:bg-green-100 transition-colors"
                      >
                        Marcar como Concluído
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
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
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={request.original_image_url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxNEgyNlYyNkgyMFYxNFoiIGZpbGw9IiM5QjlCQTQiLz4KPHA+';
                              }}
                            />
                          </div>
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
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
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
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="text-center py-12">
            <div className="text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum pedido encontrado</p>
              <p className="text-sm">
                {search || filter !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Aguardando novos pedidos de restauração'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}