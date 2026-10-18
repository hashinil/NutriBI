/* =========================================================
   NutriBI - main JavaScript (loaded on every page)
   1. Mobile menu: opens and closes the navigation on phones
   2. Shared helper: format nutrient values for the Calories and Recipes pages

   Author: Hashini Liyanage
   Created Date: 15/10/2026
   ========================================================= */

/* ---------- 1. Mobile menu ---------- */

// get the hamburger button and the menu items
// Ref: Why query selector: https://www.geeksforgeeks.org/javascript/queryselector-vs-getelementbyid/
const menuToggle = document.querySelector(".menu-toggle");
const mainMenu = document.querySelector("#main-menu");

/*
    Open or close the menu
    How it works: runs every time the hamburger button is clicked.
        Shows the menu if it is hidden, hides it if it is showing,
        and tells screen readers which state it is in.
    Input:  No, triggered by the click
    Output: No, it changes the page
    
    Ref: MDN - addEventListener/ setAttribute/ classList
        https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
        https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
        https://www.w3schools.com/jsref/prop_element_classlist.asp
*/
menuToggle.addEventListener("click", function () {
    // toggle() returns true if the class is now ON, false if OFF.
    const isOpen = mainMenu.classList.toggle("open");

    // Tell screen readers whether the menu is open or closed
    menuToggle.setAttribute("aria-expanded", isOpen);
});


/* ---------- 2. Shared helpers ---------- */

/*
   function: formatGrams
   How it works: turns a nutrient number intotext
                 - no value from the API  -> "n/a"
                 - a negative number      -> 0
                 - always 1 decimal place -> 22.8
   Input:  value - a number, or null if the API has no value
   Output: text, e.g. "22.8" or "n/a"
   Example: formatGrams(22.84) -> "22.8"
            formatGrams(null)  -> "n/a"
*/
function formatGrams(value) {
    if (value === null) {
        return "n/a";
    }
    return Math.max(0, value).toFixed(1);
}

/*
   function: createLegendItem
   how it wokrs: makes one line of the nutrient list as HTML.
   Input:  label - the nutrient name, e.g. "Carbs"
           value - the amount in grams (number or null)
   Output: HTML text for one list item
   Example: createLegendItem("Carbs", 22.8)  as <li>Carbs: 22.8 g</li>
*/
function createLegendItem(label, value) {
    return `<li>${label}: ${formatGrams(value)} g</li>`;
}