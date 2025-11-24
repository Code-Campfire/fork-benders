import { useState, useEffect } from 'react';

import { Toggle } from '@/components/ui/toggle';

export default function FrequencyToggleButton({ habitData, setHabitData }) {
    const [frequencyPick, setFrequencyPick] = useState(
        habitData?.frequency || null
    );

    // Update local state when habitData changes from parent
    useEffect(() => {
        setFrequencyPick(habitData?.frequency || null);
    }, [habitData?.frequency]);

    const handleToggle = (value) => {
        // If clicking the same toggle, deselect it
        if (frequencyPick === value) {
            setFrequencyPick(null);
            setHabitData({
                ...habitData,
                frequency: null,
            });
        } else {
            // Select the new toggle
            setFrequencyPick(value);
            setHabitData({
                ...habitData,
                frequency: value,
            });
        }
    };

    return (
        <div className="flex justify-around">
            <Toggle
                aria-label="Toggle every 12 hours"
                size="sm"
                variant="outline"
                pressed={frequencyPick === 'every_12_hours'}
                onPressedChange={() => handleToggle('every_12_hours')}
                className="bg-white text-black border border-input *:[svg]:fill-black *:[svg]:stroke-black data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:*:[svg]:fill-white data-[state=on]:*:[svg]:stroke-white w-auto"
            >
                Every 12 hours
            </Toggle>
            <Toggle
                aria-label="Toggle daily"
                size="sm"
                variant="outline"
                pressed={frequencyPick === 'daily'}
                onPressedChange={() => handleToggle('daily')}
                className="bg-white text-black border border-input *:[svg]:fill-black *:[svg]:stroke-black data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:*:[svg]:fill-white data-[state=on]:*:[svg]:stroke-white w-20"
            >
                Daily
            </Toggle>
            <Toggle
                aria-label="Toggle weekly"
                size="sm"
                variant="outline"
                pressed={frequencyPick === 'weekly'}
                onPressedChange={() => handleToggle('weekly')}
                className="bg-white text-black border border-input *:[svg]:fill-black *:[svg]:stroke-black data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:*:[svg]:fill-white data-[state=on]:*:[svg]:stroke-white w-20"
            >
                Weekly
            </Toggle>
        </div>
    );
}
