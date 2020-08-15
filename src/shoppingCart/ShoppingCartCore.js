
import ShoppingCart from './ShoppingCart';

export class Item {
  /**
   * Create a new Item object
   * @param {object} initialItemData e.g {Action: string, Ingredients: [], Market Data: {}, Name: string, Quantity Produced: float, Recipe: [], Time to Produce: float}
   */
  constructor(initialItemData) {
    if (initialItemData == null) return
    // console.log("Initial Item Data", initialItemData)
    this.name = initialItemData["Name"];
    this.marketData = initialItemData["Market Data"];
    this.shoppingCartData = {}
    this.recipes = {};
    this.usedInRecipes = {};
    this.activeRecipeId = null;
    this.depth = initialItemData["depth"] || -1;
    this.overrideMarketPrice = null;
    this.isSymbolic = false // A symbolic recipe is not meant to be bought
    this.addRecipe(
      initialItemData["_id"],
      initialItemData["Name"],
      initialItemData["Recipe"],
      initialItemData["Quantity Produced"],
      initialItemData["Time to Produce"],
      initialItemData["Action"]
    );
  }

  getMarketPrice() {
    return this.overrideMarketPrice || (this.marketData && this.marketData["Market Price"]) || 0;
  }

  addRecipe(_id, productName, recipe, quantityProduced, timeToProduce, action) {
    if (this.recipes[_id] == null) {
      this.recipes[_id] = new Recipe(
        productName,
        recipe,
        quantityProduced,
        timeToProduce,
        action
      );

      if (action == 'Symbolic') {
        this.isSymbolic = true
      }
    }

    // this.printRecipes()
  }

  /**
   *
   * @param {string} actionTaken // Craft or Buy
   * @param {string} parentName // What recipe is this item used in?
   * @param {string} parentRecipeId // What recipe is this item used in?
   * @param {string} activeRecipeId // One of the recipes to craft this item
   * @param {string} recipePath // One of the recipes to craft this item
   */
  addUse(actionTaken, parentName, parentRecipeId, activeRecipeId, recipePath) {
    this.usedInRecipes[recipePath] = ({
      actionTaken,
      parentName,
      parentRecipeId
    });

    if (this.activeRecipeId == null) this.selectRecipe(activeRecipeId);
    else if (activeRecipeId != this.activeRecipeId) {
      console.log(
        "POSSIBLE ERROR: Recursive recipe OR recipe needs to be bought/crafted at the same time... or crafted using multiple recipes. \nItem name:",
        this.name,
        '\nActive recipe:', this.activeRecipeId,
        '\nTarget recipe:', activeRecipeId
      );
    }
  }

  addShoppingCartData(recipePath, data) {
    this.shoppingCartData[recipePath] = data
  }

  getShoppingCartData(recipePath) {
    return this.shoppingCartData[recipePath]
  }

  selectRecipe(recipeId) {
    this.activeRecipeId = recipeId;
  }

  resetUses = (recipePath) => {
    if (recipePath == null) {
      this.usedInRecipes = {};
    } else {
      delete this.usedInRecipes[recipePath]
      delete this.shoppingCartData[recipePath]
    }

    // console.log("Reset Use: ", this.name, 'Recipe Path:', recipePath, 'Used in Recipes:', JSON.stringify(this.usedInRecipes, null, 4), JSON.stringify(this.shoppingCartData, null, 4))
    if (Object.keys(this.usedInRecipes).length == 0)
      this.activeRecipeId = null;
  };

  setDepth(depth) {
    if (this.depth == -1 || depth < this.depth) {
      this.depth = depth
    }
  }

  printRecipes() {
    console.log("Recipes:", this.recipes);
  }
}

export class Recipe {
  constructor(
    productName,
    ingredients,
    quantityProduced = null,
    timeToProduce = null,
    action = null
  ) {
    this.productName = productName;
    this.ingredients = ingredients;
    this.quantityProduced = quantityProduced;
    this.timeToProduce = timeToProduce;
    this.action = action
  }

  printIngredients() {
    console.log("Ingredients:", this.ingredients);
  }
}

export class ItemManager {
  constructor() {
    this.items = null
    this.alreadyResetPath = {} // To keep track of paths reset when calling 'startRecursiveReset'
    this.shoppingCart = new ShoppingCart();
  }

  /**
   * @deprecated No longer need to sort the recipes object
   * @param {object} recipes
   */
  sortRecipes(recipes) {
    if (recipes.length <= 1) return recipes;
    for (let recipe of recipes) {
      // Sort ingredients
      recipe.Ingredients = recipe.Ingredients.sort(function (a, b) {
        return (
          b["Market Data"]["Market Price"] - a["Market Data"]["Market Price"]
        );
      });
    }
  }

