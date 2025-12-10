"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "react-hot-toast";
import { confirmEmailAction } from "../actions/auth";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Token inválido ou ausente.");
      router.push("/");
      return;
    }

    const confirmEmail = async () => {
      try {
        const response = await confirmEmailAction(token!);
        toast.success(response.message || "Email confirmado com sucesso!");
        setSuccess(true);
      } catch (error: any) {
        console.error("Erro ao confirmar email:", error);
        toast.error(
          error.message || "Erro ao confirmar email. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-green-500 text-white">
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-500 to-green-500 text-white">
      <h1 className="text-3xl font-bold mb-4">Erro ao confirmar email</h1>
      <p className="text-lg mb-6">O token pode ter expirado ou já foi utilizado.</p>
      <button
        onClick={() => router.push("/login")}
        className="px-6 py-3 bg-white text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-100"
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