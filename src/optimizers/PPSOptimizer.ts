import { Recipe } from './../shoppingCart/ShoppingCartCore';
import { Optimizer, OptimalActions } from './OptimizerInterface';
import { Action, ActionTaken } from './Action';

export default class PPSOptimizer extends Optimizer {

  /**
   * Find the most optimal actions
   */
  findOptimalActionSets(): {[key: string]: {recipe: Recipe, optimalActions: OptimalActions}} {
    if (this.rootItemName == null || this.items == null) return {};


    const bestRecipeActions: {[key: string]: {recipe: Recipe, optimalActions: OptimalActions}} = {}
    const rootItem = this.items[this.rootItemName]

    for (const [recipeId, recipe] of Object.entries(rootItem.recipes)) {
      this.startCalculatingOptimalActions(this.rootItemName, recipeId)
      bestRecipeActions[recipeId] = {recipe: recipe, optimalActions: this.optimalActions}
    }

    return bestRecipeActions
  }

  startCalculatingOptimalActions(itemName: string, startingRecipeId: string | null): OptimalActions {
    this.resetOptimalActions()
    // starting recipe id == null is the 'Buy' action
    if (itemName == '' || itemName == null || this.items == null || this.items == {}) { 
      return {}; 
    }
    
    this.optimalActions = this.calculateOptimalActions(itemName, startingRecipeId, null)
    return this.optimalActions || {}
  }

   /**
    * 
    * @param item 
    * @param recipeRestriction Must choose this recipe
    * @param optimalActions 
    */
  calculateOptimalActions(itemName: string, recipeRestriction : string | null, optimalActions : OptimalActions | null): OptimalActions {
    if (recipeRestriction == '')
      recipeRestriction = null
    
    // Initialize dictionary
    if (optimalActions == null) 
      optimalActions = {}

    if (itemName == null) return optimalActions;
    const item = this.items[itemName]


    
    // If the calculations were already performed, just return those.
    if (optimalActions[itemName] != null) return optimalActions

    // What is the cost to buy this item?
    const itemMarketPrice = item.getMarketPrice()
    if (optimalActions[itemName] == null) {
      optimalActions[itemName] = {
        [ActionTaken.Buy]: new Action(itemMarketPrice, 0, null, null, null),
        Craft: null
      }
    }

    let possibleCraftOptions = []
    // For every possible recipe that can be crafted...

    for (const [recipe_id, possibleRecipe] of Object.entries(item.recipes)) {
      if (recipeRestriction != null && recipe_id !== recipeRestriction) continue;

      const recipeIngredients = possibleRecipe.ingredients
      // Skip to next recipe if there is no crafting option
      if (recipeIngredients == null) continue;

      // Generate all possible sequences of 'Buy' or 'Craft' for the list of ingredients
      let arr = []
      for (let i = 0; i < recipeIngredients.length; i++) { arr.push("Buy") }
      const gen = this.sequenceGenerator(arr.length, arr, 0) // Sample sequence: ['Buy', 'Sell', 'Buy']
      let generatorResult = gen.next()
      while (generatorResult.done === false) {
        let sequence = generatorResult.value
        let totalCost = 0
        let totalTime = 0
        let sequenceImpossible = false;

        for (let i = 0; i < sequence.length; i++) {
          // Buy or craft the ingredient?
          const buyOrCraft = sequence[i]
          const ingredient = recipeIngredients[i] // The string
          const ingredientItem = this.items[ingredient['Item Name']] // The object

          // Uh oh! There isn't a recipe entry in the database for this ingredient!
          if (ingredientItem == null) {
            optimalActions[ingredient['Item Name']] = {
              [ActionTaken.Buy]: new Action(itemMarketPrice, 0, null, null, null),
              [ActionTaken.Craft]: null
            }
            // console.log("ERROR: There is no recipe entry for " + ingredient['Item Name'])
            continue
          }

          const result : any = this.calculateOptimalActions(ingredient['Item Name'], null, optimalActions)
          const action = result[ingredient['Item Name']][buyOrCraft] as Action
          // The provided sequence is impossible. (Cannot craft the ingredient!)
          if (action == null) {
            sequenceImpossible = true;
            break;
          }

          // For this 'possible recipe' what is the cost to craft it?
          // (using optimal action)
          if (buyOrCraft === "Buy") {
            totalCost += ingredient['Amount'] * action.monetaryCost
          } else {
            // Some items used to produce this ingredent may have been bought while others were crafted
            totalTime += ingredient['Amount'] * action.time 
            // console.log('PPSOptimizer.jsx | ', item.name, ingredient['Item Name'], totalCost, action.monetaryCost, ingredient['Amount'], totalCost + action.monetaryCost * ingredient['Amount'])
            totalCost += ingredient['Amount'] * action.monetaryCost 
          } 
          
        }
        
        
        // console.log('PPSOptimizer.jsx | ', item.name, generatorResult.value, totalCost / possibleRecipe.quantityProduced, possibleRecipe)
        if (!sequenceImpossible) { // The sequence was valid!
          possibleCraftOptions.push(new Action(totalCost / possibleRecipe.quantityProduced, 
                                               (totalTime + possibleRecipe.timeToProduce) / possibleRecipe.quantityProduced, 
                                               possibleRecipe,
                                               recipe_id,
                                               [...sequence]
                                               ))

        }

        // Pick next sequence to test...
        generatorResult = gen.next()
      }
    }
    // Finally choose the best possible crafting action
    // console.log('POSSIBLE ACTIONS', possibleCraftOptions)
    let bestAction = null;
    let bestProfitValue = null;
    for (const action of possibleCraftOptions) {
      if (bestAction == null) {
        bestAction = action;
        bestProfitValue = action.calculateProfit(itemMarketPrice)

        // This if statement handles symbolic recipes
        if (!Number.isFinite(bestProfitValue)) {
          bestProfitValue = -action.monetaryCost
        }
        // console.log('ACTION:', bestProfitValue, bestAction)
        continue;
      }
      
      let profit = action.calculateProfit(itemMarketPrice)

      // This if statement handles symbolic recipes
      if (!Number.isFinite(profit)) {
        profit = -action.monetaryCost
      }

      // We found a better crafting recipe!
      if (profit > bestProfitValue!) {
        bestAction = action
        bestProfitValue = profit
      }
    }

    // console.log('PPSOptimizer.jsx | Action!!!', item.name, bestAction)
    optimalActions[item.name]['Craft'] = bestAction
    
    return optimalActions
  }
}