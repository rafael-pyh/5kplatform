"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "react-hot-toast";
import { confirmEmailAction, resendVerificationEmailAction } from "../actions/auth";
import { Button } from "@/components/ui";
import Image from "next/image";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setError("Token inválido ou ausente.");
        toast.error("Token inválido ou ausente.");
        setLoading(false);
        return;
      }

      try {
        const response = await confirmEmailAction(token);
        toast.success(response.message || "Email confirmado com sucesso!");
        setSuccess(true);

      } catch (error: any) {
        console.error("[ConfirmEmailContent] Erro ao confirmar email:", error);
        const errorMessage = error.message || "Erro ao confirmar email. Tente novamente.";
        setError(errorMessage);
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-green-50 p-4 text-slate-800">
        <p className="text-lg">Confirmando seu email...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-green-50 p-4 text-slate-800">
        <h1 className="text-3xl font-bold mb-4">Email confirmado com sucesso!</h1>
        <p className="text-lg mb-6">Seu perfil está em análise em breve você receberá um e-mail com mais informações</p>
        <Button
          onClick={() => router.push("/login")}
          variant="gradient"
        >
          Ir para o Login
        </Button>
      </div>
    );
  }

  return (
    <div className="text-slate-800 min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-green-50 p-4">
      <Image
        src="/5klogo.png"
        alt="5K Energia Solar"
        width={160}
        height={160}
        className="mb-8"
      />
      <h1 className="text-3xl font-bold mb-4">Erro ao confirmar email</h1>
      {error && (
        <div className="mb-6 p-4 text-red-500 border border-red-500 bg-opacity-75 rounded-lg max-w-md w-full text-center">
          <p className="text-red-500">Erro ao confirmar email:</p>
          <p className="font-medium">Token inválido ou expirado.</p>
        </div>
      )}
      
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

        <Button
          onClick={handleResendEmail}
          disabled={resendingEmail || !email.trim()}
          variant="gradient"
          className="w-full"
        >
          {resendingEmail ? "Enviando..." : "Resolicitar email"}
        </Button>
      </div>

      <Button
        onClick={() => router.push("/login")}
        variant="outline-green"
        className="mt-6"
      >
        Ir para o Login
      </Button>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-green-50 p-4 text-slate-800">
          <p className="text-lg">Carregando...</p>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}