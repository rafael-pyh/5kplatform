import { Router } from "express";
import { createPerson } from "../services/person.service";
import { sendVerificationEmail } from "../utils/email";
import crypto from "crypto";

const manualRegisterRouter = Router();

manualRegisterRouter.post("/manual-register", async (req, res) => {
  try {
    const { name, email, password, phone, pixKey, photoBase64, city, state } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email é obrigatório." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

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

    await sendVerificationEmail(email, name, verificationToken);

    return res.status(201).json({
      message: "Usuário registrado com sucesso. Verifique seu email para ativação.",
    });
  } catch (error) {
    console.error("Erro ao registrar usuário manualmente:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
});

export default manualRegisterRouter;