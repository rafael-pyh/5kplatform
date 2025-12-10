import { Request, Response } from 'express';
import { Person } from '../models/Person';

export const approveSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const seller = await Person.findByPk(id);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    seller.approvalStatus = 'approved';
    await seller.save();

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

    return res.status(200).json({ message: 'Seller rejected successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};