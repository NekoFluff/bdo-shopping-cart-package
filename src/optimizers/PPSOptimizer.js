import ProfitCalculator from '../shoppingCart/ShoppingCartProfitCalculator';
class PPSOptimizer {

  constructor(items, rootItemName) {
    this.setItems(items, rootItemName)
  }

  setItems(items, rootItemName) {
    this.items = items
    this.rootItemName = rootItemName
  }

  /**
   * Find the most optimal actions
   * @param {string} rootItemName Name of the main product being produced
   * @param {object} items {key: item name, value: Item Object found in recipesDashboard.jsx}
   */
  findOptimalActionSets() {
    if (this.rootItemName == null || this.items == null) return null;

    const bestRecipeActions = {}
    const rootItem = this.items[this.rootItemName]

    for (const [recipeId, recipe] of Object.entries(rootItem.recipes)) {
      this.startCalculatingOptimalActions(this.rootItemName, recipeId)
      bestRecipeActions[recipeId] = {recipe: recipe, optimalActions: this.optimalActions}
    }

    return bestRecipeActions
  }

  startCalculatingOptimalActions(itemName, startingRecipeId) {
    this.optimalActions = {}

    if (itemName == null || this.items == null || startingRecipeId == null) { 
      return null; 
    }
    
    this.optimalActions = this.calculateOptimalActions(itemName, startingRecipeId)
    return this.optimalActions
  }
  
  printOptimalActions() {
    // console.log('Hierarchy View of Recipe:', JSON.stringify(this.items, null, 4))
    console.log(JSON.stringify(this.optimalActions, null, 4))
  }

  * sequenceGenerator(n, arr, i) {
      if (i === n) {
        yield arr
        return
      }

      arr[i] = 'Buy'
      yield* this.sequenceGenerator(n, arr, i+1)      

      arr[i] = 'Craft'
      yield* this.sequenceGenerator(n, arr, i+1)
   }

   /**
    * 
    * @param {object} item 
    * @param {string} recipeRestriction Must choose this recipe
    * @param {object} optimalActions 
    */
  calculateOptimalActions(itemName, recipeRestriction = null, optimalActions = {}) {
    if (itemName == null) return optimalActions;
    const item = this.items[itemName]

    // If the calculations were already performed, just return those.
    if (optimalActions[itemName] != null) return optimalActions

    // What is the cost to buy this item?
    const itemMarketPrice = item.getMarketPrice()
    if (optimalActions[itemName] == null) {
      optimalActions[itemName] = {}
      if (!item.isSymbolic)
        optimalActions[itemName]['Buy'] = new Action(itemMarketPrice, 0, null, null, null)
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
            optimalActions[ingredient['Item Name']] = {}
            optimalActions[ingredient['Item Name']]['Buy'] = new Action(itemMarketPrice, 0, null, null, null)
            // console.log("ERROR: There is no recipe entry for " + ingredient['Item Name'])
            continue
          }

          const result = this.calculateOptimalActions(ingredient['Item Name'], null, optimalActions)
          const action = result[ingredient['Item Name']][buyOrCraft]
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
      if (profit > bestProfitValue) {
        bestAction = action
        bestProfitValue = profit
      }
    }

    // console.log('PPSOptimizer.jsx | Action!!!', item.name, bestAction)
    optimalActions[item.name]['Craft'] = bestAction
    
    return optimalActions
  }
}


class Action {
  /**
   * 
   * @param {decimal} monetaryCost Cost of individual item
   * @param {decimal} time Time spent per item
   * @param {obj} recipe 
   * @param {string} recipe_id 
   * @param {[string]} actionSequence 
   */
  constructor(monetaryCost = 0, time = 0, recipe = null, recipe_id = null, actionSequence = null) {
    this.monetaryCost = monetaryCost 
    this.time = time 
    this.recipe = recipe
    this.recipe_id = recipe_id
    this.actionSequence = actionSequence
  }

  calculateProfit(sellPrice) {
    let mode = 'pps' //TODO: Switch based on mode of optimization selected
    // Measure the profit for each action
    // console.log('[Action] calculateProfit() | Sell price:', sellPrice, 'Cost to obtain (per item):', this.monetaryCost, 'Amount of time (per item):', this.time)
    if (mode === 'pps')
    return this.calculatePPS(sellPrice)
  }

  calculatePPS(sellPrice) {
    return ProfitCalculator.calculateProfitPerSecond(sellPrice, this.monetaryCost, this.time)
  }
}

export default PPSOptimizer