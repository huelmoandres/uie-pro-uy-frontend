import { useState, useCallback } from "react";
import { useAccessPolicy } from "./useAccessPolicy";

/**
 * Hook para el soft lock de features premium.
 * Devuelve hasAccess y control del PremiumGateModal.
 */
export function usePremiumGate() {
  const { hasPremiumAccess } = useAccessPolicy();
  const [showModal, setShowModal] = useState(false);
  const [featureParam, setFeatureParam] = useState<string>("");

  const showPremiumModal = useCallback((feature: string) => {
    setFeatureParam(feature);
    setShowModal(true);
  }, []);

  const hidePremiumModal = useCallback(() => {
    setShowModal(false);
    setFeatureParam("");
  }, []);

  return {
    hasAccess: hasPremiumAccess,
    showPremiumModal,
    showModal,
    setShowModal: setShowModal,
    featureParam,
    hidePremiumModal,
  };
}
