import { toast } from "react-hot-toast";
import { personService } from "../../lib/services/person.service";

export const registerAction = async (formData: any) => {
  try {
    const response = await personService.create(formData);
    toast.success("Registro criado com sucesso! QR Code gerado.");
    return response;
  } catch (error: any) {
    console.error("Erro ao criar registro:", error);
    toast.error(
      error.response?.data?.message ||
        error.message ||
        "Erro ao criar registro."
    );
    throw error;
  }
};