  /**
   * Parses the information retrieved from the backend to produce the state object 'items'
   * @param {arr} recipes
   */
  parseRecipes(recipes) {
    // console.log("Original Recipes Data: ", recipes);
    this.items = {};
    if (recipes == null) return this.items

    // Get the official name of the item being produced
    this.officialProductName = null
    if (recipes.length > 0) this.officialProductName = recipes[0]['Name']

    // Parse Recipe and prep for the display in table format
    for (const recipe of recipes) {
      this.addItem(this.items, recipe);

      for (let ingredient of recipe.Ingredients) {
        this.addItem(this.items, ingredient);
      }
    }

    return this.items;
  }

  /**
   *
   * @param {object} items {key: item name, value: Item object}
   * @param {*} item
   */
  addItem(items, item) {
    if (item == null || items == null) return

    if (items[item.Name] == null) {
      items[item.Name] = new Item(item);
    } else {
      items[item.Name].addRecipe(
        item["_id"],
        item["Name"],
        item.Recipe,
        item["Quantity Produced"],
        item["Time to Produce"],
        item["Action"]
      );
      if (item.Name != this.officialProductName)
        items[item.Name].setDepth(item['depth'])
    }

    // console.log('item name', item.Name)
  }

  /**
   * Starting at the recipe path, remove all references pointing to that item.
   * In other words, all paths branching off that recipePath provided will have their 'usedInRecipes' dictionary reset
   * @param {string} itemName // Name of the item
   * @param {string} recipePath // Path to reach the item (ingredient) 
   */
  resetRecipePath = (itemName, recipePath) => {

    // Parse path variables
    let pathArr = recipePath.split('/')
    let parentName = pathArr.length >= 2  ? pathArr[pathArr.length - 2] : null
    if (parentName == "") parentName = null
    let parentPath = pathArr.slice(0, -1).join('/')
    if (parentPath == "") parentPath = null
    // console.log('Reset', pathArr, parentName, parentPath)

    // Reset items that were dependent on the previous recipe
    this.startRecursiveReset(this.items[itemName], this.items, parentPath);
  }

  /**
   *
   * @param {object} item Instance of the Item object
   * @param {object} items Dictionary of Item objects. This is used to referenced Items used in the recipe
   */
  startRecursiveReset(item, items, parentPath) {
    this.alreadyResetPath = {}
    // console.log("recipesDashboard.jsx | Starting recursive reset:", parentPath, item);
    return this.recursivelyResetItemUses(item, items, parentPath);
  }

  /**
   *
   * @param {object} item Instance of the Item object
   * @param {object} items Dictionary of Item objects. This is used to referenced Items used in the recipe
   */
  recursivelyResetItemUses(item, items, parentPath = null) {
    if (item == null || items == null) return

    const recipeId = item.activeRecipeId;
    const currentPath = `${parentPath || ''}/${item.name}`
    if (this.alreadyResetPath[currentPath]) {
      console.log('Already reset', item.name); 
      return;
    }
    if (item.usedInRecipes[currentPath] == null) {
      // console.log('No recipe data available for item/path', item.name, currentPath, JSON.stringify(item.usedInRecipes,null, 4)); 
      return;
    }
    this.alreadyResetPath[currentPath] = true

    if (recipeId != null) {
      for (let ingredient of item.recipes[recipeId].ingredients) {
        const ingredientName = ingredient["Item Name"];
        // console.log(
        //   "Ingredient reset:",
        //   ingredient["Item Name"], parentPath
        // );
        const newPath = `${currentPath || ''}/${ingredientName}`

        this.recursivelyResetItemUses(items[ingredientName], items, currentPath);
      }
    }
    // items[ingredientName].resetUses(newPath);

    item.resetUses(currentPath)
    items[item.name] = item;
  }

  /**
   * Splits it into /parentPath/parentName
   * @param {string} path 
   */
  splitPath(path) {
    const pathArr = path.split('/')
    let currentItemName = pathArr.length >= 2  ? pathArr[pathArr.length - 1] : null
    if (currentItemName == "") currentItemName = null
    let parentName = pathArr.length >= 2  ? pathArr[pathArr.length - 2] : null
    if (parentName == "") parentName = null
    let parentPath = pathArr.slice(0, -1).join('/')
    if (parentPath == "") parentPath = null
    // console.log('Select', pathArr, parentName, parentPath)

    return {parentPath, parentName, currentItemName}
  }

  /**
   * Callback function for RecipesTable.onRecipeClick
   * Updates the 'this.items' object in this component's state, which updates the RecipesTable(s)
   * @param {string} itemName The name of the item
   * @param {string} recipeId The id of the recipe selected
   */
  selectRecipe = (itemName, recipeId, recipePath) => {
    const items = this.items;

    // Step 1: Parse recipe Path and get the parent Recipe Id for later
    const {parentName, parentPath} = this.splitPath(recipePath)
    let parentRecipeId = this.items[parentName] != null ? this.items[parentName].activeRecipeId : null
    
    // Step 2: Select the recipe
    items[itemName].selectRecipe(recipeId);
    // console.log('recipesDashboard.jsx | items after recursive reset', items)

    // Step 2: Find the best way to make money using the new decision
    let optimalActions = this.shoppingCart.optimizer.startCalculatingOptimalActions(
      itemName,
      items,
      recipeId
    );
    // console.log("optimalActions", optimalActions);
    let chosenAction = recipeId == null ? "Buy" : "Craft";

    // Step 3: Using the new optimal actions calculated, update the items object so that the corresponding tables are displayed
    this.cascadeActiveRecipeWithOptimalActions(
      optimalActions,
      itemName,
      chosenAction,
      items,
      {
        parentRecipeId: parentRecipeId,
        parentName: parentName,
        parentPath: parentPath,
      }
    );

    
    // Step 4: Recalculate all the costs!
    this.recalculate();
  };

