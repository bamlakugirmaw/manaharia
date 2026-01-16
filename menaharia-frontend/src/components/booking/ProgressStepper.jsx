import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const steps = [
    { number: 1, label: 'Search' },
    { number: 2, label: 'Select Seats' },
    { number: 3, label: 'Passenger Details' },
    { number: 4, label: 'Payment' }
];

export default function ProgressStepper({ currentStep = 1 }) {
    return (
        <div className="w-full bg-transparent py-4">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = currentStep > step.number;
                        const isActive = currentStep === step.number;
                        const isInactive = currentStep < step.number;

                        return (
                            <React.Fragment key={step.number}>
                                {/* Step Item */}
                                <div className="flex items-center gap-3">
                                    {/* Circle with Number */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                                        (isCompleted || isActive) && "bg-[#0EA5E9] text-white",
                                        isInactive && "bg-gray-200 text-gray-500"
                                    )}>
                                        {isCompleted ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            step.number
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span className={cn(
                                        "text-sm font-medium whitespace-nowrap",
                                        (isCompleted || isActive) && "text-gray-900",
                                        isInactive && "text-gray-400"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>

                                {/* Connecting Line */}
                                {index < steps.length - 1 && (
                                    <div className="flex-1 mx-4">
                                        <div className={cn(
                                            "h-0.5 w-full transition-colors",
                                            currentStep > step.number ? "bg-[#0EA5E9]" : "bg-gray-200"
                                        )} />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
