import { personService } from "../../lib/services/person.service";

export const registerAction = async (formData: any) => {
  try {
    const response = await personService.create(formData);
    return response;
  } catch (error: any) {
    console.error("Erro ao criar registro:", error);
    throw error;
  }
};