import { Recipe } from "./../shoppingCart/ShoppingCartCore";
import { Optimizer, OptimalActions } from "./OptimizerInterface";
import { Action, ActionTaken } from "./Action";
import { getMarketPriceForItem } from "../shoppingCart/ShoppingCartCore";

export class PPSOptimizer extends Optimizer {
  /**
   * Find the most optimal actions
   */
  findOptimalActionSets(): {
    [key: string]: { recipe: Recipe; optimalActions: OptimalActions };
  } {
    if (this.rootItemName == null || this.items == null) return {};

    const bestRecipeActions: {
      [key: string]: { recipe: Recipe; optimalActions: OptimalActions };
    } = {};
    const rootItem = this.items[this.rootItemName];
    if (rootItem == null) return {};

    for (const [recipeId, recipe] of Object.entries(rootItem.recipes)) {
      this.startCalculatingOptimalActions(this.rootItemName, recipeId);
      bestRecipeActions[recipeId] = {
        recipe: recipe,
        optimalActions: this.optimalActions,
      };
    }

    return bestRecipeActions;
  }

  startCalculatingOptimalActions(
    itemName: string,
    startingRecipeId: string | null
  ): OptimalActions {
    this.resetOptimalActions();
    // starting recipe id == null is the 'Buy' action
    if (
      itemName == "" ||
      itemName == null ||
      this.items == null ||
      this.items == {}
    ) {
      return {};
    }

    this.optimalActions = this.calculateOptimalActions(
      itemName,
      startingRecipeId,
      null
    );
    return this.optimalActions || {};
  }

  /**
   *
   * @param item
   * @param recipeRestriction Must choose this recipe
   * @param optimalActions
   */
  calculateOptimalActions(
    itemName: string,
    recipeRestriction: string | null,
    optimalActions: OptimalActions | null
  ): OptimalActions {
    if (recipeRestriction == "") recipeRestriction = null;

    // Initialize dictionary
    if (optimalActions == null) optimalActions = {};

    // Double check itemName
    if (itemName == null) return optimalActions;
    const item = this.items[itemName];

    // If the calculations were already performed, just return those.
    if (optimalActions[itemName] != null) return optimalActions;

    // What is the cost to buy this item?
    const itemMarketPrice = getMarketPriceForItem(item);
    if (optimalActions[itemName] == null) {
      optimalActions[itemName] = {
        [ActionTaken.Buy]: new Action(itemMarketPrice, 0, null, null, null),
        [ActionTaken.Craft]: null,
      };
    }

    // For every possible recipe that can be crafted...
    let possibleCraftOptions = [];
    for (const [recipe_id, possibleRecipe] of Object.entries(item.recipes)) {
      // If there is a recipe restriction, skip all other recipes
      if (recipeRestriction != null && recipe_id !== recipeRestriction)
        continue;

      // Skip to next recipe if there is no crafting option
      const recipeIngredients = possibleRecipe.ingredients;
      if (recipeIngredients == null) continue;

      // Generate all possible sequences of 'Buy' or 'Craft' for the list of ingredients
      let arr = [];
      for (let i = 0; i < recipeIngredients.length; i++) {
        arr.push("Buy");
      }
      const gen = this.sequenceGenerator(arr.length, arr, 0); // Sample sequence: ['Buy', 'Sell', 'Buy']
      let generatorResult = gen.next();
      while (generatorResult.done === false) {
        const sequence = generatorResult.value;
        const action = this.calculateRecipeCostUsingSequence(
          sequence,
          possibleRecipe,
          recipe_id,
          optimalActions
        );
        if (action != null) possibleCraftOptions.push(action);

        // Pick next sequence to test...
        generatorResult = gen.next();
      }
    }

    if (possibleCraftOptions.length > 0) {
      optimalActions[item.name]["Craft"] = this.pickBestCraftingAction(
        possibleCraftOptions,
        itemMarketPrice
      );
    }

    return optimalActions;
  }

  pickBestCraftingAction(
    possibleCraftOptions: Array<Action>,
    itemMarketPrice: number
  ) {
    return possibleCraftOptions.reduce((bestAction: Action, action: Action) => {
      let bestActionProfit = bestAction.calculateProfit(itemMarketPrice);
      let profit = action.calculateProfit(itemMarketPrice);

      // This if statement handles symbolic recipes
      if (!Number.isFinite(profit)) {
        profit = -action.monetaryCost;
      }
      if (!Number.isFinite(bestActionProfit)) {
        bestActionProfit = -bestAction.monetaryCost;
      }

      // We found a better crafting recipe!
      if (profit > bestActionProfit) return action;
      else return bestAction;
    });
  }

  calculateRecipeCostUsingSequence(
    sequence: Array<ActionTaken>,
    recipe: Recipe,
    recipe_id: string,
    optimalActions: any
  ): Action | null {
    const recipeIngredients = recipe.ingredients;

    let totalCost = 0;
    let totalTime = 0;
    let sequenceImpossible = false;

    for (let i = 0; i < sequence.length; i++) {
      // Buy or craft the ingredient?
      const buyOrCraft = sequence[i];
      const ingredient = recipeIngredients[i]; // The string

      const result: any = this.calculateOptimalActions(
        ingredient["Item Name"],
        null,
        optimalActions
      );
      const action = result[ingredient["Item Name"]][buyOrCraft] as Action;
      // The provided sequence is impossible. (Cannot craft the ingredient!)
      if (action == null) {
        sequenceImpossible = true;
        break;
      }

      // For this 'possible recipe' what is the cost to craft it?
      // (using optimal action)
      if (buyOrCraft === "Buy") {
        totalCost += ingredient["Amount"] * action.monetaryCost;
      } else {
        // Some items used to produce this ingredent may have been bought while others were crafted
        totalTime += ingredient["Amount"] * action.time;
        totalCost += ingredient["Amount"] * action.monetaryCost;
      }
    }

    totalTime += recipe.timeToProduce
    if (recipe.action in this.buffs) {
      totalTime = Math.max(totalTime - this.buffs[recipe.action].timeReduction, 0)
      // console.log(recipe.action, totalTime)
    }

    // console.log('PPSOptimizer.jsx | ', item.name, generatorResult.value, totalCost / recipe.quantityProduced, recipe)
    if (!sequenceImpossible) {
      // The sequence was valid!
      return new Action(
        totalCost / recipe.quantityProduced,
        totalTime / recipe.quantityProduced,
        recipe,
        recipe_id,
        [...sequence]
      );
    } else return null;
  }
}
