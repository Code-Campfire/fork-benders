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
        day: 'null',
        time: '00:00:00',
        location: 'location',
        reminder: 'null',
        skipped: false,
    });

    const handleSubmit = async (isSkipped = false) => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Format the time properly for the backend
            const payload = {
                ...habitData,
                skipped: isSkipped,
                reminder: parseInt(habitData.reminder) || 0,
            };
            const createdHabit = await habitAPI.create(payload);
            console.log('Habit created:', createdHabit);

            // Close modal and reset on success
            onClose();
            setCurrentStep(1);
            setHabitData({
                habit: '',
                frequency: '',
                purpose: '',
                day: '',
                time: '',
                reminder: '',
                skipped: false,
            });
        } catch (err) {
            console.error('Error creating habit:', err);
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
        if (currentStep < 10) {
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

    // Rendering the modal
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                        className="mt-2"
                    >
                        Skip for now
                    </Button>
                    {currentStep > 1 && (
                        <Button onClick={goBack} className="mt-2">
                            Go back
                        </Button>
                    )}
                    <Button
                        onClick={
                            currentStep === 10
                                ? () => handleSubmit()
                                : handleNext
                        }
                        disabled={isSubmitting}
                        className="mt-2"
                    >
                        {currentStep === 7 ? 'Complete' : 'Next'}
                        {}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
