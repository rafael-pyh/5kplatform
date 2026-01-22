'use client';

import { Product, CreateProductDTO, UpdateProductDTO, ProductImage } from '@/lib/types/shop.types';
import ResponsiveModal from '@/components/ResponsiveModal';
import { useState, useEffect } from 'react';
import { shopService } from '@/lib/services/shop.service';
import ConfirmationModal from '@/components/ConfirmationModal';
import Button from '@/components/ui/Button';
import { FileUpload } from '@/components/ui';
import { Icon } from '@iconify/react';

interface ProductModalProps {
  isOpen: boolean;
  product?: Product | null;
  onClose: () => void;
  onSubmit: (data: CreateProductDTO | UpdateProductDTO) => Promise<Product | void>;
  onImageUpload?: (productId: string) => void;
  onImageUploaded?: () => void;
}

export function ProductModal({
  isOpen,
  product,
  onClose,
  onSubmit,
  onImageUpload,
  onImageUploaded,
}: ProductModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    price: string;
    description: string;
    sku: string;
    stock: string;
    tags: string;
    id?: string;
    tagArray?: string[];
  }>({
    name: product?.name || '',
    price: product?.price?.toString() || '',
    description: product?.description || '',
    sku: product?.sku || '',
    stock: product?.stock?.toString() || '',
    tags: product?.tags || '',
    tagArray: product?.tags ? product.tags.split(',').map(t => t.trim()) : [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(null);

  const handleDeleteImage = (image: ProductImage) => {
    setImageToDelete(image);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDeleteImage = async () => {
    if (!product || !imageToDelete) return;

    try {
      setDeletingImages(prev => new Set(prev).add(imageToDelete.id));
      setShowDeleteConfirmation(false);
      setImageToDelete(null);

      await shopService.productImages.remove(product.id, imageToDelete.id);

      // Atualizar o produto localmente removendo a imagem
      if (product.images) {
        product.images = product.images.filter(img => img.id !== imageToDelete.id);
      }

      // Forçar re-render
      setFormData(prev => ({ ...prev }));
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar imagem');
    } finally {
      setDeletingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageToDelete.id);
        return newSet;
      });
    }
  };

  const handleCancelDeleteImage = () => {
    setShowDeleteConfirmation(false);
    setImageToDelete(null);
  };

  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        description: product.description || '',
        sku: product.sku || '',
        stock: product.stock?.toString() || '',
        tags: product.tags || '',
        tagArray: product.tags ? product.tags.split(',').map(t => t.trim()) : [],
      });
      // Reset deleting state when product changes
      setDeletingImages(new Set());
    } else {
      setFormData({
        name: '',
        price: '',
        description: '',
        sku: '',
        stock: '',
        tags: '',
        tagArray: [],
      });
      setDeletingImages(new Set());
    }
  }, [product]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Nome do produto é obrigatório');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Preço deve ser maior que 0');
      return;
    }

    setIsSubmitting(true);
    try {
      // Remove the tagArray before sending
      const dataToSubmit: any = { ...formData };
      delete dataToSubmit.tagArray;
      
      // Parse numeric fields
      dataToSubmit.price = parseFloat(dataToSubmit.price) || 0;
      dataToSubmit.stock = parseFloat(dataToSubmit.stock) || 0;
      
      // Criar o produto primeiro
      const createdProduct = await onSubmit(dataToSubmit);

      // Se há imagens selecionadas e estamos criando um novo produto,
      // fazer upload das imagens após a criação
      if (selectedImages.length > 0 && !product && createdProduct) {
        setUploadingImages(true);
        try {
          // Fazer upload de cada imagem
          for (const imageFile of selectedImages) {
            const formData = new FormData();
            formData.append('image', imageFile);
            await shopService.productImages.add(createdProduct.id, formData);
          }
          
          if (onImageUploaded) {
            onImageUploaded();
          }
        } catch (uploadErr: any) {
          console.error('Erro ao fazer upload das imagens:', uploadErr);
          setError('Produto criado, mas houve erro no upload das imagens');
          // Não falhar completamente por causa do upload
        } finally {
          setUploadingImages(false);
        }
      }

      setFormData({
        name: '',
        price: '',
        description: '',
        sku: '',
        stock: '',
        tags: '',
        tagArray: [],
      });
      setSelectedImages([]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ResponsiveModal isOpen={isOpen} onClose={onClose} title="">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Título */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Produto *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ex: Painel Solar 100W"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detalhes do produto..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleInputChange}
            placeholder="Ex: PS-100W-001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Preço e Estoque */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço (R$) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estoque
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (pressione Enter para adicionar)
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Ex: solar, energia"
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
                  <Button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    <Icon icon="bi-x-lg" />
                  </Button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Preview das Imagens Existentes (apenas edição) */}
        {product?.images && product.images.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens do Produto ({product.images.length})
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.images
                .sort((a, b) => a.order - b.order)
                .map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={image.imageUrl}
                        alt={image.description || `Imagem ${image.order}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.png'; // Fallback
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleDeleteImage(image)}
                      disabled={deletingImages.has(image.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                      title="Remover imagem"
                    >
                      {deletingImages.has(image.id) ? '⏳' : '×'}
                    </Button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      #{image.order}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Seleção de Imagens (criação) */}
        {!product && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens do Produto
            </label>
            <div className="space-y-3">
              <FileUpload
                id="image-upload"
                multiple={true}
                accept="image/*"
                onChange={(files) => {
                  if (files && files instanceof FileList) {
                    const fileArray: File[] = Array.from(files);
                    setSelectedImages(prev => [...prev, ...fileArray]);
                  }
                }}
                label="Clique para selecionar imagens"
                dragText="ou arraste arquivos aqui"
              />
              {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedImages.map((file: File, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  </div>
                  <button
                  type="button"
                  onClick={() => handleRemoveSelectedImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700 transition-colors"
                  title="Remover imagem"
                  >
                  ×
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  #{index + 1}
                  </div>
                </div>
                ))}
              </div>
              )}
            </div>
          </div>
        )}

        {/* Botão de Upload de Imagem (apenas edição) */}
        {product && onImageUpload && (
          <div className="pt-2">
            <Button
              type="button"
              variant='outline-green'
              onClick={() => onImageUpload(product.id)}
              className="w-full flex gap-2 px-4 py-2 "
            >
              <Icon icon="bi-camera" className='text-2xl'/>
              <p>Adicionar Imagem</p>
            </Button>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button 
            type="button"
            variant='outline-danger'
            onClick={onClose}
            className="flex-1 gap-2 px-4 py-2"
          >
            <Icon icon="bi-x-lg" />
            <p>Cancelar</p>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || uploadingImages}
            className="flex-1 gap-2 px-4 py-2"
          >
            {isSubmitting
              ? <><Icon icon="bi-hourglass-split" /><p>Salvando...</p></>
              : uploadingImages
              ? <><Icon icon="bi-camera" /><p>Enviando imagens...</p></>
              : <><Icon icon="bi-check-lg" /><p>Salvar</p></>}
          </Button>
        </div>
      </form>
    </ResponsiveModal>

    <ConfirmationModal
      isOpen={showDeleteConfirmation}
      title="Confirmar Exclusão"
      message={`Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.`}
      confirmText="Excluir"
      cancelText="Cancelar"
      isDangerous={true}
      isLoading={imageToDelete ? deletingImages.has(imageToDelete.id) : false}
      onConfirm={handleConfirmDeleteImage}
      onCancel={handleCancelDeleteImage}
    />
    </div>
  );
}
