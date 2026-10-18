/* =========================================================
    NutriBI - Calories page
    The user types a food name > this file asks the USDA FoodData Central API for matching foods 
    > shows 4 cards with calories, carbs, protein and fat per 100 g.
    
    formatGrams and createLegendItem come from main.js.
    
    Process: USDA server > JSON text > fetch() >  response.json()  >  JavaScript object  >  calories cards

    Author: Hashini Liyanage
    Created Date: 16/10/2026

    Ref: USDA FoodData Central API guide: https://fdc.nal.usda.gov/api-guide
    Ref: fetching and error handling: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
   ========================================================= */

// API key and address - USDA food search
const API_KEY = "qmIhU0hUY3MnwqlUcbHqECczJ1xSJTWxRg5DySsc";
const API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

// Find the form, the input and the results area on the page
// Ref: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
const searchForm = document.getElementById("search-form");
const foodInput = document.getElementById("food-search");
const resultArea = document.getElementById("result");

/*
    function: getNutrient
    How it works: each food from the API has a list of nutrients.
                This looks through the list and finds the one with the given USDA number (e.g. "203" = protein).
    Input:  food   - one food object from the API
            number - the USDA nutrient number as text, e.g. "203"
    Output: the amount, or null if the food doesn't have it
    Example: getNutrient(banana, "203") -> 1.09
    Ref: 
        Array find(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
*/
function getNutrient(food, number) {
    const nutrient = food.foodNutrients.find(n => n.nutrientNumber === number);
    return nutrient ? nutrient.value : null;
}

/*
    function: createFoodCard
    How it works: builds the HTML for one food card: name, calories and a list of carbs, protein and fat.
                Calories are stored under number 208 for most foods,
                but under 957 for some newer ones, so it tries 208 first.
    Input:  food - one food object from the API
    Output: HTML text for one card
    USDA numbers: 208/957 = calories, 205 = carbs, 203 = protein, 204 = fat
    Ref: 
        template literals: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
        ?? operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
        Ternary Operator: https://www.w3schools.com/js/js_if_ternary.asp
*/
function createFoodCard(food) {
    // ?? = use the right side if the left side is null
    const kcal = getNutrient(food, "208") ?? getNutrient(food, "957");

    const carbs = getNutrient(food, "205");
    const protein = getNutrient(food, "203");
    const fat = getNutrient(food, "204");

    return `
        <article class="food-card">
            <h3>${food.description}</h3>
            <p class="kcal">
                <strong>${kcal === null ? "n/a" : Math.round(kcal)}</strong> kcal per 100 g
            </p>
            <ul class="nutrients">
                ${createLegendItem("Carbs", carbs)}
                ${createLegendItem("Protein", protein)}
                ${createLegendItem("Fat", fat)}
            </ul>
        </article>
    `;
}

/*
    Search (form submit)
    How it works: runs when the user clicks Search or presses Enter.
                 1. stops the page from reloading
                 2. builds the API address from the food name
                 3. shows "Searching…" while waiting
                 4. calls the API (gives up after 15 seconds)
                 5. shows the 4 food cards, or a message if nothing
                    was found or something went wrong
    Input:  event - information about the submit (from the browser)
    Output: none (it changes the results area on the page)
    Ref: 
        preventDefault: https://medium.com/@manobesh1982_54603/understanding-preventdefault-and-stoppropagation-in-javascript-when-and-why-to-use-them-4581bbcf74d7
        async/await: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
        URLSearchParams: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
        timeout: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static
*/
searchForm.addEventListener("submit", async function (event) {
    // 1. Stop the browser's normal submit, which would reload the page
    event.preventDefault();

    const foodName = foodInput.value.trim();

    // 2. Build the API address with the search settings
    const params = new URLSearchParams({
        query: foodName,
        dataType: "Foundation,SR Legacy",   // whole foods only, not branded products
        pageSize: 4,                        // only 4 results
        api_key: API_KEY
    });
    const url = `${API_URL}?${params}`;

    // 3. Tell the user something is happening (aria-live reads it out)
    resultArea.textContent = "Searching…";

    try {
        // 4. Call the API; give up after 15 seconds instead of waiting forever
        const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

        // fetch does NOT fail on HTTP errors (e.g. 404, 503), so check ourselves
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        // Turn the JSON reply into a JavaScript object
        const data = await response.json();

        // 5a. Nothing matched
        if (data.foods.length === 0) {
            resultArea.textContent = `No foods found for "${foodName}". Try another word.`;
            return;
        }

        // 5b. Make one card per food, join them, and put them on the page
        const cardsHtml = data.foods.map(createFoodCard).join("");

        resultArea.innerHTML = `
            <h2>${data.foods.length} results</h2>
            <div class="food-grid">${cardsHtml}</div>
        `;

    } catch (error) {
        // 5c. Something went wrong: details in the Console, simple message for the user
        console.error(error);

        // TimeoutError = no answer within 15 seconds (set above)
        if (error.name === "TimeoutError") {
            resultArea.textContent = "The food database is responding slowly right now. Please try again in a moment.";
        } else {
            resultArea.textContent = "Something went wrong. Please try again.";
        }
    }
});