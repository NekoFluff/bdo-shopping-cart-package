import { Buffs } from "./../buffs/Buffs";
import { ShoppingCart } from "./ShoppingCart";
import { CartEntry } from "./CartEntry";
import { OptimalActions } from "./../optimizers/OptimizerInterface";
import { ActionTaken } from "../optimizers/Action";
import { PPSOptimizer } from "./../optimizers/PPSOptimizer";

export const getMarketPriceForItem = (item: Item): number => {
  return (
    item.overrideMarketPrice ||
    (item.marketData && item.marketData["Market Price"]) ||
    0
  );
};

export const getShoppingCartDataForItem = (
  item: Item,
  recipePath: string
): CartEntry => {
  return item.shoppingCartData[recipePath];
};

export class Item {
  name: string;
  marketData: any;
  shoppingCartData: { [key: string]: CartEntry };
  recipes: { [key: string]: Recipe };
  usedInRecipes: {
    [key: string]: {
      actionTaken: ActionTaken;
      parentName: string;
      parentRecipeId: string;
    };
  };
  activeRecipeId: string;
  depth: number;
  overrideMarketPrice: number | null;
  isSymbolic: boolean;

  /**
   * Create a new Item object
   * @param initialItemData e.g {Action: string, Ingredients: [], Market Data: {}, Name: string, Quantity Produced: float, Recipe: [], Time to Produce: float}
   */
  constructor(initialItemData: any) {
    // console.log("Initial Item Data", initialItemData)
    this.name = initialItemData["Name"];
    this.marketData = initialItemData["Market Data"];
    this.shoppingCartData = {};
    this.recipes = {};
    this.usedInRecipes = {};
    this.activeRecipeId = "";
    this.depth = initialItemData["depth"] || -1;
    this.overrideMarketPrice = null;
    this.isSymbolic = false; // A symbolic recipe is not meant to be bought
    this.addRecipe(
      initialItemData["_id"],
      initialItemData["Name"],
      initialItemData["Recipe"],
      initialItemData["Quantity Produced"],
      initialItemData["Time to Produce"],
      initialItemData["Action"]
    );
  }

  /**
   *
   * @param _id
   * @param productName
   * @param recipe
   * @param quantityProduced
   * @param timeToProduce
   * @param action
   */
  addRecipe(
    _id: string,
    productName: string,
    recipe: Array<object>,
    quantityProduced: number,
    timeToProduce: number,
    action: string
  ) {
    if (this.recipes[_id] == null) {
      this.recipes[_id] = new Recipe(
        productName,
        recipe,
        quantityProduced,
        timeToProduce,
        action
      );

      if (action == "Symbolic") {
        this.isSymbolic = true;
      }
    }

    // this.printRecipes()
  }

  /**
   *
   * @param actionTaken // Craft or Buy
   * @param parentName // What recipe is this item used in?
   * @param parentRecipeId // What recipe is this item used in?
   * @param activeRecipeId // One of the recipes to craft this item
   * @param recipePath // One of the recipes to craft this item
   */
  addUse(
    actionTaken: ActionTaken,
    parentName: string,
    parentRecipeId: string,
    activeRecipeId: string,
    recipePath: string
  ) {
    this.usedInRecipes[recipePath] = {
      actionTaken,
      parentName,
      parentRecipeId,
    };

    if (this.activeRecipeId == "") this.selectRecipe(activeRecipeId);
    else if (activeRecipeId != this.activeRecipeId) {
      console.log(
        "POSSIBLE ERROR: Recursive recipe OR recipe needs to be bought/crafted at the same time... or crafted using multiple recipes. \nItem name:",
        this.name,
        "\nActive recipe:",
        this.activeRecipeId,
        "\nTarget recipe:",
        activeRecipeId
      );
    }
  }
  /**
   *
   * @param recipePath
   * @param data
   */
  addShoppingCartData(recipePath: string, data: CartEntry) {
    this.shoppingCartData[recipePath] = data;
  }

  selectRecipe(recipeId: string) {
    if (this.recipes[recipeId] != null) {
      this.activeRecipeId = recipeId;
    } else if (recipeId == "" || recipeId == null) {
      this.activeRecipeId = "";
    }
  }

