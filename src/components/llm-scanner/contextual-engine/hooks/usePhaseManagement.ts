import { useState } from 'react';
import { Message, ScanPhase } from '../types/phases';

export const usePhaseManagement = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<ScanPhase>('fingerprinting');
  const [currentStep, setCurrentStep] = useState(0);
  const [pendingQuestion, setPendingQuestion] = useState(false);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const transitionToRedTeaming = () => {
    setPhase('redteaming');
    addMessage({
      role: 'system',
      content: 'Starting red teaming phase with dataset prompts...'
    });
  };

  return {
    messages,
    phase,
    currentStep,
    pendingQuestion,
    setCurrentStep,
    setPendingQuestion,
    addMessage,
    transitionToRedTeaming
  };
};