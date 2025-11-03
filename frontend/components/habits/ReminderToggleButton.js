import { useState, useEffect } from 'react';

import { Input } from '@/components/ui/input';

export default function ReminderToggleButton({ habitData, setHabitData }) {
    // Handle initial value - convert string 'null', null, or undefined to empty string for display
    const getInitialValue = () => {
        const reminder = habitData?.reminder;
        if (
            reminder === null ||
            reminder === undefined ||
            reminder === 'null' ||
            reminder === ''
        ) {
            return '';
        }
        return reminder.toString();
    };
    console.log(habitData);
    const [reminderPick, setReminderPick] = useState(getInitialValue());

    // Update local state when habitData changes from parent
    useEffect(() => {
        const reminder = habitData?.reminder;
        if (
            reminder === null ||
            reminder === undefined ||
            reminder === 'null' ||
            reminder === ''
        ) {
            setReminderPick('');
        } else {
            setReminderPick(reminder.toString());
        }
    }, [habitData?.reminder]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        // Allow empty string or valid integer
        if (value === '' || /^\d+$/.test(value)) {
            setReminderPick(value);
            // Convert to integer (hours) for habitData.reminder (null if empty)
            const hoursValue = value === '' ? null : parseInt(value, 10);
            setHabitData({
                ...habitData,
                reminder: hoursValue,
            });
        }
    };

    return (
        <div className="flex justify-around w-60">
            How many hours?
            <Input
                type="number"
                value={reminderPick}
                onChange={handleInputChange}
                placeholder="Enter hours"
                min="0"
                step="1"
                className="w-full max-w-xs w-16"
            />
        </div>
    );
}
