"use client";

import LeadSuccessContent from '../../../components/lead/LeadSuccessContent';
import { useLeadSuccess } from '../../../hooks/useLeadSuccess';

export default function LeadSuccessPage() {
  const { remaining } = useLeadSuccess('/', 5);

  return <LeadSuccessContent remaining={remaining} />;
}
