/**
 * FetchCollection function for fetching data from a specified collection.
 * @param {string} collection - The name of the collection to fetch data from.
 * @returns {Promise} - Promise that resolves to the fetched data.
 */
const FetchCollection = async (collection) => {
    try {
        const response = await fetch(`/api/getCollection?collection=${collection}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch ${collection}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${collection}:`, error);
        throw error;
    }
};

export default FetchCollection;
