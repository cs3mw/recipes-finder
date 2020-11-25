// Get params passed in query string
const urlParams = new URLSearchParams(window.location.search);

/**
 * Fetch recipes from data store
 */
async function fetchRecipes() {
    return await fetch('./data.json');
}

/**
 * Fetch and wait for recipes to be recieved
 */
fetchRecipes()
.then(response => response.json())
.then(recipes => {
    // Build UI
    let tags = loadTags(recipes);
    displayTags(tags);

    // Build recipe result list
    filterRecipes(urlParams, recipes);
})
.catch(error => console.log(error));


/****************************************************************
 * ********************* DATA HANDLING **************************
 ***************************************************************/

/**
 * Filter recipes by provided params
 */
const filterRecipes = (params = {}, recipes = []) => {
    let filteredRecipes = [];

    if (params.has('search') || params.has('tag')) {
        let searchTermElement = document.getElementById('search-term');
        let searchTermSpanElement = document.createElement('span');

        let searchTermTextNode = null;

        if (params.has('search')) {
            let searchTerm = params.get('search').toLowerCase();
            searchTermTextNode = document.createTextNode(`You searched for: ${searchTerm}`);
            filteredRecipes = searchRecipesForString(searchTerm, recipes);
        } else if (params.has('tag')) {
            let tag = params.get('tag');
            searchTermTextNode = document.createTextNode(`You filtered by tag: ${params.get('tag')}`);
            filteredRecipes = filterRecipesByTag(tag, recipes);
        }

        searchTermSpanElement.appendChild(searchTermTextNode);
        
        // Create clear button to clear params
        let clearButtonElement = document.createElement('button');
        clearButtonElement.classList.add('btn');
        clearButtonElement.classList.add('btn-outline-secondary');
        let clearButtonTextNode = document.createTextNode('Clear');
        clearButtonElement.appendChild(clearButtonTextNode);

        // Attach onlick function
        clearButtonElement.onclick = () => clearParams();

        // Append search term text and clear button to parent div
        searchTermElement.appendChild(searchTermSpanElement);
        searchTermElement.appendChild(clearButtonElement);
    } else {
        // Default case, i.e. first load
        filteredRecipes = recipes;
    }

    // Pass the array list to displayRecipes for displaying of relevant recipes.
    displayRecipes(filteredRecipes);
}

/**
 * Search recipes by string
 */
const searchRecipesForString = (string = '', recipes= []) => {
    return recipes.filter(recipe => {
        // convert recipeTitle, recipeDescription to lowercase.
        let recipeTitle = recipe.title.toLowerCase();
        let recipeDescription = recipe.description.toLowerCase();

        // check to see if search term is in ingredients at least once. 
        let recipeIngredients = recipe.ingredients.find(ingredient => ingredient.indexOf(string) > -1);

        // check to see if search term is in RecipeTitle, RecipeDescription or RecipeIngredients.
        let inRecipeTitle = recipeTitle.indexOf(string) > -1;
        let inRecipeDescription = recipeDescription.indexOf(string) > -1;
        let inRecipeIngredients = typeof recipeIngredients != 'undefined';
        
        return inRecipeTitle || inRecipeDescription || inRecipeIngredients;
    });
}

/**
 *  Filter recipes by tag
 */
const filterRecipesByTag = (tag = '', recipes = []) => recipes.filter(recipe => recipe.tags.includes(tag));

/**
 * Parse tags from recipe list
 */
const loadTags = (recipes = []) => {
    let tagArray = [];
    for (var key in recipes) {
        tagArray = tagArray.concat(recipes[key].tags);
    }
    let tags = removeDuplicates(tagArray);
    return tags;
}

/**
 * Remove duplicates from an array
 */
const removeDuplicates = array => [...new Set(array)];

/****************************************************************
 ********************** UI FUNCTIONS ****************************
 ***************************************************************/

/**
 * Handle display of recipe search/filter results
 */