  resetUses = (recipePath: string) => {
    if (recipePath == null) {
      this.usedInRecipes = {};
    } else {
      delete this.usedInRecipes[recipePath];
      delete this.shoppingCartData[recipePath];
    }

    // console.log("Reset Use: ", this.name, 'Recipe Path:', recipePath, 'Used in Recipes:', JSON.stringify(this.usedInRecipes, null, 4), JSON.stringify(this.shoppingCartData, null, 4))
    if (Object.keys(this.usedInRecipes).length == 0) this.activeRecipeId = "";
  };

  setDepth(depth: number) {
    if (this.depth == -1 || depth < this.depth) {
      this.depth = depth;
    }
  }

  applyBuffs(buffs: Buffs) {
    for (const recipe of Object.values(this.recipes)) {
      recipe.applyBuffs(buffs);
    }
  }

  printRecipes() {
    console.log("Recipes:", this.recipes);
  }
}

export class Recipe {
  productName: string;
  ingredients: Array<any>;
  quantityProduced: number;
  timeToProduce: number;
  originalTimeToProduce: number;
  action: string;

  /**
   *
   * @param productName
   * @param ingredients
   * @param quantityProduced
   * @param timeToProduce
   * @param action
   */
  constructor(
    productName: string,
    ingredients: Array<any>,
    quantityProduced: number,
    timeToProduce: number,
    action: string
  ) {
    this.productName = productName;
    this.ingredients = ingredients;
    this.quantityProduced = quantityProduced;
    this.timeToProduce = timeToProduce;
    this.originalTimeToProduce = timeToProduce;
    this.action = action;
  }

  printIngredients() {
    console.log("Ingredients:", this.ingredients);
  }

  applyBuffs(buffs: Buffs) {
    if (this.action in buffs) {
      this.timeToProduce = Math.max(
        this.originalTimeToProduce - buffs[this.action].timeReduction,
        0
      );
    }
  }
}

export class ItemManager {
  items: { [key: string]: Item };
  alreadyResetPath: { [key: string]: boolean };
  shoppingCart: ShoppingCart;
  officialProductName: string = "";
  defaultCraftCount: number;

  constructor() {
    this.items = {};
    this.alreadyResetPath = {}; // To keep track of paths reset when calling 'startRecursiveReset'
    this.shoppingCart = new ShoppingCart(new PPSOptimizer());
    this.defaultCraftCount = 100;
  }

  /**
   * Parses the information retrieved from the backend to produce the state object 'items'
   * @param {} recipes
   */
  parseRecipes(recipes: Array<any>): { [key: string]: Item } {
    // console.log("Original Recipes Data: ", recipes);
    this.items = {};
    if (recipes == null) return this.items;

    // Get the official name of the item being produced
    this.officialProductName = "";
    if (recipes.length > 0) this.officialProductName = recipes[0]["Name"];

    // Parse Recipe and prep for the display in table format
    for (const recipe of recipes) {
      this.addItem(this.items, recipe);

      for (let ingredient of recipe.Ingredients) {
        this.addItem(this.items, ingredient);
      }
    }

    return this.items;
  }

  applyBuffs(buffs: Buffs) {
    if (!buffs) return;
    for (const item of Object.values(this.items)) {
      item.applyBuffs(buffs);
    }
  }

  /**
   *
   * @param items {key: item name, value: Item object}
   * @param item
   */
  addItem(items: { [key: string]: Item }, item: any) {
    if (item == null || items == null) return;

    if (items[item["Name"]] == null) {
      items[item["Name"]] = new Item(item);
    } else {
      items[item["Name"]].addRecipe(
        item["_id"],
        item["Name"],
        item["Recipe"],
        item["Quantity Produced"] || 0,
        item["Time to Produce"] || 0,
        item["Action"]
      );
      if (item["Name"] != this.officialProductName)
        items[item["Name"]].setDepth(item["depth"]);
    }

    // console.log('item name', item.Name)
  }

