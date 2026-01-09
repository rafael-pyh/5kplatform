'use client';

import ImageUpload from '@/components/ImageUpload';
import LeadHeader from '@/components/lead/LeadHeader';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import useNewLeadForm from '@/hooks/useNewLeadForm';

export default function NewLeadForm() {
  const {
    methods,
    isLoading,
    isValidating,
    sellerName,
    energyBill,
    setEnergyBill,
    roofPhoto,
    setRoofPhoto,
    onSubmit,
    states,
    cities,
    formState,
    setFormState,
  } = useNewLeadForm();

  const { register, handleSubmit, formState: { errors } } = methods;

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-transparent to-green-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Validando QR Code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-transparent to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <LeadHeader sellerName={sellerName} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex w-full gap-2">
              <div className="w-1/2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Nome é obrigatório', minLength: { value: 3, message: 'Nome deve ter no mínimo 3 caracteres' } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="João da Silva"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div className="w-1/2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  {...register('email', { pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email inválido' } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="seu@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                id="phone"
                type="tel"
                {...register('phone', { pattern: { value: /^[\d\s\(\)\-\+]+$/, message: 'Telefone inválido' } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="(11) 98765-4321"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              <p className="mt-1 text-xs text-gray-500">* Forneça pelo menos um meio de contato (email ou telefone)</p>
            </div>
            <div className="grid grid-cols-2 gap-4">  
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">Estado <span className="text-red-500">*</span></label>
                <select
                  id="state"
                  value={formState.state}
                  onChange={(e) => setFormState({ ...formState, state: e.target.value, city: '' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Selecione um estado</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.abbreviation}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">Cidade <span className="text-red-500">*</span></label>
                <CityAutocomplete
                  cities={cities}
                  value={formState.city}
                  onChange={(cityName) => setFormState({ ...formState, city: cityName })}
                  placeholder="Selecione uma cidade"
                  disabled={!formState.state}
                />
              </div>
            </div>

            <ImageUpload label="Foto da conta de energia" value={energyBill} onChange={setEnergyBill} />
            <ImageUpload label="Foto do telhado" value={roofPhoto} onChange={setRoofPhoto} />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800"><strong>🔒 Seus dados estão seguros:</strong> As informações fornecidas serão utilizadas apenas para entrar em contato sobre a instalação de energia solar.</p>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-linear-to-r from-blue-500 via-blue-400 to-green-500 text-white py-4 rounded-lg font-medium text-lg hover:from-blue-600 hover:via-blue-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg">
              {isLoading ? 'Enviando...' : 'Enviar cadastro'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2025 5K Energia Solar - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}
