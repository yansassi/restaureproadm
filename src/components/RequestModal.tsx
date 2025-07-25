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
  Image as ImageIcon,
  DollarSign,
  Package,
  Hash,
  Trash2,
  Truck
} from 'lucide-react';

interface RequestModalProps {
  request: RestorationRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: RestorationRequest['status'], notes?: string) => Promise<boolean>;
  onDeleteRequest: (id: string) => Promise<boolean>;
}

export function RequestModal({ request, isOpen, onClose, onUpdateStatus, onDeleteRequest }: RequestModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<RestorationRequest['status']>('pending');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Função para criar link mailto
  const createMailtoLink = (email: string, customerName: string) => {
    const subject = encodeURIComponent('RESTAURAÇÃO DA SUA FOTO');
    const body = encodeURIComponent(`Olá, ${customerName}!

É com muita alegria que entregamos a você a versão restaurada da sua foto.
Trabalhamos com todo o cuidado para preservar as memórias e detalhes que fazem essa imagem tão especial.

🧡 Confira a foto restaurada em anexo.
Caso tenha qualquer ajuste ou dúvida, fique à vontade para responder este e-mail. Estamos aqui para garantir que você fique 100% satisfeito(a)!

Muito obrigado por confiar no nosso trabalho.
Manter viva a sua história é o que nos move.

Atenciosamente,
RestauraPRO!

Restaurando Memórias com Amor`);
    
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  if (!isOpen || !request) return null;

  // Função para formatar número de telefone para WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se não começar com 55 (código do Brasil), adiciona
    if (!cleanPhone.startsWith('55')) {
      return `55${cleanPhone}`;
    }
    
    return cleanPhone;
  };

  // Função para criar link do WhatsApp
  const createWhatsAppLink = (phone: string, customerName: string) => {
    const formattedPhone = formatPhoneForWhatsApp(phone);
    const message = encodeURIComponent(`Olá ${customerName}! Entrando em contato sobre seu pedido de restauração de imagem.`);
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };
  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    const success = await onUpdateStatus(request.id, selectedStatus, notes);
    if (success) {
      onClose();
    }
    setIsUpdating(false);
  };

  const handleDeleteRequest = async () => {
    const confirmMessage = `Tem certeza que deseja excluir o pedido de ${request.customer_name}?\n\nEsta ação não pode ser desfeita e irá:\n• Remover o registro do banco de dados\n• Excluir todas as imagens associadas\n• Remover permanentemente todos os dados`;
    
    if (window.confirm(confirmMessage)) {
      const success = await onDeleteRequest(request.id);
      if (success) {
        alert('Pedido excluído com sucesso!');
        onClose();
      } else {
        alert('Erro ao excluir pedido. Tente novamente.');
      }
    }
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
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDeleteRequest}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir pedido"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
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
                  <a
                    href={createMailtoLink(request.customer_email, request.customer_name)}
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    title="Enviar email para o cliente"
                  >
                    {request.customer_email}
                  </a>
                </div>
              </div>
              {request.customer_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <a
                      href={createWhatsAppLink(request.customer_phone, request.customer_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
                      title="Abrir conversa no WhatsApp"
                    >
                      {request.customer_phone}
                    </a>
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
              {request.order_number && (
                <div className="flex items-center space-x-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Número do Pedido</p>
                    <p className="font-medium text-gray-900">{request.order_number}</p>
                  </div>
                </div>
              )}
              {request.delivery_method && request.delivery_method.length > 0 && (
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Método de Entrega</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.delivery_method.map((method, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {method === 'email' ? 'E-mail' :
                           method === 'whatsapp' ? 'WhatsApp' :
                           method === 'download' ? 'Download' :
                           method === 'physical' ? 'Físico' :
                           method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Plano */}
          {(request.plan_name || request.plan_price || request.plan_images) && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Plano</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {request.plan_name && (
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Plano</p>
                      <p className="font-medium text-gray-900">{request.plan_name}</p>
                    </div>
                  </div>
                )}
                {request.plan_price && (
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Valor</p>
                      <p className="font-semibold text-green-700 text-lg">
                        R$ {Number(request.plan_price).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                )}
                {request.plan_images && (
                  <div className="flex items-center space-x-3">
                    <ImageIcon className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Imagens Incluídas</p>
                      <p className="font-medium text-gray-900">{request.plan_images}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
            <div className="flex items-center justify-between">
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Atualizando...' : 'Atualizar Status'}
              </button>
              <button
                onClick={handleDeleteRequest}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir Pedido</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}