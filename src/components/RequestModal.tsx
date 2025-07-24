import React, { useState } from 'react';
import { RestorationRequest } from '../lib/supabase';
import { 
  X, 
  Download, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface RequestModalProps {
  request: RestorationRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: RestorationRequest['status'], notes?: string) => Promise<boolean>;
}

export function RequestModal({ request, isOpen, onClose, onUpdateStatus }: RequestModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<RestorationRequest['status']>('pending');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !request) return null;

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    const success = await onUpdateStatus(request.id, selectedStatus, notes);
    if (success) {
      onClose();
    }
    setIsUpdating(false);
  };

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Detalhes do Pedido</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações do Cliente */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium text-gray-900">{request.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{request.customer_email}</p>
                </div>
              </div>
              {request.customer_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium text-gray-900">{request.customer_phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Data do Pedido</p>
                  <p className="font-medium text-gray-900">
                    {new Date(request.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Atual */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status Atual</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                {getStatusText(request.status)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Última Atualização</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(request.updated_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Imagens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Imagem Original */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">Imagem Original</h4>
                <button
                  onClick={() => handleDownloadImage(
                    request.original_image_url, 
                    `original_${request.customer_name}_${request.id}.jpg`
                  )}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Download</span>
                </button>
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={request.original_image_url}
                  alt="Imagem original"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBIMTMwVjEzMEgxMDBWNzBaIiBmaWxsPSIjOUI5QkE0Ii8+CjxwYXRoIGQ9Ik03MCA3MEgxMDBWMTMwSDcwVjcwWiIgZmlsbD0iIzlCOUJBNCIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
            </div>

            {/* Imagem Restaurada */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">Imagem Restaurada</h4>
                {request.restored_image_url && (
                  <button
                    onClick={() => handleDownloadImage(
                      request.restored_image_url!, 
                      `restored_${request.customer_name}_${request.id}.jpg`
                    )}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Download</span>
                  </button>
                )}
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {request.restored_image_url ? (
                  <img
                    src={request.restored_image_url}
                    alt="Imagem restaurada"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBIMTMwVjEzMEgxMDBWNzBaIiBmaWxsPSIjOUI5QkE0Ii8+CjxwYXRoIGQ9Ik03MCA3MEgxMDBWMTMwSDcwVjcwWiIgZmlsbD0iIzlCOUJBNCIvPgo8L3N2Zz4K';
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Imagem restaurada não disponível</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notas Existentes */}
          {request.notes && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Notas</h4>
                  <p className="text-sm text-blue-800">{request.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Atualizar Status */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Atualizar Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Novo Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as RestorationRequest['status'])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pendente</option>
                  <option value="processing">Processando</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Adicione observações sobre este pedido..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleUpdateStatus}
              disabled={isUpdating}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Atualizando...' : 'Atualizar Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}