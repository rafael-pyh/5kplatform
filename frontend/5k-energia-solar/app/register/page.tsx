"use client";

import RegisterForm from '../../components/register/RegisterForm';
import { useRegister } from '../../hooks/useRegister';

const RegisterPage = () => {
  const { states, formData, handleChange, handleFileChange, handleSubmit, isLoading } = useRegister();

  return <RegisterForm states={states} formData={formData} handleChange={handleChange} handleFileChange={handleFileChange} handleSubmit={handleSubmit} isLoading={isLoading} />;
};

export default RegisterPage;