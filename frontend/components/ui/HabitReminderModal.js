import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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

    // Stepper feature for each stage of the process

    const getStepDescription = (currentStep) => {
        // return description based on step
        switch (currentStep) {
            case 1:
                return <Label>Let&apos;s get your first habit set up</Label>;
            case 2:
                return (
                    <>
                        <div className="mt-10 mb-5">
                            <div> insert logo </div>
                        </div>
                        <div className="mt-5 mb-5  text-black">
                            <div className="text-lg font-semibold">
                                Define yor habit
                            </div>
                            <br />
                            <div>
                                Setting a habit is meant to be small and easy to
                                accomplish, and can make a significant impact in
                                your life
                            </div>
                            <div className=" text-black p-10 bg-slate-200 rounded-xl mt-7 mb-7">
                                <div>
                                    I will{' '}
                                    <u>
                                        <b>exercise for 30 minutes</b>
                                    </u>{' '}
                                    when I wake up, so that I can become a
                                    healthy person.
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <div className="mt-10 mb-5">
                            <div>insert logo</div>
                        </div>
                        <div className="mt-5 mb-5  text-black">
                            <div className="text-lg font-semibold">
                                Get Specific
                            </div>
                            <br />
                            <div>
                                Setting a specific time and place means not
                                waiting around for inspiration to strike
                            </div>
                            <div className=" text-black p-10 bg-slate-200 rounded-xl mt-7 mb-7">
                                <div>
                                    I will exercise for 30 minutes when{' '}
                                    <u>
                                        <b>I wake up</b>
                                    </u>
                                    , so that I can become a healthy person.
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <div className="mt-10 mb-5">
                            <div>insert logo</div>
                        </div>
                        <div className="mt-5 mb-5  text-black">
                            <div className="text-lg font-semibold">
                                Ground it in identity
                            </div>
                            <br />
                            <div>
                                The most effective form of motivation is when a
                                habit becomes part of who you are.
                            </div>
                            <div className=" text-black p-10 bg-slate-200 rounded-xl mt-7 mb-7">
                                <div>
                                    I will exercise for 30 minutes when I wake
                                    up, so that I can become a{' '}
                                    <u>
                                        <b>healthy person</b>
                                    </u>
                                    .
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 5:
                return (
                    <div>
                        <Input
                            defaultValue="Johnny"
                            className="inline-block w-auto min-w-16 border-0 border-b-2 border-red-500 rounded-none px-1 py-0 h-auto bg-transparent focus:ring-0"
                        />
                        had a green apple
                    </div>
                );
            case 6:
                return <Label>Reminder time?</Label>;
            case 7:
                return <Label>Reminder time?</Label>;
            case 8:
                return <Label>Reminder time?</Label>;
            case 9:
                return <Label>Reminder time?</Label>;
            case 10:
                return <Label>Reminder time?</Label>;
            default:
                return (
                    <Label>
                        Please advise. Missing step and description correlation
                    </Label>
                );
        }
    };

    // Functionality on user input
    function renderStepContent(currentStep) {
        switch (currentStep) {
            case 1:
                return (
                    <div>
                        <div>Insert an image</div>
                        <div>Insert an description</div>
                    </div>
                );
            case 2:
                return <div>Example</div>;
            case 3:
                return <div>Example</div>;
            case 4:
                return <div>Example</div>;
            case 5:
                return <div>Example</div>;
            case 6:
                return <div>Example</div>;
            case 7:
                return <div>Example</div>;
            case 8:
                return (
                    <Select
                        onValueChange={(value) =>
                            setHabitData({
                                ...habitData,
                                frequency: value,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                    </Select>
                );
            case 9:
                return (
                    <div>
                        <Input
                            type="time"
                            onChange={(e) =>
                                setHabitData({
                                    ...habitData,
                                    time: e.target.value,
                                })
                            }
                        />
                    </div>
                );
            case 10:
                return <div>Example</div>;
            default:
                return null;
        }
    }

    // Rendering on the modal
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Step {currentStep} of 10</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-muted-foreground">
                    {getStepDescription(currentStep)}
                </div>
                {renderStepContent(currentStep)}

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
                    <Button onClick={handleNext} className="mt-2">
                        {currentStep === 10 ? (
                            <Button onClick={handleSubmit}> Complete </Button>
                        ) : (
                            'Next'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
