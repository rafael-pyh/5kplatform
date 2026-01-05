import { Router } from "express";
import { createPerson } from "../services/person.service";

const manualRegisterRouter = Router();

manualRegisterRouter.post("/manual-register", async (req, res, next) => {
  try {
    const { name, email, password, phone, pixKey, photoBase64, city, state } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email é obrigatório." });
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
      success: true,
      message: "Usuário registrado com sucesso. Verifique seu email para ativação.",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
});

export default manualRegisterRouter;