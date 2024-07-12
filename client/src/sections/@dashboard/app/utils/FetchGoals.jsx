/**
 * FetchGoals function for fetching a specific goal for a user.
 * @param {string} userId - The ID of the user.
 * @param {object} task - The task object containing information about the goal.
 * @param {string} task.label - The label of the goal.
 * @returns {Promise} - Promise that resolves to the fetched goal.
 */

const FetchGoals = async (userId, task) => {
    try {
        const goalResponse = await fetch(`/api/getCollection?collection=goals&userId=${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!goalResponse.ok) {
            console.log(`Failed to fetch goals`);
        }

        const goals = await goalResponse.json();
        const goal = goals.find((g) => g.goalName === task.label);

        if (!goal) {
            console.log(`Failed to fetch goals`);
        }
        return goal;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

export default FetchGoals;
