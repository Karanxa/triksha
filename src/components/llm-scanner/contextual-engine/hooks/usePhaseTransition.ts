import { useState } from 'react';
import { Message } from '../types/phases';

export type Phase = 'fingerprinting' | 'augmenting' | 'redteaming';

export const usePhaseTransition = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>('fingerprinting');
  const [phaseComplete, setPhaseComplete] = useState(false);

  const transitionToNextPhase = (messages: Message[], currentPhase: Phase) => {
    let nextPhase: Phase;
    const completionMessage = {
      role: 'system',
      content: `${currentPhase} phase completed.`
    };

    switch (currentPhase) {
      case 'fingerprinting':
        nextPhase = 'augmenting';
        break;
      case 'augmenting':
        nextPhase = 'redteaming';
        break;
      default:
        return;
    }

    setCurrentPhase(nextPhase);
    setPhaseComplete(false);
    return [...messages, completionMessage, {
      role: 'system',
      content: `Starting ${nextPhase} phase...`
    }];
  };

  return {
    currentPhase,
    phaseComplete,
    setPhaseComplete,
    transitionToNextPhase
  };
};