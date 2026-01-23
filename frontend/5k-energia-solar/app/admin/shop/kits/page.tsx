'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminProductCard } from '@/components/admin/shop/AdminProductCard';
import { AdminKitCard } from '@/components/admin/shop/AdminKitCard';
import { ProductModal } from '@/components/admin/shop/ProductModal';
import { KitModal } from '@/components/admin/shop/KitModal';
import { ImageUploadModal } from '@/components/admin/shop/ImageUploadModal';
import { shopService } from '@/lib/services/shop.service';
import {
  Product,
  Kit,
  CreateProductDTO,
  UpdateProductDTO,
  CreateKitDTO,
  UpdateKitDTO,
} from '@/lib/types/shop.types';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui';

export default function ShopKitsPage() {
  // Estado
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [activeTab, setActiveTab] = useState<'products' | 'kits'>('products');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showKitModal, setShowKitModal] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadType, setImageUploadType] = useState<'product' | 'kit'>('product');
  const [imageUploadId, setImageUploadId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);

  // Carregar dados
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsData, kitsData] = await Promise.all([
        shopService.products.getAll(),
        shopService.kits.getAll(),
      ]);
      setProducts(productsData);
      setKits(kitsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers de Produto
  const handleCreateProduct = async (data: CreateProductDTO): Promise<Product> => {
    try {
      const newProduct = await shopService.products.create(data);
      setProducts([...products, newProduct]);
      setShowProductModal(false);
      setSelectedProduct(null);
      return newProduct;
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateProduct = async (data: UpdateProductDTO) => {
    if (!selectedProduct) return;
    try {
      const updated = await shopService.products.update(selectedProduct.id, data);
      setProducts(
        products.map((p) => (p.id === selectedProduct.id ? updated : p))
      );
      setShowProductModal(false);
      setSelectedProduct(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleProductSubmit = async (data: CreateProductDTO | UpdateProductDTO): Promise<Product | void> => {
    if (selectedProduct) {
      await handleUpdateProduct(data as UpdateProductDTO);
      return; // Não retorna produto na edição
    } else {
      return await handleCreateProduct(data as CreateProductDTO);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await shopService.products.delete(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar produto');
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Handlers de Kit
  const handleCreateKit = async (data: CreateKitDTO): Promise<Kit> => {
    try {
      const newKit = await shopService.kits.create(data);
      setKits([...kits, newKit]);
      setShowKitModal(false);
      setSelectedKit(null);
      return newKit;
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateKit = async (data: UpdateKitDTO): Promise<Kit> => {
    if (!selectedKit) throw new Error('Kit não selecionado');
    try {
      const updated = await shopService.kits.update(selectedKit.id, data);
      setKits(kits.map((k) => (k.id === selectedKit.id ? updated : k)));
      setShowKitModal(false);
      setSelectedKit(null);
      return updated;
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteKit = async (id: string) => {
    try {
      await shopService.kits.delete(id);
      setKits(kits.filter((k) => k.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar kit');
    }
  };

  const handleEditKit = async (kit: Kit) => {
    try {
      // Buscar dados completos do kit incluindo items
      const fullKit = await shopService.kits.getById(kit.id);
      setSelectedKit(fullKit);
      setShowKitModal(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do kit');
      console.error('Erro ao carregar kit:', err);
    }
  };

  const handleKitSubmit = async (data: CreateKitDTO | UpdateKitDTO): Promise<Kit | void> => {
    if (selectedKit) {
      return await handleUpdateKit(data as UpdateKitDTO);
    } else {
      return await handleCreateKit(data as CreateKitDTO);
    }
  };

  const handleOpenProductModal = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleOpenKitModal = () => {
    setSelectedKit(null);
    setShowKitModal(true);
  };

  const handleImageUpload = (id: string, type: 'product' | 'kit') => {
    setImageUploadId(id);
    setImageUploadType(type);
    setShowImageUpload(true);
  };

  const handleImageUploadSubmit = async (file: File) => {
    if (!imageUploadId) {
      console.error('[handleImageUploadSubmit] imageUploadId não definido');
      return;
    }

    console.log('[handleImageUploadSubmit] Iniciando upload:', {
      imageUploadId,
      imageUploadType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      const formData = new FormData();
      formData.append('image', file);

      if (imageUploadType === 'product') {
        console.log('[handleImageUploadSubmit] Enviando imagem para produto:', imageUploadId);
        await shopService.productImages.add(imageUploadId, formData);
        console.log('[handleImageUploadSubmit] Imagem do produto enviada com sucesso');
      } else {
        console.log('[handleImageUploadSubmit] Enviando imagem para kit:', imageUploadId);
        await shopService.kits.uploadImage(imageUploadId, formData);
        console.log('[handleImageUploadSubmit] Imagem do kit enviada com sucesso');
      }

      // Atualizar lista após upload bem-sucedido
      console.log('[handleImageUploadSubmit] Recarregando dados...');
      await fetchData();
      
      // Fechar o modal de upload
      setShowImageUpload(false);
      setImageUploadId(null);
      
      console.log('[handleImageUploadSubmit] Upload concluído com sucesso');
    } catch (err: any) {
      console.error('[handleImageUploadSubmit] Erro no upload:', err);
      throw err;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-700">
              Gestão de Produtos e Kits
            </h1>
            <p className="text-gray-600 mt-1">
              Adicione produtos e monte seus kits de venda
            </p>
          </div>

          {/* Erro Global */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Produtos ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('kits')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'kits'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Kits ({kits.length})
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-lg h-80 animate-pulse"
                ></div>
              ))}
            </div>
          )}

          {/* Produtos */}
          {!loading && activeTab === 'products' && (
            <div className="space-y-6">
              <Button
                onClick={handleOpenProductModal}
                variant='outline-blue'
                className="w-fit flex gap-1 items-center"
              >
                <Icon icon="bi-plus-lg" className="w-5 h-5 inline-block mr-2" />
                <span>Novo Produto</span>
              </Button>

              {products.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum produto
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comece a adicionar produtos à sua loja
                  </p>
                  <button
                    onClick={handleOpenProductModal}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Criar Primeiro Produto
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <AdminProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                      onImageUpload={(id) => handleImageUpload(id, 'product')}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Kits */}
          {!loading && activeTab === 'kits' && (
            <div className="space-y-6">
              <Button
                onClick={handleOpenKitModal}
                variant='outline-green'
                className="w-auto flex gap-1 items-center"
                disabled={products.length === 0}
              >
                <Icon icon="bi-plus-lg" className="w-5 h-5 inline-block mr-2" />
                <span>Novo Kit</span>
              </Button>

              {products.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-700">
                    ⚠️ Adicione produtos primeiro para criar kits
                  </p>
                </div>
              )}

              {kits.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M7 12v10m6-10v10"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum kit
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Monte seus primeiros kits de produtos
                  </p>
                  {products.length > 0 && (
                    <button
                      onClick={handleOpenKitModal}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Criar Primeiro Kit
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kits.map((kit) => (
                    <AdminKitCard
                      key={kit.id}
                      kit={kit}
                      onEdit={handleEditKit}
                      onDelete={handleDeleteKit}
                      onImageUpload={(id) => handleImageUpload(id, 'kit')}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modais */}
        <ProductModal
          isOpen={showProductModal}
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleProductSubmit}
          onImageUpload={(productId) => handleImageUpload(productId, 'product')}
          onImageUploaded={async () => {
            // Recarregar dados para atualizar as imagens do produto
            await fetchData();
            // Atualizar o selectedProduct com os dados mais recentes
            const updatedProduct = products.find(p => p.id === selectedProduct?.id);
            if (updatedProduct) {
              setSelectedProduct(updatedProduct);
            }
          }}
        />

        <KitModal
          isOpen={showKitModal}
          kit={selectedKit}
          products={products}
          onClose={() => {
            setShowKitModal(false);
            setSelectedKit(null);
          }}
          onSubmit={handleKitSubmit}
          onImageUpload={(kitId) => handleImageUpload(kitId, 'kit')}
          onImageUploaded={async () => {
            // Recarregar dados para atualizar as imagens
            await fetchData();
            // Se estamos editando um kit, atualizar o selectedKit
            if (showKitModal && selectedKit) {
              const updatedKit = kits.find(k => k.id === selectedKit.id);
              if (updatedKit) {
                setSelectedKit(updatedKit);
              }
            }
          }}
        />

        <ImageUploadModal
          isOpen={showImageUpload}
          title={`Enviar Imagem - ${imageUploadType === 'product' ? 'Produto' : 'Kit'}`}
          onClose={() => {
            setShowImageUpload(false);
            setImageUploadId(null);
          }}
          onUpload={handleImageUploadSubmit}
          onUploaded={async () => {
            // Recarregar dados para atualizar as imagens
            await fetchData();
            // Se estamos editando um produto, atualizar o selectedProduct
            if (showProductModal && selectedProduct) {
              const updatedProduct = products.find(p => p.id === selectedProduct.id);
              if (updatedProduct) {
                setSelectedProduct(updatedProduct);
              }
            }
          }}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
