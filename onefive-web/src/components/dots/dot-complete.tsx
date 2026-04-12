import { Check } from "lucide-react";

export const DotComplete = () => {
    return (
        <div className="w-9 h-9 bg-white rounded-full flex justify-center items-center">
            <div className="w-6 h-6 bg-primary-600 hover:bg-primary-500 rounded-full flex justify-center items-center">
                <Check className="w-4 h-4 text-white" />
            </div>
        </div>
    );
};