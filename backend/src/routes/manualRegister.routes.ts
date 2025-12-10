import { Router } from "express";
import { createPerson } from "../services/person.service";
import { sendEmailConfirmation } from "../utils/email";

const manualRegisterRouter = Router();

manualRegisterRouter.post("/manual-register", async (req, res) => {
  try {
    const { name, email, password, phone, pixKey, photoBase64, city, state } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email é obrigatório." });
    }

    // createPerson já gera o verificationToken e envia o email automaticamente
    // Como tem senha, vai enviar o email de confirmação correto
    const newUser = await createPerson({
      name,
      email,
      password,
      phone,
      pixKey,
      photoBase64,
      city,
      state,
    });

    return res.status(201).json({
      message: "Usuário registrado com sucesso. Verifique seu email para ativação.",
    });
  } catch (error) {
    console.error("Erro ao registrar usuário manualmente:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
});

export default manualRegisterRouter;