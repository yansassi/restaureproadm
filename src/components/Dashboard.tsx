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
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Package
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

  // Calcular total de taxas e lucro real
  const totalFees = requests.reduce((sum, request) => {
    return sum + request.payment_fee;
  }, 0);

  const totalRealProfit = requests.reduce((sum, request) => {
    return sum + request.real_profit;
  }, 0);

  const completedRealProfit = requests
    .filter(r => r.status === 'completed')
    .reduce((sum, request) => {
      return sum + request.real_profit;
    }, 0);

  // Calcular pedidos do mês atual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRequests = requests.filter(r => {
    const requestDate = new Date(r.created_at);
    return requestDate.getMonth() === currentMonth && requestDate.getFullYear() === currentYear;
  });

  const monthlyRevenue = monthlyRequests.reduce((sum, request) => {
    return sum + (request.plan_price ? Number(request.plan_price) : 0);
  }, 0);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const statCards = [
    {
      title: 'Total de Pedidos',
      value: stats.total.toString(),
      subtitle: `${monthlyRequests.length} este mês`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: monthlyRequests.length > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Receita Total',
      value: formatCurrency(totalRevenue),
      subtitle: `${formatCurrency(monthlyRevenue)} este mês`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: monthlyRevenue > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Lucro Real',
      value: formatCurrency(totalRealProfit),
      subtitle: `${formatCurrency(completedRealProfit)} concluído`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: completedRealProfit > 0 ? 'up' : 'down'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${completionRate}%`,
      subtitle: `${stats.completed} de ${stats.total} pedidos`,
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: Number(completionRate) > 50 ? 'up' : 'down'
    }
  ];

  const statusCards = [
    {
      title: 'Pendentes',
      value: stats.pending,
      icon: Clock,
      color: 'from-yellow-400 to-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      title: 'Processando',
      value: stats.processing,
      icon: PlayCircle,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Concluídos',
      value: stats.completed,
      icon: CheckCircle,
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Cancelados',
      value: stats.cancelled,
      icon: XCircle,
      color: 'from-red-400 to-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Visão geral do seu negócio de restauração de imagens</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {new Date().toLocaleDateString('pt-BR', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Principais Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {stat.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
                {stat.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status dos Pedidos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Status dos Pedidos</h2>
          <div className="text-sm text-gray-500">
            Total: {stats.total} pedidos
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((status, index) => (
            <div key={index} className={`${status.bgColor} rounded-xl p-4 border border-opacity-20`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${status.color}`}>
                  <status.icon className="h-5 w-5 text-white" />
                </div>
                <span className={`text-2xl font-bold ${status.textColor}`}>
                  {status.value}
                </span>
              </div>
              <p className={`text-sm font-medium ${status.textColor}`}>
                {status.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-1">Receita Total</h3>
          <p className="text-3xl font-bold text-green-700 mb-2">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-green-600">
            {formatCurrency(completedRevenue)} confirmado
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <ArrowDownRight className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-1">Total de Taxas</h3>
          <p className="text-3xl font-bold text-red-700 mb-2">{formatCurrency(totalFees)}</p>
          <p className="text-sm text-red-600">
            Custos operacionais
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-emerald-900 mb-1">Lucro Líquido</h3>
          <p className="text-3xl font-bold text-emerald-700 mb-2">{formatCurrency(totalRealProfit)}</p>
          <p className="text-sm text-emerald-600">
            {formatCurrency(completedRealProfit)} realizado
          </p>
        </div>
      </div>

      {/* Pedidos Recentes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Pedidos Recentes</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Últimos 5 pedidos
            </span>
          </div>
        </div>
        <div className="p-6">
          {requests.slice(0, 5).length > 0 ? (
            <div className="space-y-4">
              {requests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={request.original_image_url}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyMEgyOFYyOEgyNFYyMFoiIGZpbGw9IiM5QjlCQTQiLz4KPHA+';
                        }}
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        request.status === 'completed' ? 'bg-green-500' :
                        request.status === 'processing' ? 'bg-purple-500' :
                        request.status === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{request.customer_name}</p>
                      <p className="text-sm text-gray-500">{request.customer_email}</p>
                      {request.plan_name && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Package className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{request.plan_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {request.plan_price && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600 block">
                          {formatCurrency(Number(request.plan_price))}
                        </span>
                        <span className={`text-xs font-medium ${request.real_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          Lucro: {formatCurrency(request.real_profit)}
                        </span>
                      </div>
                    )}
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status === 'completed' ? 'Concluído' :
                         request.status === 'processing' ? 'Processando' :
                         request.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(request.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-500 mb-2">Nenhum pedido encontrado</p>
              <p className="text-sm text-gray-400">Os pedidos aparecerão aqui quando forem criados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}