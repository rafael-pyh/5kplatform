"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { registerAction } from "../actions/register";

const RegisterPage = () => {
  const states = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS", "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
  ];
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
    phone: "",
    pixKey: "",
    photoBase64: "",
    city: "",
    state: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    // Validar nome
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      toast.error("Email é obrigatório");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido");
      return false;
    }

    // Validar senha
    if (!formData.password) {
      toast.error("Senha é obrigatória");
      return false;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error("Senha deve ter no mínimo 6 caracteres, incluindo letras e números");
      return false;
    }

    // Validar confirmação de senha
    if (formData.password !== formData.repeatPassword) {
      toast.error("As senhas não coincidem");
      return false;
    }

    // Validar telefone
    if (!formData.phone.trim()) {
      toast.error("Telefone é obrigatório");
      return false;
    }
    const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
    const phoneClean = formData.phone.replace(/\D/g, '');
    if (!phoneRegex.test(formData.phone) || (phoneClean.length !== 10 && phoneClean.length !== 11)) {
      toast.error("Telefone inválido. Use o formato (99) 99999-9999 ou (99) 9999-9999");
      return false;
    }

    // Validar chave PIX
    if (!formData.pixKey.trim()) {
      toast.error("Chave PIX é obrigatória");
      return false;
    }

    // Validar cidade
    if (!formData.city.trim()) {
      toast.error("Cidade é obrigatória");
      return false;
    }

    // Validar estado
    if (!formData.state) {
      toast.error("Estado é obrigatório");
      return false;
    }

    // Validar foto
    if (!formData.photoBase64) {
      toast.error("Foto é obrigatória");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerAction(formData);
      toast.success("Registro criado com sucesso! QR Code gerado.");
      console.log(response);
      // router.push("/login");
    } catch (error) {
      console.error("Erro ao criar registro:", error);
      toast.error("Erro ao criar registro.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-green-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <Image
              src="/5klogo.png"
              alt="5K Energia Logo"
              width={150}
              height={80}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-thin text-gray-900">
              Energia Solar
            </h1>
            <p className="text-gray-600 mt-2">
              Crie sua conta para acessar o sistema
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nome
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Seu nome completo"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
                required
              />
            </div>
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
            {/* Repeat Password */}
            <div>
              <label
                htmlFor="repeatPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Repita a Senha
              </label>
              <input
                id="repeatPassword"
                type="password"
                name="repeatPassword"
                value={formData.repeatPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Telefone
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="(99) 99999-9999"
                required
              />
            </div>

            {/* Pix Key */}
            <div>
              <label
                htmlFor="pixKey"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Chave Pix
              </label>
              <input
                id="pixKey"
                type="text"
                name="pixKey"
                value={formData.pixKey}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Sua chave Pix"
                required
              />
            </div>
            {/* city */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cidade
              </label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Sua cidade"
                required
              />
            </div>
            {/* UF */}
            <div>
              <label
                htmlFor="uf"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Estado
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              >
                <option value="">Selecione um estado</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            {/* Photo */}
            <div>
              <label
                htmlFor="photo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Foto
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Cadastrando..." : "Cadastrar"}
            </button>
            <div className="w-full flex justify-between">
              <p>Já tem uma conta?</p>
              <Link
                href="/login"
                className="text-blue-600 hover:cursor-pointer"
              >
                Faça login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;