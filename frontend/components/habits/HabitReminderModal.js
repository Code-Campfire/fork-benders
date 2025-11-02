import React, { useState } from 'react';

import {
    getStepDescription,
    renderStepContent,
} from '@/components/habits/HabitModalSteps';
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
    //prevents double-submits
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [habitData, setHabitData] = useState({
        habit: 'Hi',
        frequency: '2',
        purpose: '3',
        day: 'Tuesday',
        time: '2025-11-02T08:00:00.000Z',
        reminder: '2',
    });

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Format the time properly for the backend
            const payload = {
                ...habitData,
                time: habitData.time || new Date().toISOString(),
                reminder: parseInt(habitData.reminder) || 8,
            };
            const createdHabit = await habitAPI.create(payload);
            console.log('✅ Habit created:', createdHabit);

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
            });
        } catch (err) {
            console.error('❌ Error creating habit:', err);
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
        // need to update models and add "skipped" bool in user_habit
        // upgrade migrations
        onClose();
        // setSkipData(habitData.skipped);

        // API POST call where user skipped === true;

        onClose();
    };

    const goBack = () => {
        setCurrentStep((prevState) => Math.max(1, prevState - 1));
    };

    // Rendering the modal
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Step {currentStep} of 10</DialogTitle>
                </DialogHeader>
                {/* Do not wrap the div below in DialogDescription. It will create a Hydration Error
                    - The getStepDescription switch case has <div> tags.
                    - DialogDescription under the hood is <p> tag; which results in Hydration error.
                */}
                <div className="text-sm text-muted-foreground">
                    {getStepDescription(currentStep)}
                </div>
                {renderStepContent(currentStep, habitData, setHabitData)}
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
                        onClick={currentStep === 10 ? handleSubmit : handleNext}
                        disabled={isSubmitting}
                        className="mt-2"
                    >
                        {currentStep === 10 ? 'Complete' : 'Next'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
