const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : 'http://localhost:8000/api';

// POST
const createHabit = (payload) =>
    new Promise((resolve, reject) => {
        fetch(`${API_BASE_URL}/habits/`, {
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
