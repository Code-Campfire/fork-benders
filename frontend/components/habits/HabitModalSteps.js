import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
                                value={habitData?.time || ''}
                                onChange={
                                    (e) =>
                                        setHabitData({
                                            ...habitData,
                                            time: e.target.value,
                                        })
                                    // Add this to a separate useState as just string.
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
                            {console.log('Purpose is:', habitData?.location)},
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
                            {console.log('Purpose is:', habitData?.purpose)}
                        </div>
                        {console.log('Entire state is:', habitData)}
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
                            The most effective form of motivation is when a
                            habit becomes part of who you are.
                        </div>
                        <div className="text-lg font-semibold mt-5">
                            Habit time
                        </div>
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
                        <div className="text-lg font-semibold mt-5">
                            Send Reminder
                        </div>
                    </div>
                </>
            );
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
}

/**
 * Render the interactive content/form fields for each step
 * @param {number} currentStep - The current step number (1-10)
 * @param {Object} habitData - The habit data state object
 * @param {Function} setHabitData - Function to update habit data state
 * @returns {JSX.Element|null} The interactive content for the step
 */
export function renderStepContent(currentStep, habitData, setHabitData) {
    switch (currentStep) {
        case 1:
            return null;
        case 2:
            return null;
        case 3:
            return null;
        case 4:
            return null;
        case 5:
            return null;
        case 6:
            return null;
        case 7:
            return null;
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
                        value={habitData?.time || ''}
                        onChange={(e) => {
                            setHabitData({
                                ...habitData,
                                time: e.target.value,
                            });
                        }}
                    />
                </div>
            );
        case 10:
            return null;
        default:
            return null;
    }
}
