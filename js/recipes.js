/* =========================================================
    NutriBI - Recipes page
    The user fills in the recipe form >t file sends the search and filters to the Spoonacular API
    > shows 4 recipe cards with calories per serving > Clicking a card opens a popup with nutrition, ingredients and method.
    
    formatGrams and createLegendItem come from main.js.

    Author: Hashini Liyanage
    Created Date: 16/10/2026

    Ref: Spoonacular Search Recipes: https://spoonacular.com/food-api/docs#Search-Recipes-Complex
    Ref: fetching and error handling: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
   ========================================================= */

// API key and address for the Spoonacular recipe search
const API_KEY = "b15c04a8d2044905ab2468c29ffdc703";
const API_URL = "https://api.spoonacular.com/recipes/complexSearch";

// Form and its fields
// Ref: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
const recipeForm = document.getElementById("recipe-form");
const recipeInput = document.getElementById("recipe-search");
const cuisineSelect = document.getElementById("cuisine");
const maxCaloriesInput = document.getElementById("max-calories");

// Results area and popup
const recipesArea = document.getElementById("recipes");
const recipeDialog = document.getElementById("recipe-dialog");
const recipeTitle = document.getElementById("recipe-title");
const recipeBody = document.getElementById("recipe-body");

// Recipes from the last search. Kept so that opening a recipe
// needs no extra API call (the free plan allows only 50 points a day).
let currentRecipes = [];


/*
    function: getRecipeNutrient
    How it works: each recipe from the API has a list of nutrients (per serving). This finds one by its name.
    Input:  recipe - one recipe object from the API
            name   - the nutrient name, e.g. "Calories" or "Protein"
    Output: the amount , or null if the recipe doesn't have it
    Example: getRecipeNutrient(recipe, "Calories") -> 478.2
    Ref: 
        Array find(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
*/
function getRecipeNutrient(recipe, name) {
    const nutrient = recipe.nutrition.nutrients.find(n => n.name === name);
    return nutrient ? nutrient.amount : null;
}

/*
    function: buildSearchParams
    How it works: reads every field in the form and turns the values into the query string for the API address. Filters are only added if the user chose something.
                    - text box   -> query          (always sent)
                    - select     -> cuisine        (if not "Any")
                    - radio      -> diet           (the checked one, if not "Any")
                    - number     -> maxCalories    (if typed)
                    - checkboxes -> intolerances   (all ticked ones, e.g. "dairy,egg")
    Input:  reads the form on the page
    Output: a URLSearchParams
    Ref: 
        URLSearchParams: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
        checked selector: https://developer.mozilla.org/en-US/docs/Web/CSS/:checked
        querySelectorAll: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
*/
function buildSearchParams() {
    const params = new URLSearchParams({
        query: recipeInput.value.trim(),
        number: 4,
        addRecipeNutrition: true,     // calories, macros and ingredients per serving
        addRecipeInstructions: true,  // step-by-step method
        apiKey: API_KEY
    });

    // Select: only send a cuisine if one was chosen
    if (cuisineSelect.value !== "") {
        params.append("cuisine", cuisineSelect.value);
    }

    // Radio buttons: find the one that is checked in the "diet" group
    const diet = recipeForm.querySelector('input[name="diet"]:checked').value;
    if (diet !== "") {
        params.append("diet", diet);
    }

    // Number: optional, so only send it if the user typed something
    if (maxCaloriesInput.value !== "") {
        params.append("maxCalories", maxCaloriesInput.value);
    }

    // Checkboxes: collect every ticked value and join them with commas
    const ticked = recipeForm.querySelectorAll('input[name="intolerances"]:checked');
    const intolerances = Array.from(ticked).map(box => box.value);
    if (intolerances.length > 0) {
        params.append("intolerances", intolerances.join(","));
    }

    return params;
}

/*
    function: createRecipeCard
    How it works: builds the HTML for one recipe card: photo, name, calories per serving, time and servings.
                    The card is a <button> so it works with the keyboard
                    The photo has alt="" because the name is shown next to it.
    Input:  recipe - one recipe object from the API
    Output: HTML text for one card
    Ref: 
        button element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button
        data attributes: https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Solve_HTML_problems/Use_data_attributes
*/
function createRecipeCard(recipe) {
    const kcal = getRecipeNutrient(recipe, "Calories");

    return `
        <button type="button" class="recipe-card" data-id="${recipe.id}">
            <img src="${recipe.image}" alt="" loading="lazy">
            <span class="recipe-info">
                <span class="recipe-name">${recipe.title}</span>
                <span class="recipe-meta">${kcal === null ? "n/a" : Math.round(kcal)} kcal per serving</span>
                <span class="recipe-meta">${recipe.readyInMinutes} min · serves ${recipe.servings}</span>
            </span>
        </button>
    `;
}

