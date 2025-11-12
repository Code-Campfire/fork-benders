import React, { useState } from 'react';

import { getStepDescription } from '@/components/habits/HabitModalSteps';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { habitAPI } from '@/lib/api';

export default function HabitReminderModal({ isOpen, onClose }) {
    const [currentStep, setCurrentStep] = useState(1);
    //prevents double-submits v
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [habitData, setHabitData] = useState({
        habit: 'habit',
        frequency: 'null',
        purpose: 'type of person',
        time: '00:00:00',
        location: 'location',
        skipped: false,
    });

    const handleSubmit = async (isSkipped = false) => {
        // Early return if already submitting (prevents double-submit)
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                ...habitData,
                skipped: isSkipped,
            };
            const createdHabit = await habitAPI.create(payload);
            console.log('Habit Created:', { createdHabit });
            isSkipped === false
                ? alert('Congratulations! Habit has been confirmed')
                : null;
            handleClose();
        } catch (err) {
            // Axios error objects have error.response.data for server errors
            setError(
                err.response?.data?.detail ||
                    err.response?.data?.message ||
                    'Failed to create habit'
            );
            console.log('setError is:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentStep < 7) {
            setCurrentStep((prevState) => prevState + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSkip = () => {
        handleSubmit(true);
    };

    const goBack = () => {
        setCurrentStep((prevState) => Math.max(1, prevState - 1));
    };

    const handleClose = () => {
        // Prevent closing during submission
        if (isSubmitting) return;

        // Reset all state to initial values
        setCurrentStep(1);
        setError(null);
        setHabitData({
            habit: '',
            frequency: '',
            purpose: '',
            time: '',
            location: '',
            skipped: false,
        });

        // Call parent's onClose
        onClose();
    };

    // Rendering the modal
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Step {currentStep} of 7</DialogTitle>
                </DialogHeader>
                {/* Do not wrap the div below in DialogDescription. It will create a Hydration Error
                    - The getStepDescription switch case has <div> tags.
                    - DialogDescription under the hood is <p> tag; which results in Hydration error.
                */}
                <div className="text-sm text-muted-foreground">
                    {getStepDescription(currentStep, habitData, setHabitData)}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleSkip}
                        disabled={isSubmitting}
                        className="mt-2"
                    >
                        Skip for now
                    </Button>
                    {currentStep > 1 && (
                        <Button
                            onClick={goBack}
                            disabled={isSubmitting}
                            className="mt-2"
                        >
                            Go back
                        </Button>
                    )}
                    <Button
                        onClick={
                            currentStep === 7
                                ? () => handleSubmit()
                                : handleNext
                        }
                        disabled={isSubmitting}
                        className="mt-2"
                    >
                        {currentStep === 7 ? 'Complete' : 'Next'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
