import { Router } from "express";
import { Person } from "../models/Person";

const emailActivationRouter = Router();

emailActivationRouter.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      console.warn('[Email Validation] Token não fornecido');
      return res.status(400).json({ message: "Token de verificação é obrigatório." });
    }

    const person = await Person.findOne({ where: { verificationToken: token } });

    if (!person) {
      console.warn('[Email Validation] Token não encontrado no banco:', token);
      return res.status(404).json({ message: "Token inválido ou expirado." });
    }

    console.log('[Email Validation] Pessoa encontrada:', {
      id: person.id,
      email: person.email,
      emailVerified: person.emailVerified,
      tokenExpiry: person.tokenExpiry,
      currentTime: new Date(),
    });

    // Verifica se o token expirou
    if (person.tokenExpiry && new Date() > person.tokenExpiry) {
      console.warn('[Email Validation] Token expirado para:', person.email);
      return res.status(400).json({ message: "Token expirado. Solicite um novo link de validação." });
    }

    person.verificationToken = undefined;
    person.emailVerified = true;
    await person.save();

    console.log('[Email Validation] Email verificado com sucesso para:', person.email);
    return res.status(200).json({ message: "Email verificado com sucesso!" });
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
});

export default emailActivationRouter;