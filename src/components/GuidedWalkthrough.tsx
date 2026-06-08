import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, Play } from 'lucide-react';
import { Button } from './ui/Button';

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  elementId?: string; // CSS selector for the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedWalkthroughProps {
  steps: GuideStep[];
  title?: string;
  onComplete?: () => void;
  autoStart?: boolean;
}

export const GuidedWalkthrough: React.FC<GuidedWalkthroughProps> = ({
  steps,
  title = 'Guided Tour',
  onComplete,
  autoStart = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(autoStart);
  const [highlightBox, setHighlightBox] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isVisible || !steps[currentStep]?.elementId) {
      setHighlightBox(null);
      return;
    }

    const element = document.querySelector(steps[currentStep].elementId!);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightBox(rect);

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isVisible, steps]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white rounded-full p-3 shadow-lg hover:bg-primary-700 transition-colors z-40 flex items-center gap-2"
        title="Start guided tour"
      >
        <Play size={18} />
        <span className="text-sm font-medium">Tour</span>
      </button>
    );
  }

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay with highlight */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsVisible(false)} />
      
      {highlightBox && (
        <div
          className="fixed border-4 border-primary-400 rounded-lg pointer-events-none z-50 animate-pulse"
          style={{
            top: `${highlightBox.top - 4}px`,
            left: `${highlightBox.left - 4}px`,
            width: `${highlightBox.width + 8}px`,
            height: `${highlightBox.height + 8}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed bg-white rounded-lg shadow-2xl p-6 z-50 max-w-sm"
        style={{
          top: highlightBox
            ? `${Math.max(highlightBox.top + highlightBox.height + 20, 20)}px`
            : '50%',
          left: highlightBox
            ? `${Math.max(Math.min(highlightBox.left, window.innerWidth - 400), 20)}px`
            : '50%',
          transform: !highlightBox ? 'translate(-50%, -50%)' : 'none'
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">{step.description}</p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx <= currentStep ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={isFirst}
            fullWidth
            leftIcon={<ChevronLeft size={16} />}
          >
            Previous
          </Button>
          
          {isLast ? (
            <Button
              size="sm"
              onClick={() => {
                setIsVisible(false);
                onComplete?.();
              }}
              fullWidth
            >
              Done
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              fullWidth
              rightIcon={<ChevronRight size={16} />}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