const displayRecipes = (recipes = []) => {
    // set div.card-group to empty 
    document.getElementById('card-group').innerHTML = '';
    

    for (var key in recipes) {
        let cardElement = null;
        let cardBodyElement = null;
        let cardTitleElement = null;
        let cardDescriptionElement = null;
        let cardButtonElement = null;

        // create div.card.col-lg-4
        cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.classList.add('col-lg-4');

        // create div.card-body
        cardBodyElement = document.createElement('div');
        cardBodyElement.classList.add('card-body');

        // create h5.card-title
        cardTitleElement = document.createElement('h5');
        cardTitleElement.classList.add('card-title');
        cardTitleText = document.createTextNode(recipes[key].title);
        cardTitleElement.appendChild(cardTitleText);

        // create p.card-text
        cardDescriptionElement = document.createElement('p');
        cardDescriptionElement.classList.add('card-text');
        cardDescriptionText = document.createTextNode(recipes[key].description.substring(0, 150));
        cardDescriptionElement.appendChild(cardDescriptionText);

        // create button.btn.btn-secondary
        cardButtonElement = document.createElement('button');
        cardButtonElement.classList.add('btn');
        cardButtonElement.classList.add('btn-outline-secondary');
        cardButtonElement.id = `view-recipe-${key}`;
        cardButtonText = document.createTextNode('View Recipe');
        cardButtonElement.appendChild(cardButtonText);

        // create onclick event to execute displayRecipe()
        cardButtonElement.onclick = (function(recipe) {
            return function() {
               displayRecipe(recipe);
            };
        })(recipes[key]);

        // build card element
        cardBodyElement.appendChild(cardTitleElement);
        cardBodyElement.appendChild(cardDescriptionElement);
        cardBodyElement.appendChild(cardButtonElement);
        cardElement.appendChild(cardBodyElement);

        // adding card to card-group
        let cardGroupElement = document.getElementById('card-group');
        cardGroupElement.appendChild(cardElement);

    }
}
/**
 * Outputs list of tags into div.display_tags
 */
const displayTags = (tags = []) =>  {
    let displayTagsContainer = document.getElementById('display_tags');

    // loops through tags array and creates a link for each tag
    for (var key in tags) {
        let tagLink = document.createElement('a');
        tagLink.href = `?tag=${tags[key]}`;
        let tagLinkTextNode = document.createTextNode(tags[key]);
        tagLink.appendChild(tagLinkTextNode);

        //appends tagLink to div.display_tags
        displayTagsContainer.appendChild(tagLink);
    }
}

/**
 * Clear search/filter results
 */
const clearParams = () => {
    window.location.href = "/";
}

/**
 * Display full recipe in a modal
 */
