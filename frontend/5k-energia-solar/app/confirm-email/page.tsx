"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "react-hot-toast";
import { confirmEmailAction, resendVerificationEmailAction } from "../actions/auth";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setError(true);
        toast.error("Token inválido ou ausente.");
        setLoading(false);
        return;
      }

      try {
        const response = await confirmEmailAction(token);
        toast.success(response.message || "Email confirmado com sucesso!");
        setSuccess(true);

      } catch (error: any) {
        console.error("Erro ao confirmar email:", error);
        setError(true);
        toast.error(
          "Erro ao confirmar email. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [token]);

  const handleResendEmail = async () => {
    if (!email.trim()) {
      toast.error("Por favor, insira seu email");
      return;
    }

    setResendingEmail(true);
    try {
      const response = await resendVerificationEmailAction(email);
      toast.success(response.message || "Email enviado com sucesso!", { duration: 8000 });
      setEmail("");
    } catch (error: any) {
      toast.error("Erro ao resolicitar email");
    } finally {
      setResendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-green-50 text-white">
        <p className="text-lg">Confirmando seu email...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-500 to-green-500 text-white">
        <h1 className="text-3xl font-bold mb-4">Email confirmado com sucesso!</h1>
        <p className="text-lg mb-6">Seu perfil está em análise em breve você receberá um e-mail com mais informações</p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-white text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-100"
        >
          Ir para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-500 to-green-500 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Erro ao confirmar email</h1>
      <p className="text-lg mb-8">O token pode ter expirado ou já foi utilizado.</p>
      
      <div className="bg-white text-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Resolicitar email de verificação</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleResendEmail();
              }
            }}
            placeholder="seu@email.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={resendingEmail}
          />
        </div>

        <button
          onClick={handleResendEmail}
          disabled={resendingEmail || !email.trim()}
          className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
        >
          {resendingEmail ? "Enviando..." : "Resolicitar email"}
        </button>
      </div>

      <button
        onClick={() => router.push("/login")}
        className="mt-6 px-6 py-3 bg-white text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-100"
      >
        Ir para o Login
      </button>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-green-500 text-white">
          <p className="text-lg">Carregando...</p>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}