import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, MessageCircle } from 'lucide-react';
import { CollaborationRequest } from '../../types';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { findUserById } from '../../data/users';
import { updateRequestStatus } from '../../data/collaborationRequests';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

interface CollaborationRequestCardProps {
  request: CollaborationRequest;
  onStatusUpdate?: (requestId: string, status: 'accepted' | 'rejected') => void;
}

export const CollaborationRequestCard: React.FC<CollaborationRequestCardProps> = ({
  request,
  onStatusUpdate
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine counterparty (the other user involved in the request)
  const isCurrentUserInvestor = user?.id === request.investorId;
  const counterparty = isCurrentUserInvestor
    ? findUserById(request.entrepreneurId)
    : findUserById(request.investorId);

  if (!counterparty) return null;
  
  const handleAccept = () => {
    updateRequestStatus(request.id, 'accepted');
    if (onStatusUpdate) {
      onStatusUpdate(request.id, 'accepted');
    }
  };
  
  const handleReject = () => {
    updateRequestStatus(request.id, 'rejected');
    if (onStatusUpdate) {
      onStatusUpdate(request.id, 'rejected');
    }
  };
  
  const handleMessage = () => {
    navigate(`/chat/${counterparty.id}`);
  };

  const handleViewProfile = () => {
    const profilePath = counterparty.role === 'investor' ? `/profile/investor/${counterparty.id}` : `/profile/entrepreneur/${counterparty.id}`;
    navigate(profilePath);
  };
  
  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="error">Declined</Badge>;
      default:
        return null;
    }
  };
  
  const isOutgoing = user
    ? (user.id === request.investorId && request.initiatorRole === 'investor') ||
      (user.id === request.entrepreneurId && request.initiatorRole === 'entrepreneur')
    : false;

  return (
    <Card className="transition-all duration-300">
      <CardBody className="flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <Avatar
              src={counterparty.avatarUrl}
              alt={counterparty.name}
              size="md"
              status={counterparty.isOnline ? 'online' : 'offline'}
              className="mr-3"
            />

            <div>
              <h3 className="text-md font-semibold text-gray-900">{counterparty.name}</h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {request.status === 'pending' && isOutgoing ? (
            <Badge variant="gray">Request sent</Badge>
          ) : (
            getStatusBadge()
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">{request.message}</p>
        </div>
      </CardBody>

      <CardFooter className="border-t border-gray-100 bg-gray-50">
        {/* If current user is the receiver (incoming) and pending -> show accept/decline */}
        {user && ((user.id === request.investorId && user.role !== request.initiatorRole) || (user.id === request.entrepreneurId && user.role !== request.initiatorRole)) && request.status === 'pending' ? (
          <div className="flex justify-between w-full">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<X size={16} />}
                onClick={handleReject}
              >
                Decline
              </Button>
              <Button
                variant="success"
                size="sm"
                leftIcon={<Check size={16} />}
                onClick={handleAccept}
              >
                Accept
              </Button>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<MessageCircle size={16} />}
              onClick={handleMessage}
            >
              Message
            </Button>
          </div>
        ) : (
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MessageCircle size={16} />}
              onClick={handleMessage}
            >
              Message
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};