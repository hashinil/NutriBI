<img width="180" height="180" alt="icon" src="https://github.com/user-attachments/assets/84ee70b2-ae18-4910-9030-b482f06b046c" />

# NutriBI – Know what's on your plate
**[NutriBI](https://hashinil.github.io/NutriBI/)**

NutriBI is a responsive web application that shows the nutrition of foods and helps users find recipes that suit their diet. It is built with HTML, CSS and JavaScript and uses two APIs: USDA FoodData Central and Spoonacular.

Author: Hashini Liyanage – Web Technologies, Sheffield Hallam University

---

## How to use the app

### Home page
1. Open NutriBI. The Home page explains what the app does.
2. Choose **Check calories** to look up a food, or **Find recipes** to search for meals.
3. On a phone, tap the **☰ menu** at the top right to move between Home, Calories and Recipes.

### Calories page – check a food's nutrition
1. Type a food name in the **Food name** box (at least 2 letters), for example *banana*, *rice* or *egg*.
2. Press **Search** (or the Enter key).
3. Wait a moment while "Searching…" is shown.
4. Four matching foods appear. Each card shows:
   - **Calories** (kcal) per 100 g
   - **Carbs**, **Protein** and **Fat** in grams per 100 g
5. If nothing is found, try a different or simpler word.
6. If the food database is slow, a message asks you to try again in a moment.

### Recipes page – find recipes
1. Type a **recipe or ingredient**, for example *pasta*, *chicken* or *soup*.
2. Optionally narrow the search:
   - **Cuisine** – choose one, such as Italian or Indian
   - **Diet** – choose Any, Vegetarian, Vegan or Gluten free
   - **Maximum calories per serving** – enter a number between 100 and 2000
   - **Avoid** – tick any ingredients to leave out (Dairy, Egg, Peanut, Seafood)
3. Press **Find recipes**.
4. Four recipes appear, showing the photo, name, **calories per serving**, cooking time and number of servings.
5. **Click a recipe card** to open its details:
   - Calories, carbs, protein and fat per serving
   - Ingredients list
   - Step-by-step cooking method
6. Close the details with the **✕** button, the **Esc** key, or by clicking outside the box.
7. If no recipes match, remove some filters or try another word.

### Using the app with a keyboard
- Press **Tab** to move between links, buttons and form fields. A coloured outline shows where you are.
- Press **Tab** once on any page to show **Skip to main content**, then **Enter** to jump past the menu.
- Press **Enter** or **Space** to open the menu or a recipe card.

---

## How it works

```
You type a search  →  JavaScript sends it to an online food database (API)
                   →  the database replies with data (JSON)
                   →  JavaScript turns the data into cards on the page
```

| Page     | Data source                |
|----------|----------------------------|
| Calories | USDA FoodData Central API  |
| Recipes  | Spoonacular API            |

---

## Project files

| File               | Purpose                                              |
|--------------------|------------------------------------------------------|
| `index.html`       | Home page                                            |
| `calories.html`    | Calories search page                                 |
| `recipes.html`     | Recipe search page with filter form and popup        |
| `css/styles.css`   | All styles (mobile first, with media queries)        |
| `js/main.js`       | Mobile menu and shared helper functions              |
| `js/calories.js`   | USDA API search and food cards                       |
| `js/recipes.js`    | Spoonacular API search, recipe cards and popup       |
| `images/icon.png`  | Browser tab icon                                     |

## Running the app

Open `index.html` in a modern web browser (Chrome, Edge, Firefox or Safari). An internet connection is needed for the searches.

## Data sources

- Nutrition data: [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide)
- Recipe data: [Spoonacular API](https://spoonacular.com/food-api)
