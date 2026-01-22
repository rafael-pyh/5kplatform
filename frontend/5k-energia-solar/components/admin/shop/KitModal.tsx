'use client';

import {
  Kit,
  Product,
  CreateKitDTO,
  UpdateKitDTO,
  KitItem,
} from '@/lib/types/shop.types';
import ResponsiveModal from '@/components/ResponsiveModal';
import { useState, useEffect } from 'react';
import { shopService } from '@/lib/services/shop.service';
import ConfirmationModal from '@/components/ConfirmationModal';
import { ImageUploadModal } from '@/components/admin/shop/ImageUploadModal';

interface KitModalProps {
  isOpen: boolean;
  kit?: Kit | null;
  products: Product[];
  onClose: () => void;
  onSubmit: (data: CreateKitDTO | UpdateKitDTO) => Promise<Kit | void>;
  onImageUpload?: (kitId: string) => void;
  onImageUploaded?: () => void;
}

export function KitModal({
  isOpen,
  kit,
  products,
  onClose,
  onSubmit,
  onImageUpload,
  onImageUploaded,
}: KitModalProps) {
  const [formData, setFormData] = useState<Partial<CreateKitDTO> & { tagArray?: string[] }>({
    name: kit?.name || '',
    price: kit?.price || 0,
    description: kit?.description || '',
    sku: kit?.sku || '',
    tags: kit?.tags || '',
    tagArray: kit?.tags ? kit.tags.split(',').map(t => t.trim()) : [],
    items: kit?.items?.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      notes: item.notes,
    })) || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    if (kit) {
      setFormData({
        name: kit.name || '',
        price: kit.price || 0,
        description: kit.description || '',
        sku: kit.sku || '',
        tags: kit.tags || '',
        tagArray: kit.tags ? kit.tags.split(',').map(t => t.trim()) : [],
        items: kit.items?.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })) || [],
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        description: '',
        sku: '',
        tags: '',
        tagArray: [],
        items: [],
      });
    }
    setShowDeleteConfirmation(false);
    setSelectedImageFile(null);
    setShowImageUpload(false);
  }, [kit]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tagArray = formData.tagArray || [];
      if (!tagArray.includes(tagInput.trim())) {
        setFormData((prev) => {
          const newTagArray = [...tagArray, tagInput.trim()];
          return {
            ...prev,
            tagArray: newTagArray,
            tags: newTagArray.join(', '),
          };
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => {
      const newTagArray = prev.tagArray?.filter((t) => t !== tag) || [];
      return {
        ...prev,
        tagArray: newTagArray,
        tags: newTagArray.join(', '),
      };
    });
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      setError('Selecione um produto');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) {
      setError('Produto não encontrado');
      return;
    }

    // Verificar se produto já está no kit
    const itemIndex = formData.items?.findIndex(
      (item) => item.productId === selectedProduct
    );

    if (itemIndex !== undefined && itemIndex >= 0) {
      // Atualizar quantidade
      const newItems = [...(formData.items || [])];
      newItems[itemIndex].quantity += selectedQuantity;
      setFormData((prev) => ({ ...prev, items: newItems }));
    } else {
      // Adicionar novo item
      setFormData((prev) => ({
        ...prev,
        items: [
          ...(prev.items || []),
          {
            productId: selectedProduct,
            quantity: selectedQuantity,
          },
        ],
      }));
    }

    setSelectedProduct('');
    setSelectedQuantity(1);
    setError(null);
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...(formData.items || [])];
    newItems[index].quantity = Math.max(1, quantity);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name?.trim()) {
      setError('Nome do kit é obrigatório');
      return;
    }

    if (formData.price! <= 0) {
      setError('Preço deve ser maior que 0');
      return;
    }

    if (!formData.items || formData.items.length === 0) {
      setError('Adicione pelo menos um produto ao kit');
      return;
    }

    setIsSubmitting(true);
    try {
      // Atribuir automaticamente a primeira imagem dos produtos ao kit
      let kitImageUrl = kit?.imageUrl; // Manter imagem existente se houver

      if (!kitImageUrl && formData.items && formData.items.length > 0) {
        // Procurar a primeira imagem disponível nos produtos do kit
        for (const item of formData.items) {
          const product = products.find(p => p.id === item.productId);
          if (product?.images && product.images.length > 0) {
            // Pegar a primeira imagem ordenada por order
            const firstImage = product.images.sort((a, b) => a.order - b.order)[0];
            kitImageUrl = firstImage.imageUrl;
            break; // Usar apenas a primeira imagem encontrada
          }
        }
      }

      // Remove the tagArray before sending
      const dataToSubmit: any = { ...formData };
      delete dataToSubmit.tagArray;

      // Incluir a imagem do kit se encontrada
      if (kitImageUrl) {
        dataToSubmit.imageUrl = kitImageUrl;
      }
      
      const result = await onSubmit(dataToSubmit as CreateKitDTO);

      // Se é kit novo e há imagem selecionada, fazer upload
      if (!kit && selectedImageFile && result) {
        try {
          const formData = new FormData();
          formData.append('image', selectedImageFile);
          await shopService.kits.uploadImage(result.id, formData);
        } catch (uploadErr: any) {
          console.error('Erro ao fazer upload da imagem:', uploadErr);
          // Não falhar o salvamento por causa do upload
        }
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar kit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelDeleteImage = () => {
    setShowDeleteConfirmation(false);
  };

  const handleConfirmDeleteImage = async () => {
    if (!kit) return;

    try {
      // Para kits, vamos apenas remover a referência da imagem
      // Isso pode ser feito atualizando o kit sem imageUrl
      const updateData = {
        name: kit.name,
        price: kit.price,
        description: kit.description,
        sku: kit.sku,
        tags: kit.tags,
        items: kit.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })),
        imageUrl: null, // Remove a imagem
      };

      await onSubmit(updateData as UpdateKitDTO);
      setShowDeleteConfirmation(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover imagem');
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <>
      <ResponsiveModal isOpen={isOpen} onClose={onClose} title="">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Título */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {kit ? '✏️ Editar Kit' : '📦 Novo Kit'}
          </h2>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Informações Básicas */}
        <div className="space-y-4 pb-4 border-b border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Kit *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="Ex: Kit Solar 100W Completo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Descreva o kit..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku || ''}
                onChange={handleInputChange}
                placeholder="Ex: KIT-PS-100W"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Total (R$) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price || 0}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (pressione Enter)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Ex: completo, promocao"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.tagArray && formData.tagArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tagArray.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-700 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Imagem do Kit */}
        <div className="space-y-4 pb-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Imagem do Kit</h3>

          {/* Preview da Imagem */}
          {(kit?.imageUrl || selectedImageFile) && (
            <div className="relative">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 max-w-sm">
                <img
                  src={selectedImageFile ? URL.createObjectURL(selectedImageFile) : kit?.imageUrl}
                  alt={kit?.name || 'Imagem selecionada'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (kit?.imageUrl) {
                    setShowDeleteConfirmation(true);
                  } else {
                    setSelectedImageFile(null);
                  }
                }}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700 transition-colors"
                title="Remover imagem"
              >
                ×
              </button>
            </div>
          )}

          {/* Botão de Upload */}
          {onImageUpload && (
            <div>
              <button
                type="button"
                onClick={() => {
                  if (kit) {
                    onImageUpload!(kit.id);
                  } else {
                    setShowImageUpload(true);
                  }
                }}
                className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                📷 {selectedImageFile ? 'Alterar Imagem' : kit?.imageUrl ? 'Alterar Imagem' : 'Adicionar Imagem'}
              </button>
              {!kit?.imageUrl && !selectedImageFile && (
                <p className="text-xs text-gray-500 mt-1">
                  A primeira imagem dos produtos será usada automaticamente
                </p>
              )}
            </div>
          )}
        </div>

        {/* Adicionar Produtos */}
        <div className="space-y-4 pb-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Produtos do Kit</h3>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecione um Produto
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Escolher...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (R$ {(Number(product.price) || 0).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qtd.
              </label>
              <input
                type="number"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            ➕ Adicionar Produto
          </button>
        </div>

        {/* Lista de Produtos Adicionados */}
        {formData.items && formData.items.length > 0 && (
          <div className="space-y-2 pb-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Itens no Kit</h3>
            <div className="space-y-2">
              {formData.items.map((item, index) => {
                const product = products.find((p) => p.id === item.productId);
                const firstImage = product?.images?.sort((a, b) => a.order - b.order)[0];
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Imagem do Produto */}
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                        {firstImage ? (
                          <img
                            src={firstImage.imageUrl}
                            alt={product?.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            📦
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {product?.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          R$ {(Number(product?.price) || 0).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItemQuantity(
                            index,
                            parseInt(e.target.value) || 1
                          )
                        }
                        min="1"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      />
                      <span className="text-sm text-gray-600 w-20 text-right">
                        R$ {((Number(product?.price) || 0) * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '⏳ Salvando...' : 'Salvar Kit'}
          </button>
        </div>
      </form>
    </ResponsiveModal>

    <ConfirmationModal
      isOpen={showDeleteConfirmation}
      title="Confirmar Exclusão"
      message={`Tem certeza que deseja remover a imagem deste kit? Esta ação não pode ser desfeita.`}
      confirmText="Remover"
      cancelText="Cancelar"
      isDangerous={true}
      onConfirm={handleConfirmDeleteImage}
      onCancel={handleCancelDeleteImage}
    />

    {!kit && (
      <ImageUploadModal
        isOpen={showImageUpload}
        title="Selecionar Imagem - Kit"
        onClose={() => setShowImageUpload(false)}
        onFileSelected={(file) => {
          setSelectedImageFile(file);
          setShowImageUpload(false);
        }}
      />
    )}
    </>
  );
}
