import { apiURL } from '@/lib/config';

// POST
const createHabit = (payload) =>
    new Promise((resolve, reject) => {
        fetch(`${apiURL}/habits/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(async (response) => {
                let data;
                if (response.ok) {
                    data = await response.json();
                    resolve(data);
                }
            })
            .catch(reject);
    });
export { createHabit };
