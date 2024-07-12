/**
 * fetchUserIdByEmail function for fetching the ID of a user by their email.
 * @param {string} email - The email of the user.
 * @returns {Promise} - Promise that resolves to the ID of the user.
 */

const fetchUserIdByEmail = async (email) => {
    try {
        const userResponse = await fetch(`/api/getCollection?collection=users`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!userResponse.ok) {
            console.log('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        const currentUser = userData.find(user => user.email === email);

        if (!currentUser) {
            return null;
        }

        return currentUser._id;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

export default fetchUserIdByEmail;
