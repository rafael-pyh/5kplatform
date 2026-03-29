"use client";

import RegisterForm from '../../components/register/RegisterForm';
import { useRegister } from '../../hooks/useRegister';

const RegisterPage = () => {
  const { 
    states, 
    cities, 
    citiesLoading,
    formData, 
    handleChange, 
    handleFileChange, 
    handleSubmit, 
    isLoading,
    setFormData
  } = useRegister();

  const handleSetCity = (city: string) => {
    setFormData((prev) => ({ ...prev, city }));
  };

  return (
    <RegisterForm 
      states={states} 
      cities={cities}
      citiesLoading={citiesLoading}
      formData={formData} 
      handleChange={handleChange} 
      handleFileChange={handleFileChange}
      handleSetCity={handleSetCity}
      handleSubmit={handleSubmit} 
      isLoading={isLoading} 
    />
  );
};

export default RegisterPage;