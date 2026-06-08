import { CollaborationRequest } from '../types';

export const collaborationRequests: CollaborationRequest[] = [
  {
    id: 'req1',
    investorId: 'i1',
    entrepreneurId: 'e1',
    message: 'I\'d like to explore potential investment in TechWave AI. Your AI-driven financial analytics platform aligns well with my investment thesis.',
    status: 'pending',
    createdAt: '2023-08-10T15:30:00Z',
    meetingDate: '2024-06-10',
    meetingTime: '11:00 AM',
    initiatorRole: 'investor'
  },
  {
    id: 'req2',
    investorId: 'i2',
    entrepreneurId: 'e1',
    message: 'Interested in discussing how TechWave AI can incorporate sustainable practices. Let\'s connect to explore potential collaboration.',
    status: 'accepted',
    createdAt: '2023-08-05T11:45:00Z',
    meetingDate: '2024-06-05',
    meetingTime: '03:00 PM',
    initiatorRole: 'investor'
  },
  {
    id: 'req3',
    investorId: 'i3',
    entrepreneurId: 'e3',
    message: 'Your HealthPulse platform addresses a critical need in mental healthcare. I\'d like to learn more about your traction and roadmap.',
    status: 'pending',
    createdAt: '2023-08-12T09:20:00Z',
    meetingDate: '2024-06-12',
    meetingTime: '01:30 PM',
    initiatorRole: 'investor'
  },
  {
    id: 'req4',
    investorId: 'i2',
    entrepreneurId: 'e2',
    message: 'GreenLife\'s biodegradable packaging solutions align with my focus on sustainable investments. Let\'s discuss scaling possibilities.',
    status: 'accepted',
    createdAt: '2023-07-28T14:15:00Z',
    meetingDate: '2024-06-03',
    meetingTime: '04:15 PM',
    initiatorRole: 'investor'
  },
  {
    id: 'req5',
    investorId: 'i1',
    entrepreneurId: 'e4',
    message: 'Your UrbanFarm concept is fascinating. I\'m interested in learning more about your IoT implementation and market validation.',
    status: 'rejected',
    createdAt: '2023-08-03T16:50:00Z',
    meetingDate: '2024-06-01',
    meetingTime: '10:00 AM',
    initiatorRole: 'investor'
  }
];

// Helper function to get collaboration requests for an entrepreneur
export const getRequestsForEntrepreneur = (entrepreneurId: string): CollaborationRequest[] => {
  return collaborationRequests
    .filter(request => request.entrepreneurId === entrepreneurId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Helper function to get collaboration requests sent by an investor
export const getRequestsFromInvestor = (investorId: string): CollaborationRequest[] => {
  return collaborationRequests
    .filter(request => request.investorId === investorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Helper function to update a collaboration request status
export const updateRequestStatus = (requestId: string, newStatus: 'pending' | 'accepted' | 'rejected'): CollaborationRequest | null => {
  const requestIndex = collaborationRequests.findIndex(req => req.id === requestId);
  if (requestIndex === -1) return null;
  
  collaborationRequests[requestIndex] = {
    ...collaborationRequests[requestIndex],
    status: newStatus
  };
  
  return collaborationRequests[requestIndex];
};

// Helper function to create a new collaboration request
export const createCollaborationRequest = (
  investorId: string,
  entrepreneurId: string,
  message: string,
  meetingDate?: string,
  meetingTime?: string,
  initiatorRole: 'investor' | 'entrepreneur' = 'investor'
): CollaborationRequest => {
  const newRequest: CollaborationRequest = {
    id: `req${collaborationRequests.length + 1}`,
    investorId,
    entrepreneurId,
    message,
    status: 'pending',
    createdAt: new Date().toISOString(),
    meetingDate,
    meetingTime,
    initiatorRole
  };
  
  collaborationRequests.push(newRequest);
  return newRequest;
};