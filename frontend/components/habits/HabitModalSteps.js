import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import FrequencyToggleButton from './FrequencyToggleButton';

/**
 * Get the description/content for each step of the habit setup process
 * @param {number} currentStep - The current step number (1-10)
 * @param {Object} habitData - The habit data state object (optional)
 * @param {Function} setHabitData - Function to update habit data state (optional)
 * @returns {JSX.Element} The description content for the step
 */
export function getStepDescription(currentStep, habitData, setHabitData) {
    switch (currentStep) {
        case 1:
            return (
                <>
                    <div className="mt-10 mb-5">
                        <div> insert logo </div>
                    </div>
                    <div className="mt-5 mb-5  text-black">
                        <div className="text-lg font-semibold">
                            Let&apos;s get your first habit set up
                        </div>
                        <br />
                        <div>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor.
                        </div>
                    </div>
                </>
            );
        case 2:
            return (
                <>
                    <div className="mt-10 mb-5">
                        <div> insert logo </div>
                    </div>
                    <div className="mt-5 mb-5  text-black">
                        <div className="text-lg font-semibold">
                            Define your habit
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
                                when I wake up, so that I can become a healthy
                                person.
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
                            Setting a specific time and place means not waiting
                            around for inspiration to strike
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
                                I will exercise for 30 minutes when I wake up,
                                so that I can become a{' '}
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
                <>
                    <div className="mt-10 mb-10">
                        <div>
                            I will{' '}
                            <Input
                                value={habitData?.habit || ''}
                                onChange={(e) =>
                                    setHabitData({
                                        ...habitData,
                                        habit: e.target.value,
                                    })
                                }
                                placeholder="habit"
                                className="inline-block w-0.5 min-w-16 border-0 border-b-2 border-red-500 rounded-none px-1 py-0 h-auto bg-transparent focus:ring-0"
                            />
                            , at{' '}
                            <Input
                                type="time"
                                value={habitData?.time || ''}
                                onChange={(e) =>
                                    setHabitData({
                                        ...habitData,
                                        time: e.target.value,
                                    })
                                }
                                className="inline-block w-1 min-w-32 border-0 border-b-2 border-red-500 rounded-none px-1 py-0 h-auto bg-transparent focus:ring-0"
                            />
                            ,
                            <Input
                                value={habitData?.location || ''}
                                onChange={(e) =>
                                    setHabitData({
                                        ...habitData,
                                        location: e.target.value,
                                    })
                                }
                                placeholder="location"
                                className="inline-block w-auto min-w-16 border-0 border-b-2 border-red-500 rounded-none px-1 py-0 h-auto bg-transparent focus:ring-0"
                            />
                            ,
                        </div>
                        <div>
                            so that I can become{' '}
                            <Input
                                value={habitData?.purpose || ''}
                                onChange={(e) =>
                                    setHabitData({
                                        ...habitData,
                                        purpose: e.target.value,
                                    })
                                }
                                placeholder="type of person I want to be"
                                className="inline-block w-auto min-w-16 border-0 border-b-2 border-red-500 rounded-none px-1 py-0 h-auto bg-transparent focus:ring-0"
                            />
                        </div>
                        <div className="mt-5">
                            <p>*Please select PM or AM.</p>
                        </div>
                    </div>
                    {/*  Implementation:
  // When submitting or displaying the full sentence in user profile:
  const fullHabitStatement = `I will ${habitData.habit}, 
  ${habitData.timeLocation}, so that I can become ${habitData.purpose}`; 
  */}
                    <Card className=" text-black p-10 bg-slate-200 rounded-xl mt-7 mb-7 h-auto flex items-center">
                        <CardHeader>
                            <CardTitle>
                                Secret to forming effective habits:
                            </CardTitle>
                            <CardDescription>
                                <li>Action</li>
                                <li>Time and place</li>
                                <li>Identity (Most important)</li>
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </>
            );
        case 6:
            return (
                <>
                    <div className="mt-10 mb-5">
                        <div>{`I will ${habitData.habit} at ${habitData.time} at ${habitData.location} so I can become ${habitData.purpose}`}</div>
                    </div>
                    <div className="mt-5 mb-5  text-black">
                        <div className="text-lg font-semibold">Repeat</div>
                        <br />
                        <div>
                            <FrequencyToggleButton
                                habitData={habitData}
                                setHabitData={setHabitData}
                            />
                        </div>
                    </div>
                </>
            );
        case 7:
            return <Label>Congratulations!</Label>;
        default:
            return (
                <Label>
                    Please advise. Missing step and description correlation
                </Label>
            );
    }
}
