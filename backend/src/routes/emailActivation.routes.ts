import { Router } from "express";
import { Person } from "../models/Person";

const emailActivationRouter = Router();

emailActivationRouter.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token de verificação é obrigatório." });
    }

    const person = await Person.findOne({ where: { verificationToken: token } });

    if (!person) {
      return res.status(404).json({ message: "Token inválido ou expirado." });
    }

    person.verificationToken = null;
    person.emailVerified = true;
    await person.save();

    return res.status(200).json({ message: "Email verificado com sucesso!" });
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
});

export default emailActivationRouter;