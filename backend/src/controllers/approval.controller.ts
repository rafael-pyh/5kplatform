import { Request, Response } from 'express';
import { Person } from '../models/Person';
import { sendApprovalOrRejectionEmail } from '../utils/email';

export const approveSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const seller = await Person.findByPk(id);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    seller.approvalStatus = 'approved';
    await seller.save();

    if (!seller.email || !seller.name) {
      return res.status(400).json({ message: 'Seller does not have a valid email or name' });
    }

    // Enviar e-mail de aprovação
    const subject = 'Parabéns, você foi aprovado!';
    const message = 'Parabéns, você foi aprovado para ser parceiro. Agora você poderá logar na plataforma e usar o QR Code para captar novos clientes.';
    const buttonText = 'Acessar Plataforma';
    const buttonUrl = `${process.env.FRONTEND_URL}/login`;

    await sendApprovalOrRejectionEmail(seller.email, seller.name, subject, message, buttonText, buttonUrl);

    return res.status(200).json({ message: 'Seller approved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const rejectSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const seller = await Person.findByPk(id);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    seller.approvalStatus = 'rejected';
    await seller.save();

    if (!seller.email || !seller.name) {
      return res.status(400).json({ message: 'Seller does not have a valid email or name' });
    }

    // Enviar e-mail de rejeição
    const subject = 'Infelizmente, seu perfil não foi aprovado';
    const message = 'Não foi dessa vez. Infelizmente, por critérios internos ou pela localização, não podemos aprovar o seu perfil. Mas não desanime, seus dados de contato estão em nosso banco de dados, no fuuturo poderemos entrar em contato caso haja alguma oportunidade que se encaixe melhor ao seu perfil.';
    const buttonText = undefined;
    const buttonUrl = undefined;

    await sendApprovalOrRejectionEmail(seller.email, seller.name, subject, message, buttonText, buttonUrl);

    return res.status(200).json({ message: 'Seller rejected successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};