const displayRecipe = (recipe = {}) => {
    // empty recipetitle and modal-body from previous execution.
    document.getElementById('recipetitle').innerHTML = "";
    document.getElementById('modal-body').innerHTML = "";

    // set variable modalBody.
    let modalBody = document.getElementById("modal-body");

    // Populate recipe title
    let recipeTitleElement = document.getElementById('recipetitle');
    let recipeTitleText = document.createTextNode(recipe.title);
    recipeTitleElement.appendChild(recipeTitleText);

    // create author section i.e. author name and link to authors web page
    if (recipe.author) {
        var recipeAuthorElement = document.createElement('p');
        let recipeAuthorSpanElement = document.createElement('span');
        let recipeAuthorSpanText = document.createTextNode('View more fantastic recipes by ');
        let recipeAuthorLink = document.createElement('a');
        let recipeAuthorNameText = document.createTextNode(recipe.author.name);

        recipeAuthorSpanElement.appendChild(recipeAuthorSpanText);
        recipeAuthorLink.href = recipe.author.url;
        recipeAuthorLink.appendChild(recipeAuthorNameText);
        recipeAuthorElement.appendChild(recipeAuthorSpanElement);
        recipeAuthorElement.appendChild(recipeAuthorLink);
        modalBody.appendChild(recipeAuthorElement);
    }

    // create recipe description.
    if (recipe.description) {
        var recipeDescriptionElement = document.createElement('p');
        let recipeDescriptionText = document.createTextNode(recipe.description);

        recipeDescriptionElement.appendChild(recipeDescriptionText);
        modalBody.appendChild(recipeDescriptionElement);
    }

    // create preparation time
    if (recipe.prep_time_min) {
        var recipePreparationElement = document.createElement('p');
        let recipePreparationText = document.createTextNode(`Preparation Time: ${recipe.prep_time_min}`);

        recipePreparationElement.appendChild(recipePreparationText);
        modalBody.appendChild(recipePreparationElement);
    }

    // create cooking time
    if (recipe.cook_time_min) {
        var recipeCookingElement = document.createElement('p');
        let recipeCookingText = document.createTextNode(`Cooking Time: ${recipe.cook_time_min}`);

        recipeCookingElement.appendChild(recipeCookingText);
        modalBody.appendChild(recipeCookingElement);
    }

    let servingButtonsContainer = document.createElement('div');
    servingButtonsContainer.classList.add('input-group');
    let servingSpan = document.createElement('span');
    servingSpan.classList.add('serve-span');
    let servingSpanText = document.createTextNode('Serves');

    // Create serving decrement button
    let servingDecrementButton = document.createElement('input');
    servingDecrementButton.classList.add('button-minus');
    servingDecrementButton.type = 'button';
    servingDecrementButton.value = '-';
    servingDecrementButton.setAttribute('data-field', 'quantity');

    servingDecrementButton.onclick = (function(recipe) {
        return function() {
           decrementValue(recipe);
        };
    })(recipe);

    // Create serving amount input field
    let servingNumberInput = document.createElement('input');
    servingNumberInput.classList.add('quantity-field')
    servingNumberInput.type = 'number';
    servingNumberInput.step = recipe.servings;
    servingNumberInput.value = recipe.servings;
    servingNumberInput.min = 1;
    servingNumberInput.id = 'serving';
    servingNumberInput.name = 'serving';

    // Create serving increment button
    let servingIncrementButton = document.createElement('input');
    servingIncrementButton.classList.add('button-plus');
    servingIncrementButton.type = 'button';
    servingIncrementButton.value = '+';
    servingIncrementButton.setAttribute('data-field', 'quantity');
    
    servingIncrementButton.onclick = (function(recipe) {
        return function() {
           incrementValue(recipe);
        };
    })(recipe);

    // Append serving form elements to container
    servingSpan.appendChild(servingSpanText);
    servingButtonsContainer.appendChild(servingSpan);
    servingButtonsContainer.appendChild(servingDecrementButton);
    servingButtonsContainer.appendChild(servingNumberInput);
    servingButtonsContainer.appendChild(servingIncrementButton);

    modalBody.appendChild(servingButtonsContainer);

    // Build ingredients list
    let ingredientsHeader = document.createElement('h5');
    let ingredientsHeaderText = document.createTextNode('Ingredients');
    ingredientsHeader.appendChild(ingredientsHeaderText);
    let ingredientList = document.createElement('ul');
    ingredientList.id = 'ingredientlist';

    for (let ingredientIndex in recipe.ingredients) {
        let ingredientListItem = document.createElement('li');
        let ingredientText = document.createTextNode(recipe.ingredients[ingredientIndex]);
        ingredientListItem.appendChild(ingredientText);
        ingredientList.append(ingredientListItem);
    }

    // Build directions list
    let directionsHeader = document.createElement('h5');
    let directionsHeaderText = document.createTextNode('Directions');
    directionsHeader.appendChild(directionsHeaderText);
    let directionList = document.createElement('ol');

    for (let directionIndex in recipe.directions) {
        let directionListItem = document.createElement('li');
        let directionText = document.createTextNode(recipe.directions[directionIndex]);
        directionListItem.appendChild(directionText);
        directionList.append(directionListItem);
    }

    //appends Ingredients & Directions to modalBody
    modalBody.appendChild(ingredientsHeader);
    modalBody.appendChild(ingredientList);
    modalBody.appendChild(directionsHeader);
    modalBody.appendChild(directionList);

    // Opens Modal when content is ready to be displayed
    openModal()
}

/**
 * Open recipe modal
 */
const openModal = () => {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("recipeModal").style.display = "block"
    document.getElementById("recipeModal").className += "show"
}

/**
 * Close recipe modal
 */
const closeModal = () => {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("recipeModal").style.display = "none"
    document.getElementById("recipeModal").className += document.getElementById("recipeModal").className.replace("show", "")
}

/**
 * Increment serving count in recipe modal
 */
const incrementValue = (recipe = {}) => {
    let currentServing = document.getElementById("serving").value;
    currentServing++;
    document.getElementById("serving").value = currentServing;
    changeServingInRecipe(recipe, currentServing);
}

/**
 * Decrement serving count in recipe modal
 */
const decrementValue = (recipe = {}) => {
    var currentServing = document.getElementById("serving").value;
    currentServing--;
    document.getElementById("serving").value = currentServing;
    changeServingInRecipe(recipe, currentServing);
}


/****************************************************************
 * ******* MATHS FUNCTIONS FOR CHANGING SERVING SIZES ***********
 ***************************************************************/

/**
 * Update ingredient measurements of recipe
 */
