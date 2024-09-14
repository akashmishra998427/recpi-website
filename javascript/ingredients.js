document.addEventListener('DOMContentLoaded', async () => {
    const ingredientsContainer = document.querySelector("#ingredients-container");
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id'); // Get recipe ID from URL

    const fetchIngredients = async (id) => {
        try {
            // Example API request; adjust based on actual API for ingredient details
            const urls = [
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
                `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKeys.spoonacular}`,
                `https://api.edamam.com/search?r=${encodeURIComponent(id)}&app_id=${apiKeys.edamamId}&app_key=${apiKeys.edamam}`,
                `https://api.tasty.co/v1/recipes/${id}`
            ];

            const responses = await Promise.all(urls.map(url => fetch(url).then(res => res.json())));
            const [mealDBData, spoonacularData, edamamData, tastyData] = responses;

            const ingredients = [
                ...(mealDBData.meals[0].strIngredients || []),
                ...(spoonacularData.extendedIngredients || []),
                ...(edamamData.hits[0].recipe.ingredientLines || []),
                ...(tastyData.results[0].ingredients || [])
            ];

            // Display ingredients
            ingredientsContainer.innerHTML = `
                <h2>Ingredients</h2>
                <ul>
                    ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            `;

        } catch (error) {
            console.error('Error fetching ingredients:', error);
            ingredientsContainer.innerHTML = '<p>Failed to fetch ingredients.</p>';
        }
    };

    if (recipeId) {
        fetchIngredients(recipeId);
    } else {
        ingredientsContainer.innerHTML = '<p>No recipe ID provided.</p>';
    }
});
