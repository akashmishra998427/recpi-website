document.addEventListener('DOMContentLoaded', (event) => {
    const searchbox = document.querySelector(".searchbox");
    const search_btn = document.querySelector(".search");
    const recpi_container = document.querySelector("#recpi-container");

    // Function to fetch recipes based on search
    const fetchrecpi = async (query) => {
        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodedQuery}`);
            const data = await response.json();

            // Clear previous results
            recpi_container.innerHTML = '';

            if (data.meals) {
                data.meals.forEach(meal => {
                    const mealCard = document.createElement('div');
                    mealCard.classList.add('meal-card');
                    
                    // Set the innerHTML correctly with backticks for template literals
                    mealCard.innerHTML = `
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-image">
                        <div class="meal-content">
                            <h3>${meal.strMeal}</h3>
                            <p>${meal.strInstructions.substring(0, 100)}...</p>
                            <button class="show-ingredients" data-id="${meal.idMeal}">Show Ingredients</button>
                            <a href="${meal.strSource}" target="_blank" class="meal-link">Read more</a>
                        </div>
                    `;
                    recpi_container.appendChild(mealCard);
                });

                // Attach event listeners for "Show Ingredients" buttons
                document.querySelectorAll('.show-ingredients').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const mealId = e.target.getAttribute('data-id');
                        await showIngredientsPopup(mealId);
                    });
                });
            } else {
                recpi_container.innerHTML = '<p>No recipes found.</p>';
            }

        } catch (error) {
            console.error('Error fetching recipes:', error);
            recpi_container.innerHTML = '<p>Failed to fetch recipes.</p>';
        }
    };

    // Event listener for the search button
    search_btn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevents the default form submission action
        const searchValue = searchbox.value.trim(); // Get the value of the search input field
        if (searchValue) {
            fetchrecpi(searchValue); // Fetch recipes based on user input
        }
    });

    // Function to fetch random recipes
    const fetchRandomRecipes = async () => {
        try {
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='); // No query to get random recipes
            const data = await response.json();
            return data.meals || []; // Return meals or empty array if no meals found
        } catch (error) {
            console.error('Error fetching recipes:', error);
            return [];
        }
    };

    // Function to create a card for each recipe
    const createCard = (meal) => {
    return `
        <div class="meal-card">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-image">
            <div class="meal-content">
                <h3>${meal.strMeal}</h3>
                <p>${meal.strInstructions.substring(0, 100)}...</p>
                <a href="ingredients.html?id=${meal.idMeal}" class="show-ingredients-btn">Show Ingredients</a> <!-- Link to the new page -->
                <a href="${meal.strSource}" target="_blank" class="meal-link">Recipe Link</a>
            </div>
        </div>
    `;
};


    // Fetch and display random recipes on page load
    const displayRecipes = async () => {
        const meals = await fetchRandomRecipes();
        if (meals.length > 0) {
            const cards = meals.map(createCard).join('');
            recpi_container.innerHTML = cards;
            
            // Attach event listeners for "Show Ingredients" buttons
            document.querySelectorAll('.show-ingredients').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const mealId = e.target.getAttribute('data-id');
                    await showIngredientsPopup(mealId);
                });
            });
        } else {
            recpi_container.innerHTML = '<p>No recipes found.</p>';
        }
    };

    // Function to show ingredients in a popup
    const showIngredientsPopup = async (mealId) => {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
            const data = await response.json();
            const meal = data.meals[0];
            
            // Extract ingredients and measurements
            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== '') {
                    ingredients.push(`${ingredient} - ${measure}`);
                }
            }

            // Create popup content
            const popupContent = `
                <div class="popup-overlay">
                    <div class="popup">
                        <h3>Ingredients for ${meal.strMeal}</h3>
                        <ul>
                            ${ingredients.length > 0 ? ingredients.map(ing => `<li>${ing}</li>`).join('') : '<li>No ingredients available for this dish.</li>'}
                        </ul>
                        <button class="close-popup">Close</button>
                    </div>
                </div>
            `;

            // Append popup to body
            document.body.insertAdjacentHTML('beforeend', popupContent);

            // Add event listener for closing the popup
            document.querySelector('.close-popup').addEventListener('click', () => {
                document.querySelector('.popup-overlay').remove();
            });

        } catch (error) {
            console.error('Error fetching meal details:', error);
        }
    };

    // Display random recipes initially
    displayRecipes();
});
