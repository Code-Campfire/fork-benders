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

export default function HabitReminderModal({ isOpen, onClose }) {
    // const [userData, setUserData] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    // const [skipData, setSkipData] = useState({});
    const [habitData, setHabitData] = useState({
        habit: '',
        frequency: '',
        purpose: '',
        day: '',
        time: '',
        reminder: '',
    });

    const handleSubmit = () => {
        // Grab habitData and send through the API to BE
        // API logic
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

        habitData.skipped = true;
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
                        className="mt-2"
                    >
                        {currentStep === 10 ? 'Complete' : 'Next'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