  /**
   *
   * @param {obj} overrides
   * {
   *  craftCount: int
   *  valuePackEnabled: true/false
   * }
   */
  recalculate = (overrides) => {
    // Step 1: Calculate the costs associated with the desired action tree. (TODO: Move to separate function?)
    // console.log("THIS PROPS PRODUCT = ", this.officialProductName, this.items);
    if (overrides != null) {
      this.shoppingCart.calculateCosts(
        this.officialProductName,
        overrides.craftCount,
        this.items
      );
    } else {
      this.shoppingCart.calculateCosts(
        this.officialProductName,
        this.craftCount,
        this.items
      );
    }
  };

  resetToOptimal() {
    if (this.officialProductName == null) {
      return this.items;
    }

    // Get optimal action for each recipe of the root product
    const bestRecipeActions = this.shoppingCart.optimizer.findOptimalActionSets(
      this.officialProductName,
      this.items
    );
    const product = this.officialProductName;
    // Choose most optimal recipe and the optimal actions for profit
    let bestActionSet = null;
    for (let actionSetIdx in bestRecipeActions) {
      const actionSet = bestRecipeActions[actionSetIdx];
      if (bestActionSet == null) {
        bestActionSet = actionSet;
        continue;
      }

      const oldCraftAction = bestActionSet.optimalActions[product]["Craft"];
      const newCraftAction = actionSet.optimalActions[product]["Craft"];
      const marketPrice = this.items[product].getMarketPrice();
      if (
        oldCraftAction.calculateProfit(marketPrice) <
        newCraftAction.calculateProfit(marketPrice)
      )
        bestActionSet = actionSet;
    }

    // console.log("Best Action Set", bestActionSet);
    let craftAction = bestActionSet["optimalActions"][product]["Craft"]
    if (craftAction != null) {
      this.selectRecipe(
        product,
        craftAction.recipe_id,
        `/${product}`
      );
    } else {
      this.selectRecipe(
        product,
        bestActionSet["optimalActions"][product]["Buy"].recipe_id,
        `/${product}`
      );
    }

    return this.items
  }

  /**
   * Selects the RecipeTables that should be active by modifying the 'this.items' object
   * @param {object} optimalActions The set of actions determined by the user
   * @param {string} currentItem Name of the item
   * @param {string} actionTaken 'Buy' or 'Craft'
   * @param {object} items  this.items
   */
  cascadeActiveRecipeWithOptimalActions(
    optimalActions,
    currentItem,
    actionTaken,
    items = { ...this.items },
    parent = {}
  ) {
    const { parentRecipeId, parentName, parentPath } = parent;
    // console.log("Optimal Actions", JSON.stringify(optimalActions, null, 4));
    // console.log("Active Item:", currentItem);
    // console.log("Action Taken:", actionTaken);
    const action = optimalActions[currentItem][actionTaken];
    if (action == null) return items; // Base case. Return when there is no valid action

    const currentPath = `${parentPath || ''}/${currentItem}`
    const recipePathArr = currentPath.split('/')
    const containsLoop = new Set(recipePathArr).size !== recipePathArr.length
    if (containsLoop) {
      actionTaken = 'Buy'
    }

    if (items[currentItem] != null) {
      items[currentItem].addUse(
        actionTaken,
        parentName,
        parentRecipeId,
        action.recipe_id,
        currentPath
      ); // e.g. Item.addUse('Craft', parentRecipeId, action's recipe Id which may be null if Buying)
    } else {
      console.log(`ERROR: '${currentItem}' does not have a recipe entry in the database. Request a FIX by sending a DM on discord to @Kitsune#1040`)
    }

    if (actionTaken === "Buy") return items;

    // Recursively update activeRecipes dictionary using more calls to cascadeActiveRecipeWithOptimalActions
    for (const ingredientIdx in action.recipe.ingredients) {
      const ingredient = action.recipe.ingredients[ingredientIdx];
      const name = ingredient["Item Name"];
      const ingredientAction = action.actionSequence[ingredientIdx];
      const newParent = {
        parentRecipeId: action.recipe_id,
        parentName: currentItem,
        parentPath: currentPath,
      };
      this.cascadeActiveRecipeWithOptimalActions(
        optimalActions,
        name,
        ingredientAction,
        items,
        newParent
      );
    }

    return items;
  }
}
