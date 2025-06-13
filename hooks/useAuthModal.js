// hooks/useAuthModal.js - Reusable hook for auth modal management
import { useState } from 'react';

export function useAuthModal() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signin' or 'signup'

  const openSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const openSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const closeModal = () => {
    setShowAuthModal(false);
  };

  return {
    showAuthModal,
    authMode,
    openSignUp,
    openSignIn,
    closeModal
  };
}

// Optional: Higher-order component for pages that need auth modal
export function withAuthModal(WrappedComponent) {
  return function AuthModalWrapper(props) {
    const authModal = useAuthModal();
    
    return (
      <>
        <WrappedComponent {...props} {...authModal} />
        <AuthModal 
          isOpen={authModal.showAuthModal}
          onClose={authModal.closeModal}
          initialMode={authModal.authMode}
        />
      </>
    );
  };
}
