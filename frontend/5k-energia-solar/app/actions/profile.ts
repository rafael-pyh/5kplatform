import { personService } from "../../lib/services/person.service";

export const updateProfileAction = async (sellerId: string, formData: any) => {
  try {
    const response = await personService.update(sellerId, formData);
    return response;
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
};
