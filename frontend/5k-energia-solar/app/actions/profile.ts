export const updateProfileAction = async (sellerId: string, formData: any) => {
  try {
    const response = await api.put(`/seller/${sellerId}`, formData);
    return response;
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
};
