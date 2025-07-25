import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { RequestsList } from './components/RequestsList';
import { RequestModal } from './components/RequestModal';
import { useRestorationRequests } from './hooks/useRestorationRequests';
import { RestorationRequest } from './lib/supabase';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RestorationRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { requests, loading, error, refetch, updateRequestStatus } = useRestorationRequests();

  console.log('App rendered - activeTab:', activeTab, 'requests count:', requests.length, 'loading:', loading, 'error:', error);

  const handleViewRequest = (request: RestorationRequest) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setModalOpen(false);
  };

  const handleUpdateStatus = async (id: string, status: RestorationRequest['status'], notes?: string) => {
    const success = await updateRequestStatus(id, status, notes);
    if (success) {
      handleCloseModal();
    }
    return success;
  };

  const handleTabChange = (tab: 'dashboard' | 'requests') => {
    console.log('Tab change requested:', tab);
    setActiveTab(tab);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Carregando painel administrativo...</p>
          <p className="text-sm text-gray-500">Conectando com o Supabase</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Tentar novamente</span>
          </button>
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-left">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Possíveis soluções:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Verifique se a tabela 'restoration_requests' existe no Supabase</li>
              <li>• Confirme se as credenciais do Supabase estão corretas</li>
              <li>• Verifique as políticas RLS da tabela</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8">
          {console.log('Rendering content for tab:', activeTab)}
          {activeTab === 'dashboard' && <Dashboard requests={requests} />}
          {activeTab === 'requests' && (
            <RequestsList
              requests={requests}
              onViewRequest={handleViewRequest}
              onUpdateStatus={updateRequestStatus}
            />
          )}
        </div>
      </div>

      <RequestModal
        request={selectedRequest}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

export default App;