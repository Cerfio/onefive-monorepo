import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, X } from "lucide-react";

interface SecurityAlertProps {
    onClose?: () => void;
}

const SecurityAlert: React.FC<SecurityAlertProps> = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [detectionCount, setDetectionCount] = useState(0);

    useEffect(() => {
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                setDetectionCount(prev => prev + 1);
                setIsVisible(true);
            }
        };

        // Vérification périodique
        const interval = setInterval(detectDevTools, 2000);

        return () => clearInterval(interval);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 z-50 max-w-sm">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                        Alerte de sécurité
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                        Des outils de développement ont été détectés. Pour des raisons de sécurité, 
                        l'accès à certaines fonctionnalités peut être restreint.
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">
                            Détections: {detectionCount}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1 text-red-400 hover:text-red-600 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default SecurityAlert; 