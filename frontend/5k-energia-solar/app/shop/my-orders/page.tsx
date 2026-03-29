'use client';

import DashboardLayout from '@/components/DashboardLayout';
import SellerDashboardLayout from '@/components/SellerDashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { OrderCard } from '@/components/shop/OrderCard';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';

export default function MyOrdersPage() {
  const { orders, loading: ordersLoading, fetchOrders } = useOrders();
  const { user } = useAuth();

  const handleUploadSuccess = () => {
    fetchOrders();
  };

  // Determinar qual layout usar baseado no tipo de usuário
  const isSellerOrAffiliate = user?.role === 'SELLER' || user?.role === 'AFFILIATE';
  const LayoutComponent = isSellerOrAffiliate ? SellerDashboardLayout : DashboardLayout;

  return (
    <ProtectedRoute allowedRoles={['SELLER', 'AFFILIATE', 'ADMIN', 'SUPER_ADMIN']}>
      <LayoutComponent>
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-700">Meus Pedidos</h1>
            <p className="text-gray-600">Visualize seus pedidos realizados</p>
          </div>

          {/* Pedidos */}
          <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg shadow">
                  <p className="text-gray-600">Nenhum pedido realizado ainda</p>
                  <a
                    href="/shop"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver Kits Disponíveis →
                  </a>
                </div>
              ) : (
                orders.map((order) => (
                  <OrderCard key={order.id} order={order} onUploadSuccess={handleUploadSuccess} />
                ))
              )}
            </div>
        </div>
      </LayoutComponent>
    </ProtectedRoute>
  );
}
