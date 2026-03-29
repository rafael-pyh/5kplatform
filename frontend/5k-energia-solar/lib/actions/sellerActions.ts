import api from '../api';

export const approveSeller = async (id: string): Promise<void> => {
  const response = await api.patch(`/approval/${id}/approve`);
  if (response.status !== 200) {
    throw new Error('Failed to approve seller');
  }
};

export const rejectSeller = async (id: string): Promise<void> => {
  const response = await api.patch(`/approval/${id}/reject`);
  if (response.status !== 200) {
    throw new Error('Failed to reject seller');
  }
};

export const resendActivationEmail = async (id: string): Promise<void> => {
  const response = await api.post(`/users/${id}/resend-verification`);
  if (response.status !== 200) {
    throw new Error('Failed to resend activation email');
  }
};