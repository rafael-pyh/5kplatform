'use client';

import DashboardLayout from '@/components/DashboardLayout';
import SellerDashboardLayout from '@/components/SellerDashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { KitCard } from '@/components/shop/KitCard';
import { ProductCard } from '@/components/shop/ProductCard';
import ShopTabs from '@/components/shop/ShopTabs';
import { OrderModal } from '@/components/shop/OrderModal';
import { useShop } from '@/hooks/useShop';
import { useAuth } from '@/contexts/AuthContext';
import { Kit, Product } from '@/lib/types/shop.types';
import { useState } from 'react';

export default function ShopPage() {
  const { kits, products, loading } = useShop();
  const { user } = useAuth();
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'kits' | 'products'>('kits');

  const handleOrderSuccess = (orderCode: string) => {
    setOrderSuccess(orderCode);
    setShowOrderModal(false);
    setSelectedKit(null);
    setSelectedProduct(null);
    // Reset mensagem depois de 5 segundos
    setTimeout(() => setOrderSuccess(null), 5000);
  };

  const handleProductOrder = (product: Product) => {
    setSelectedProduct(product);
    setShowOrderModal(true);
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
            <h1 className="text-2xl font-bold text-slate-700">Loja</h1>
            <p className="text-gray-600">Kits e produtos disponíveis para solicitação</p>
          </div>

          {/* Mensagem de sucesso */}
          {orderSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-2">✓ Pedido criado com sucesso!</p>
              <p className="text-lg font-mono font-bold text-green-700 mb-3">Número do pedido: {orderSuccess}</p>
            </div>
          )}

          {/* Tabs */}
          <ShopTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            kitsCount={kits.length}
            productsCount={products.length}
          />

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-96 animate-pulse"></div>
              ))}
            </div>
          )}

          {/* Kits Tab Content */}
          {!loading && activeTab === 'kits' && (
            <div>
              {kits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📦</div>
                  <p className="text-gray-600 text-lg">Nenhum kit disponível no momento</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kits.map((kit) => (
                    <KitCard
                      key={kit.id}
                      kit={kit}
                      onOrderClick={(kit) => {
                        setSelectedKit(kit);
                        setShowOrderModal(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Products Tab Content */}
          {!loading && activeTab === 'products' && (
            <div>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-gray-600 text-lg">Nenhum produto disponível no momento</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOrderClick={handleProductOrder}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        <OrderModal
          kit={selectedKit}
          product={selectedProduct}
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedKit(null);
            setSelectedProduct(null);
          }}
          onSuccess={handleOrderSuccess}
        />
      </LayoutComponent>
    </ProtectedRoute>
  );
}