  /**
   * Starting at the recipe path, remove all references pointing to that item.
   * In other words, all paths branching off that recipePath provided will have their 'usedInRecipes' dictionary reset
   * @param itemName // Name of the item
   * @param recipePath // Path to reach the item (ingredient)
   */
  resetRecipePath = (itemName: string, recipePath: string) => {
    // Parse path variables
    let pathArr = recipePath.split("/");
    let parentName = pathArr.length >= 2 ? pathArr[pathArr.length - 2] : null;
    if (parentName == "") parentName = null;
    let parentPath: string | null = pathArr.slice(0, -1).join("/");
    if (parentPath == "") parentPath = null;
    // console.log('Reset', pathArr, parentName, parentPath)

    // Reset items that were dependent on the previous recipe
    this.startRecursiveReset(this.items[itemName], this.items, parentPath);
  };

  /**
   *
   * @param item Instance of the Item object
   * @param items Dictionary of Item objects. This is used to referenced Items used in the recipe
   */
  startRecursiveReset(
    item: Item,
    items: { [key: string]: Item },
    parentPath: string | null
  ) {
    this.alreadyResetPath = {};
    // console.log("recipesDashboard.jsx | Starting recursive reset:", parentPath, item);
    this.recursivelyResetItemUses(item, items, parentPath);
  }

  /**
   *
   * @param item Instance of the Item object
   * @param items Dictionary of Item objects. This is used to referenced Items used in the recipe
   */
  recursivelyResetItemUses(
    item: Item,
    items: { [key: string]: Item },
    parentPath: string | null = null
  ) {
    if (item == null || items == null) return;

    const recipeId = item.activeRecipeId;
    const currentPath = `${parentPath || ""}/${item.name}`;
    if (this.alreadyResetPath[currentPath]) {
      console.log("Already reset", item.name);
      return;
    }
    if (item.usedInRecipes[currentPath] == null) {
      // console.log('No recipe data available for item/path', item.name, currentPath, JSON.stringify(item.usedInRecipes,null, 4));
      return;
    }
    this.alreadyResetPath[currentPath] = true;

    if (recipeId != "") {
      for (let ingredient of item.recipes[recipeId].ingredients) {
        const ingredientName = ingredient["Item Name"];
        // console.log(
        //   "Ingredient reset:",
        //   ingredient["Item Name"], parentPath
        // );
        // const newPath = `${currentPath || ''}/${ingredientName}`

        this.recursivelyResetItemUses(
          items[ingredientName],
          items,
          currentPath
        );
      }
    }
    // items[ingredientName].resetUses(newPath);

    item.resetUses(currentPath);
    items[item.name] = item;
  }

  /**
   * Splits it into /parentPath/parentName
   * @param path
   */
  splitPath(
    path: string
  ): {
    parentPath: string;
    parentName: string;
    currentItemName: string;
  } {
    const pathArr = path.split("/");
    let currentItemName =
      pathArr.length >= 2 ? pathArr[pathArr.length - 1] : "";
    let parentName = pathArr.length >= 2 ? pathArr[pathArr.length - 2] : "";
    let parentPath: string = pathArr.slice(0, -1).join("/");
    // console.log('Select', pathArr, parentName, parentPath)

    return { parentPath, parentName, currentItemName };
  }