const changeServingInRecipe = (recipe = {}, newServing = 0) => {
    var originalServing = recipe.servings;
    var adaptIngredients = recipe.ingredients;

    // Empty ingredients list before updating
    document.getElementById('ingredientlist').innerHTML = '';

    for (var key in adaptIngredients) {
        let parsedIngredient = adaptIngredients[key].split(' ');
        let amount = null;
        
        // Check if first part of ingredient string is a whole number/fraction
        if (isFraction(parsedIngredient[0]) || isNumeric(parsedIngredient[0])) {
            let firstPart = parsedIngredient.shift()

            // Convert fraction (if required) to decimal and add to current decimal amount
            amount = parseFloat(convertStringToDecimal(firstPart));
        }
        
        // Check if second part of ingredient string is a whole number/fraction
        if (isFraction(parsedIngredient[0]) || isNumeric(parsedIngredient[0])) {
            let secondPart = parsedIngredient.shift();

            // Convert fraction (if required) to decimal and add to current decimal amount
            let convertedAmount = parseFloat(convertStringToDecimal(secondPart))
            amount = amount + convertedAmount;
        }
        
        // If ingredient string has a numeric value associated then proceed
        if (amount) {
            // Calculate single serving amount of ingredient as decimal
            let singleServingDecimal = amount / originalServing;

            // Decimal amount for new serving 
            let modifiedServingAmount = singleServingDecimal * newServing;

            // Extract whole number and decimal difference from the modified serving amount
            modifiedServingAmount = modifiedServingAmount.toFixed(1);
            let modifiedServingModulas = modifiedServingAmount % 1;
            modifiedServingModulas = modifiedServingModulas.toFixed(1);
            let modifiedServingWhole = Math.floor(modifiedServingAmount / 1);

            // Build array containing parts of amount
            let modifiedAmountStringArray = [];

            // If modified serving amount has a whole number add it to string
            if (modifiedServingWhole > 0) {
                modifiedAmountStringArray.push(modifiedServingWhole);
            }

            // If modified serving amount has a fractional amount
            if (modifiedServingModulas > 0) {
                let numerator = parseInt(modifiedServingModulas.replace('0.', ''));
                let denominator = 10;

                // If numerator is 3/6 create default fraction strings
                // Otherwise, calculate greatest common divisor of numerator and denominator
                // and reduce fraction
                switch (numerator) {
                    case 3:
                        modifiedAmountStringArray.push('1/3');
                        break;
                    case 6:
                        modifiedAmountStringArray.push('2/3');
                        break;
                    default:
                        let greatestCommonDivisor = gcd(numerator, denominator);
                        numerator /= greatestCommonDivisor;
                        denominator /= greatestCommonDivisor;
                        modifiedAmountStringArray.push(`${numerator}/${denominator}`);
                        break;
                }
            }
            
            // Build amount string
            let modifiedAmountString = modifiedAmountStringArray.join(' ');

            // And push back to the front of ingredient string array
            parsedIngredient.unshift(modifiedAmountString);
        }

        // Build ingredient list item and push back to ingredient list
        let modifiedIngredient = parsedIngredient.join(' ');
        let ingredientListElement = document.getElementById('ingredientlist');
        let ingredientListItem = document.createElement('li');
        let ingredientTextNode = document.createTextNode(modifiedIngredient);
        ingredientListItem.appendChild(ingredientTextNode);
        ingredientListElement.appendChild(ingredientListItem);
    }
}

/**
 * Determine if string contains a fraction
 */
const isFraction = (string = '') => {
    let parsedString = string.split('/');
    return (parsedString.length > 1 && parseInt(parsedString[0]) && parseInt(parsedString[1]));
}

/**
 * Convert a fraction string to a decimal
 */
const convertStringToDecimal = (string = '') => {
    try {
        // Use eval to execute fraction string division
        return eval(string);
    } catch (error) {};
};

/**
 * Determine if number is numeric, either whole number or decimal
 */
const isNumeric = (n = 0) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Calculate the greatest common divisor of two numbers
 */
const gcd = (a = 0, b = 0) => {
    a = Math.abs(a);
    b = Math.abs(b);

    if (b > a) {
        let temp = a;
        a = b;
        b = temp;
    }
    
    while (true) {
        if (b == 0) {
            return a;
        }
        a %= b;

        if (a == 0) {
            return b;
        }
        b %= a;
    }
}