/*
    function: showRecipe
    How it works: finds the clicked recipe in currentRecipes, fills the popup with its photo, nutrition, ingredients and method, and opens the popup.
                    Ingredients are per serving (e.g. 0.25 large onion).
                    Some recipes have no method, so it checks before diplay.
    Input:  id - the recipe id from the card's data-id (text)
    Output: it fills and opens the popup
    Ref: 
        dialog showModal(): https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal
        Array map/join: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
*/
function showRecipe(id) {
    // data-id is text, recipe.id is a number - convert before comparing
    const recipe = currentRecipes.find(r => r.id === Number(id));
    if (!recipe) {
        return;
    }

    const kcal = getRecipeNutrient(recipe, "Calories");
    const carbs = getRecipeNutrient(recipe, "Carbohydrates");
    const protein = getRecipeNutrient(recipe, "Protein");
    const fat = getRecipeNutrient(recipe, "Fat");

    // One <li> per ingredient, amount rounded to 2 decimals
    const ingredientsHtml = recipe.nutrition.ingredients
        .map(item => `<li>${Number(item.amount.toFixed(2))} ${item.unit} ${item.name}</li>`)
        .join("");

    // Method steps: use the first set of instructions if there is one
    const steps = recipe.analyzedInstructions.length > 0
        ? recipe.analyzedInstructions[0].steps
        : [];
    const stepsHtml = steps.length > 0
        ? `<ol>${steps.map(s => `<li>${s.step}</li>`).join("")}</ol>`
        : "<p>No instructions available for this recipe.</p>";

    recipeTitle.textContent = recipe.title;
    recipeBody.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-photo">

        <h3>Nutrition per serving</h3>
        <p class="kcal"><strong>${kcal === null ? "n/a" : Math.round(kcal)}</strong> kcal</p>
        <ul class="nutrients">
            ${createLegendItem("Carbs", carbs)}
            ${createLegendItem("Protein", protein)}
            ${createLegendItem("Fat", fat)}
        </ul>

        <h3>Ingredients (per serving)</h3>
        <ul>${ingredientsHtml}</ul>

        <h3>Method</h3>
        ${stepsHtml}
    `;

    // Open as a modal: dark backdrop, Esc closes it, focus stays inside
    recipeDialog.showModal();
}


/*
    function: Search (form submit)
    How it works: runs when the user clicks "Find recipes" or presses Enter.
                    1. stops the page from reloading
                    2. builds the API address from the form (buildSearchParams)
                    3. shows "Searching recipes…" while waiting
                    4. calls the API
                    5. shows 4 recipe cards, or a message if the daily limit is reached, nothing matched, or something went wrong
    Input:  event - information about the submit (from the browser)
    Output: it changes the recipes area on the page
    Ref: 
        preventDefault: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
        async/await: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
*/
recipeForm.addEventListener("submit", async function (event) {
    // 1. Stop the browser's normal submit
    event.preventDefault();

    // 2. Build the API address
    const url = `${API_URL}?${buildSearchParams()}`;

    // 3. Tell the user something is happening (aria-live reads it out)
    recipesArea.textContent = "Searching recipes…";

    try {
        // 4. Call the API
        const response = await fetch(url);

        // 402 = Spoonacular's daily free limit is used up
        if (response.status === 402) {
            recipesArea.textContent = "Daily recipe search limit reached. Please try again tomorrow.";
            return;
        }

        // fetch does NOT fail on HTTP errors, so check ourselves
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        // Turn the JSON reply into a JavaScript object
        const data = await response.json();

        // 5a. Nothing matched the filters
        if (data.results.length === 0) {
            recipesArea.textContent = "No recipes match these filters. Try fewer filters or another word.";
            return;
        }

        // 5b. Keep the results for the popup, then show one card per recipe
        currentRecipes = data.results;

        const cardsHtml = currentRecipes.map(createRecipeCard).join("");
        recipesArea.innerHTML = `
            <h2>${currentRecipes.length} recipes</h2>
            <div class="recipe-grid">${cardsHtml}</div>
        `;

    } catch (error) {
        // 5c. Something went wrong: details in the Console, simple message for the user
        console.error(error);
        recipesArea.textContent = "Something went wrong. Please try again.";
    }
});


/*
    function: Open a recipe
    How it works: one listener on the recipes area catches clicks on any card
                    closest() finds the card button even if the user clicked the photo or the text inside it.
    Input:  event - information about the click
    Output: opens the popup through showRecipe
    Ref: 
        event delegation: https://javascript.info/event-delegation
        closest(): https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
*/
recipesArea.addEventListener("click", function (event) {
    const card = event.target.closest(".recipe-card");
    if (card) {
        showRecipe(card.dataset.id);
    }
});

/*
    function: Close the popup (backdrop click)
    How it works: if the user clicks the dark area outside the popup content, the popup closes. 
                (The X button and the Esc key already close it without JavaScript.)
    Input:  event - information about the click
    Output: closes the popup
    Ref: 
        dialog close(): https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close
*/
recipeDialog.addEventListener("click", function (event) {
    if (event.target === recipeDialog) {
        recipeDialog.close();
    }
});