  /**
   * Callback function for RecipesTable.onRecipeClick
   * Updates the 'this.items' object in this component's state, which updates the RecipesTable(s)
   * @param itemName The name of the item
   * @param recipeId The id of the recipe selected
   */
  selectRecipe = (itemName: string, recipeId: string, recipePath: string) => {
    const items = this.items;

    // Step 1: Parse recipe Path and get the parent Recipe Id for later
    const { parentName, parentPath } = this.splitPath(recipePath);
    let parentRecipeId =
      this.items[parentName] != null
        ? this.items[parentName].activeRecipeId
        : "";

    // Step 2: Select the recipe
    // console.log("ITEMS", items);
    // console.log("ITEM NAME", itemName);
    if (items[itemName] == null) return;
    items[itemName].selectRecipe(recipeId);
    // console.log('recipesDashboard.jsx | items after recursive reset', items)

    // Step 2: Find the best way to make money using the new decision
    this.shoppingCart.optimizer.setItems(items, this.officialProductName);
    let optimalActions = this.shoppingCart.optimizer.startCalculatingOptimalActions(
      itemName,
      recipeId
    );
    // console.log("optimalActions", optimalActions);
    let chosenAction = recipeId == "" ? ActionTaken.Buy : ActionTaken.Craft;

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
   * @param overrides
   * {
   *  craftCount: int
   * }
   */
  recalculate = (overrides: { craftCount: number } | null = null) => {
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
        this.defaultCraftCount,
        this.items
      );
    }
  };

  resetToOptimal(): { [key: string]: Item } {
    if (this.officialProductName == null) {
      return this.items;
    }

    // Get optimal action for each recipe of the root product
    this.shoppingCart.optimizer.setItems(this.items, this.officialProductName);
    const bestRecipeActions = this.shoppingCart.optimizer.findOptimalActionSets();
    const product = this.officialProductName;
    // Choose most optimal recipe and the optimal actions for profit
    let bestActionSet = null;
    for (let actionSetIdx in bestRecipeActions) {
      const actionSet = bestRecipeActions[actionSetIdx];
      if (bestActionSet == null) {
        bestActionSet = actionSet;
        continue;
      }

      const oldCraftAction = bestActionSet.optimalActions[product].Craft;
      const newCraftAction = actionSet.optimalActions[product].Craft;
      const marketPrice = getMarketPriceForItem(this.items[product]);
      if (
        oldCraftAction != null &&
        newCraftAction != null &&
        oldCraftAction.calculateProfit(marketPrice) <
          newCraftAction.calculateProfit(marketPrice)
      )
        bestActionSet = actionSet;
    }

    // console.log("Best Action Set", bestActionSet);
    if (bestActionSet != null) {
      let craftAction = bestActionSet["optimalActions"][product].Craft;
      if (craftAction != null) {
        this.selectRecipe(product, craftAction.recipe_id, `/${product}`);
      } else {
        this.selectRecipe(
          product,
          bestActionSet.optimalActions[product].Buy.recipe_id,
          `/${product}`
        );
      }
    }

    return this.items;
  }

  /**
   * Selects the RecipeTables that should be active by modifying the 'this.items' object
   * @param optimalActions The set of actions determined by the user
   * @param currentItem Name of the item
   * @param actionTaken 'Buy' or 'Craft'
   * @param items  this.items
   */
  cascadeActiveRecipeWithOptimalActions(
    optimalActions: OptimalActions,
    currentItemName: string,
    actionTaken: ActionTaken,
    items: { [key: string]: Item } = { ...this.items },
    parent: {
      parentRecipeId: string;
      parentName: string;
      parentPath: string;
    }
  ): { [key: string]: Item } {
    const { parentRecipeId, parentName, parentPath } = parent;
    // console.log("Optimal Actions", JSON.stringify(optimalActions, null, 4));
    // console.log("Active Item:", currentItemName);
    // console.log("Action Taken:", actionTaken);
    if (items[currentItemName].isSymbolic) actionTaken = ActionTaken.Craft;
    const action = optimalActions[currentItemName][actionTaken];
    if (action == null) return items; // Base case. Return when there is no valid action

    const currentPath = `${parentPath || ""}/${currentItemName}`;
    const recipePathArr = currentPath.split("/");
    const containsLoop = new Set(recipePathArr).size !== recipePathArr.length;
    if (containsLoop) {
      actionTaken = ActionTaken.Buy;
    }

    if (items[currentItemName] != null) {
      items[currentItemName].addUse(
        actionTaken,
        parentName,
        parentRecipeId,
        action.recipe_id,
        currentPath
      ); // e.g. Item.addUse('Craft', parentRecipeId, action's recipe Id which may be null if Buying)
    } else {
      console.log(
        `ERROR: '${currentItemName}' does not have a recipe entry in the database. Request a FIX by sending a DM on discord to @Kitsune#1040`
      );
    }
    if (actionTaken === ActionTaken.Buy) return items;

    // Recursively update activeRecipes dictionary using more calls to cascadeActiveRecipeWithOptimalActions
    for (const ingredientIdx in action.recipe!.ingredients) {
      const ingredient = action.recipe!.ingredients[ingredientIdx];
      const name = ingredient["Item Name"];
      const ingredientAction = action.actionSequence![ingredientIdx];
      const newParent = {
        parentRecipeId: action.recipe_id,
        parentName: currentItemName,
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
