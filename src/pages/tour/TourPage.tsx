import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { GuidedWalkthrough, GuideStep } from '../../components/GuidedWalkthrough';
import { 
  Play, BookOpen, Shield, FileText, Zap, MessageCircle, 
  Users, TrendingUp, Lock, Eye, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TourPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedTour, setSelectedTour] = useState<string | null>(null);

  const entrepreneurTourSteps: GuideStep[] = [
    {
      id: 'dashboard',
      title: 'Welcome to Your Dashboard',
      description: 'This is your main hub. See your collaboration requests, upcoming meetings, and key metrics at a glance.',
      elementId: '#dashboard-header'
    },
    {
      id: 'find-investors',
      title: 'Find Investors',
      description: 'Browse our investor directory. Filter by industry, funding stage, and investment size to find perfect matches for your startup.',
      elementId: 'a[href="/investors"]'
    },
    {
      id: 'messages',
      title: 'Communicate Directly',
      description: 'Once connected, message investors directly through our secure messaging platform.',
      elementId: 'a[href="/messages"]'
    },
    {
      id: 'documents',
      title: 'Secure Document Management',
      description: 'Upload pitch decks, financial projections, and business plans. Share securely with investors you\'re in discussions with.',
      elementId: 'a[href="/documents"]'
    },
    {
      id: 'deals',
      title: 'Manage Deal Flow',
      description: 'Track all your potential deals and funding rounds in one place. Upload documents directly from this view.',
      elementId: 'a[href="/deals"]'
    }
  ];

  const investorTourSteps: GuideStep[] = [
    {
      id: 'dashboard',
      title: 'Your Investment Dashboard',
      description: 'Monitor your portfolio, pending deals, and communications with portfolio companies in one view.',
      elementId: '#dashboard-header'
    },
    {
      id: 'find-startups',
      title: 'Discover Startups',
      description: 'Browse startups by industry, funding stage, and growth metrics. Connect with founders that align with your investment thesis.',
      elementId: 'a[href="/entrepreneurs"]'
    },
    {
      id: 'deals',
      title: 'Deal Management',
      description: 'Review all your deals in progress, funding rounds, and investment opportunities. Upload due diligence documents here.',
      elementId: 'a[href="/deals"]'
    }
  ];

  const features = [
    {
      icon: <Shield size={24} />,
      title: 'Enhanced Security',
      description: 'Two-factor authentication and password strength requirements protect your account.'
    },
    {
      icon: <FileText size={24} />,
      title: 'Document Management',
      description: 'Securely upload, preview, and share documents with your connections.'
    },
    {
      icon: <Lock size={24} />,
      title: 'Role-Based Access',
      description: 'Each user gets a tailored experience based on whether they\'re an investor or entrepreneur.'
    },
    {
      icon: <MessageCircle size={24} />,
      title: 'Direct Messaging',
      description: 'Connect and communicate directly with investors or founders through our platform.'
    },
    {
      icon: <Zap size={24} />,
      title: 'Deal Tracking',
      description: 'Monitor all your deals and investment opportunities in real-time.'
    },
    {
      icon: <Eye size={24} />,
      title: 'Payment Integration',
      description: 'Mock payment system for deposits, withdrawals, and investment funding flows.'
    }
  ];

  const tourOptions = [
    {
      id: 'features',
      title: 'Feature Overview',
      description: 'Learn about all the key features of Business Nexus',
      icon: <BookOpen size={32} />
    },
    ...(user?.role === 'entrepreneur' ? [{
      id: 'entrepreneur',
      title: 'Entrepreneur Tour',
      description: 'Guided walkthrough of entrepreneur-specific features',
      icon: <Users size={32} />
    }] : []),
    ...(user?.role === 'investor' ? [{
      id: 'investor',
      title: 'Investor Tour',
      description: 'Guided walkthrough of investor-specific features',
      icon: <TrendingUp size={32} />
    }] : [])
  ];

  const handleStartTour = (tourId: string) => {
    setSelectedTour(tourId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Guided Tour & Features</h1>
        <p className="text-gray-600 mt-2">Learn how to make the most of Business Nexus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tourOptions.map(option => (
          <Card key={option.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStartTour(option.id)}>
            <CardBody>
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-primary-50 rounded-full mb-4 text-primary-600">
                  {option.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{option.description}</p>
                <Button
                  className="mt-4 w-full"
                  size="sm"
                  leftIcon={<Play size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartTour(option.id);
                  }}
                >
                  Start
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Features grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="border border-gray-200">
              <CardBody>
                <div className="text-primary-600 mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{feature.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Security features section */}
      <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield size={28} className="text-primary-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Security & Trust</h3>
              <p className="text-sm text-gray-600">Your data is protected with enterprise-grade security</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-success-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 mt-1">OTP-based verification on every login</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-success-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Strong Password Requirements</h4>
                <p className="text-sm text-gray-600 mt-1">Real-time password strength meter</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-success-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Encrypted Data</h4>
                <p className="text-sm text-gray-600 mt-1">End-to-end encryption for documents</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-success-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Role-Based Access</h4>
                <p className="text-sm text-gray-600 mt-1">Tailored experience per user type</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Guided walkthroughs */}
      {selectedTour === 'features' && (
        <GuidedWalkthrough
          steps={[
            {
              id: 'welcome',
              title: 'Welcome to Business Nexus',
              description: 'Business Nexus connects entrepreneurs with investors to fuel growth and innovation.'
            },
            {
              id: 'role-based',
              title: 'Role-Based Experience',
              description: 'Whether you\'re an investor or entrepreneur, you get a customized dashboard tailored to your needs.'
            },
            {
              id: 'security',
              title: 'Security First',
              description: 'We prioritize your security with 2FA, strong password requirements, and encrypted data handling.'
            }
          ]}
          title="Feature Overview"
          onComplete={() => setSelectedTour(null)}
        />
      )}

      {selectedTour === 'entrepreneur' && (
        <GuidedWalkthrough
          steps={entrepreneurTourSteps}
          title="Entrepreneur Tour"
          onComplete={() => setSelectedTour(null)}
        />
      )}

      {selectedTour === 'investor' && (
        <GuidedWalkthrough
          steps={investorTourSteps}
          title="Investor Tour"
          onComplete={() => setSelectedTour(null)}
        />
      )}
    </div>
  );
};
