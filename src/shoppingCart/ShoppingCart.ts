import { Optimizer } from "../optimizers/OptimizerInterface";
import { Item } from "./ShoppingCartCore";
import { CartEntry } from "./CartEntry";
import { ActionTaken } from "../optimizers/Action";
import { getMarketPriceForItem } from "./ShoppingCartCore";
import { Buffs } from "./../buffs/Buffs";

export interface ShoppingCartCalculation {
  currentCart: Array<CartEntry>;
  recipePrice: number;
  cumulativeTimeSpent: number;
}

export class ShoppingCart {
  cart: Array<CartEntry>;
  optimizer: Optimizer;

  /**
   *
   * @param optimizer Instance of PPSOptimizer
   */
  constructor(optimizer: Optimizer) {
    this.cart = [];
    this.optimizer = optimizer;
  }

  clearCart() {
    this.cart = [];
  }

  /**
   *
   * @param optimizer
   */
  setOptimizer(optimizer: Optimizer) {
    this.optimizer = optimizer;
  }

  /**
   * Clears the cart and begins recursively adding items to the cart
   * @param itemName
   * @param quantity
   * @param items
   */
  calculateCosts(
    itemName: string,
    quantity: number = 1,
    items: { [key: string]: Item }
  ): ShoppingCartCalculation {
    this.clearCart();
    return this.addItem(
      itemName,
      quantity,
      items[itemName].activeRecipeId,
      "",
      items,
      ""
    );
  }

  /**
   * Adds item to cart if it doesn't exist. Ues recursion to add ingredients as well.
   * @param itemName
   * @param quantity
   * @param selectedRecipeId
   * @param parentName
   * @param items
   * @param parentPath
   */
  addItem(
    itemName: string,
    quantity: number = 1,
    selectedRecipeId: string,
    parentName: string = "",
    items: { [key: string]: Item } = {},
    parentPath: string = ""
  ): ShoppingCartCalculation {
    // Ensure the input is valid
    // console.log("ShoppingCart.js | Adding item to shopping cart:", itemName);

    if (itemName == "" || quantity <= 0)
      return { currentCart: this.cart, recipePrice: 0, cumulativeTimeSpent: 0 };
    const item = items[itemName];
    // console.log("ShoppingCart.js | Valid Item:", item);

    if (item == null)
      return { currentCart: this.cart, recipePrice: 0, cumulativeTimeSpent: 0 };

    const currentPath = `${parentPath || ""}/${itemName}`;
    // console.log("ShoppingCart.js | Item Path:", currentPath);

    if (item.usedInRecipes[currentPath] == null)
      return { currentCart: this.cart, recipePrice: 0, cumulativeTimeSpent: 0 };

    // Get the recipe object using the selectedRecipeId string
    const recipe = item.recipes[selectedRecipeId];
    // console.log("ShoppingCart.js | Recipe:", recipe);

    if (recipe == null && selectedRecipeId != "")
      return { currentCart: this.cart, recipePrice: 0, cumulativeTimeSpent: 0 };

    // Prevent infinite looping
    // let action = selectedRecipeId == "" ? ActionTaken.Buy : ActionTaken.Craft;
    // const recipePathArr = currentPath.split("/");
    // const containsLoop = new Set(recipePathArr).size !== recipePathArr.length;
    // console.log("Shopping Cart - Path:", currentPath);

    // if (containsLoop) {
    //   console.log("Contains Loop");
    //   action = ActionTaken.Buy;
    // }

    const action = item.usedInRecipes[currentPath].actionTaken;

    // Calculate how many times the player must 'craft' the item
    let craftCount = quantity;
    if (action === ActionTaken.Craft) {
      craftCount = Math.ceil(quantity / recipe.quantityProduced);
    }

    // Add the ingredients of the recipe to the cart as well if the item is being crafted
    let recipePrice = 0;
    let cumulativeTimeSpent = 0;

    if (action === ActionTaken.Craft) {
      for (let ingredient of recipe.ingredients) {
        const ingredientQuantity = ingredient["Amount"] * craftCount;
        const ingredientName = ingredient["Item Name"];
        const ingredientItem = items[ingredientName];
        const activeRecipeId =
          ingredientItem == null ? "" : ingredientItem.activeRecipeId;
        const {
          recipePrice: price,
          cumulativeTimeSpent: timeSpentToCraftIngredient,
        } = this.addItem(
          ingredientName,
          ingredientQuantity,
          activeRecipeId,
          itemName,
          items,
          currentPath
        );

        recipePrice += price * ingredient["Amount"];
        cumulativeTimeSpent +=
          timeSpentToCraftIngredient * ingredient["Amount"];
      }
      cumulativeTimeSpent += recipe.timeToProduce;
      cumulativeTimeSpent /= recipe.quantityProduced;
      recipePrice /= recipe.quantityProduced;
    } else {
      recipePrice = getMarketPriceForItem(item);
    }

    const shoppingCartData: CartEntry = {
      // name: itemName,
      action: action,
      // recipe: recipe != null ? recipe.ingredients : null,
      craftCount: craftCount,
      expectedCount:
        action === "Craft" ? recipe.quantityProduced * craftCount : craftCount, // Store the total amount that is expected to be crafted
      individualPrice: recipePrice,
      cumulativeTimeSpent: cumulativeTimeSpent,
      for: parentName,
      // marketData: marketData
    };
    this.cart.push(shoppingCartData);
    // console.log('Added shopping cart data for ', itemName, shoppingCartData)
    items[itemName].addShoppingCartData(currentPath, shoppingCartData);
    return { currentCart: this.cart, recipePrice, cumulativeTimeSpent };
  }

  printShoppingCart() {
    console.log(JSON.stringify(this.cart, null, 4));
  }

  /**
   * @deprecated
   * @param item Object of type Item
   * @param recipeId The recipe Id you want the price calculated for
   * @param items All items (From ItemManager.parseRecipes())
   */
  getPriceForRecipe(
    item: Item,
    recipeId: string,
    items: { [key: string]: Item }
  ): number {
    const recipe = item.recipes[recipeId];
    if (recipeId == null) return getMarketPriceForItem(item);

    let totalCost = 0;
    for (const ingredient of recipe.ingredients) {
      const ingredientName = ingredient["Item Name"];
      totalCost += this.getPriceForRecipe(
        items[ingredientName],
        items[ingredientName].activeRecipeId,
        items
      );
    }

    return totalCost;
  }
}
