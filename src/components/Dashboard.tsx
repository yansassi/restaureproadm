import React from 'react';
import { RestorationRequest } from '../lib/supabase';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  PlayCircle,
  TrendingUp,
  Users,
  Image,
  DollarSign
} from 'lucide-react';

interface DashboardProps {
  requests: RestorationRequest[];
}

export function Dashboard({ requests }: DashboardProps) {
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0';

  // Calcular receita total
  const totalRevenue = requests.reduce((sum, request) => {
    return sum + (request.plan_price ? Number(request.plan_price) : 0);
  }, 0);

  const completedRevenue = requests
    .filter(r => r.status === 'completed')
    .reduce((sum, request) => {
      return sum + (request.plan_price ? Number(request.plan_price) : 0);
    }, 0);
  const statCards = [
    {
      title: 'Total de Pedidos',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Receita Total',
      value: `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Pendentes',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Concluídos',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span className="text-green-700 font-medium">Taxa de Conclusão: {completionRate}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pedidos Recentes */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Pedidos Recentes</h2>
        </div>
        <div className="p-6">
          {requests.slice(0, 5).length > 0 ? (
            <div className="space-y-4">
              {requests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Image className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{request.customer_name}</p>
                      <p className="text-sm text-gray-500">{request.customer_email}</p>
                      {request.plan_name && (
                        <p className="text-xs text-gray-400">{request.plan_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {request.plan_price && (
                      <span className="text-sm font-semibold text-green-600">
                        R$ {Number(request.plan_price).toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status === 'completed' ? 'Concluído' :
                       request.status === 'processing' ? 'Processando' :
                       request.status === 'pending' ? 'Pendente' : 'Cancelado'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum pedido encontrado</p>
          )}
        </div>
      </div>
    </div>
  );
}