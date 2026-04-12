import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface NotificationProps {
    message: string;
    type: "success" | "error" | "info";
    duration?: number;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
    message,
    type,
    duration = 5000,
    onClose
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Attendre la fin de l'animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "error":
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case "success":
                return "bg-green-50 border-green-200";
            case "error":
                return "bg-red-50 border-red-200";
            default:
                return "bg-blue-50 border-blue-200";
        }
    };

    const getTextColor = () => {
        switch (type) {
            case "success":
                return "text-green-800";
            case "error":
                return "text-red-800";
            default:
                return "text-blue-800";
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-[100] border rounded-lg shadow-lg p-4 transition-all duration-300 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            } ${getBgColor()}`}
            style={{ minWidth: "300px", maxWidth: "400px" }}
        >
            <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1">
                    <p className={`text-sm font-medium ${getTextColor()}`}>
                        {message}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Notification; 