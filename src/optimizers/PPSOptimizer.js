import ProfitCalculator from '../shoppingCart/ShoppingCartProfitCalculator';

let sample = {
  "_id": "5f1a1a47f99c32cda3f4e998",
  "Action": "Cooking",
  "Is Symbolic": true,
  "Name": "Dough",
  "Quantity Produced": 2.5,
  "Time to Produce": 0,
  "Recipe": [
      {
          "Item Name": "Wheat Dough",
          "Amount": 1
      }
  ],
  "Market Data": {
      "_id": "5f15dac7cea9de4bcc529788",
      "Last Update Attempt": "2020-03-25 18:16:37.849883",
      "Last Updated": "2020-03-25 18:16:37.849883",
      "Market Price": 132,
      "Name": "Dough"
  },
  "Ingredients": [
      {
          "_id": "5f1a1a47f99c32cda3f4ea28",
          "Action": "Shaking          ",
          "Name": "Wheat Dough",
          "Quantity Produced": 2.5,
          "Time to Produce": 6,
          "Recipe": [
              {
                  "Item Name": "Mineral Water",
                  "Amount": 1
              },
              {
                  "Item Name": "Wheat Flour",
                  "Amount": 1
              }
          ],
          "Market Data": {
              "_id": "5f15dac7cea9de4bcc529817",
              "ID": 7201,
              "Last Update Attempt": "2020-03-25 18:12:28.759706",
              "Last Updated": "2020-03-25 18:12:28.759706",
              "Market Price": 1490,
              "Name": "Wheat Dough",
              "Quantity": 29421,
              "Total Trade Count": 112885498
          },
          "depth": 0
      },
      {
          "_id": "5f1a1a47f99c32cda3f4ea27",
          "Name": "Wheat",
          "Recipe": null,
          "Market Data": {
              "_id": "5f15dac7cea9de4bcc529816",
              "Last Update Attempt": "2020-03-25 18:12:34.580134",
              "Last Updated": "2020-03-04 15:27:48.801578",
              "Market Price": 750,
              "Name": "Wheat"
          },
          "depth": 2
      },
      {
          "_id": "5f1a1a47f99c32cda3f4e9d0",
          "Name": "Mineral Water",
          "Recipe": null,
          "Market Data": {
              "_id": "5f15dac7cea9de4bcc5297c0",
              "Last Update Attempt": "2020-03-25 18:12:34.573152",
              "Last Updated": "2020-03-25 18:12:34.573152",
              "Market Price": 30,
              "Name": "Mineral Water"
          },
          "depth": 1
      },
      {
          "_id": "5f1a1a47f99c32cda3f4ea29",
          "Action": "Grinding",
          "Name": "Wheat Flour",
          "Quantity Produced": 2.5,
          "Time to Produce": 6,
          "Recipe": [
              {
                  "Item Name": "Wheat",
                  "Amount": 1
              }
          ],
          "Market Data": {
              "_id": "5f15dac7cea9de4bcc529818",
              "ID": 7101,
              "Last Update Attempt": "2020-03-25 18:12:31.084649",
              "Last Updated": "2020-03-25 18:12:31.084649",
              "Market Price": 1270,
              "Name": "Wheat Flour",
              "Quantity": 123391,
              "Total Trade Count": 252390625
          },
          "depth": 1
      },
      {
          "_id": "5f221e6049123c172883a855",
          "Action": "Delete Me",
          "Name": "Wheat",
          "Quantity Produced": 2.5,
          "Time to Produce": 6,
          "Recipe": null,
          "Market Data": {
              "_id": "5f15dac7cea9de4bcc529816",
              "Last Update Attempt": "2020-03-25 18:12:34.580134",
              "Last Updated": "2020-03-04 15:27:48.801578",
              "Market Price": 750,
              "Name": "Wheat"
          },
          "depth": 2
      }
  ]
}

sample = {
  "_id": "5f1a1a47f99c32cda3f4e974",
  "Action": "Chopping",
  "Name": "Acacia Plywood",
  "Quantity Produced": 2.5,
  "Time to Produce": 6,
  "Recipe": [
      {
          "Item Name": "Acacia Plank",
          "Amount": 10
      }
  ],
  "Market Data": {
      "_id": "5f15dac7cea9de4bcc529762",
      "ID": 4681,
      "Last Update Attempt": "2020-03-25 18:12:18.801806",
      "Last Updated": "2020-03-25 18:12:18.801806",
      "Market Price": 15300,
      "Name": "Acacia Plywood",
      "Quantity": 5717,
      "Total Trade Count": 45315927
  },
  "Ingredients": [
      {
          "_id": "5f1a1a47f99c32cda3f4e973",
          "Action": "Chopping",
          "Name": "Acacia Plank",
          "Quantity Produced": 2.5,
          "Time to Produce": 6,
          "Recipe": [
              {
                  "Item Name": "Acacia Timber",
                  "Amount": 5
              }
          ],
          "Market Data": {
              "_id": "5f15dac7cea9de4bcc529761",
              "ID": 4680,
              "Last Update Attempt": "2020-03-25 18:12:16.648140",
              "Last Updated": "2020-03-25 18:12:16.648140",
              "Market Price": 3670,
              "Name": "Acacia Plank",
              "Quantity": 1942,
              "Total Trade Count": 35638445
          },
          "depth": 0
      },
      {
          "_id": "5f1a1a47f99c32cda3f4e975",
          "Action": "Gathering",
          "Name": "Acacia Timber",
          "Recipe": null,
          "Market Data": {
              "_id": "5f15dac7cea9de4bcc529763",
              "ID": 4609,
              "Last Update Attempt": "2020-03-25 18:12:17.766127",
              "Last Updated": "2020-03-25 18:12:17.766127",
              "Market Price": 1670,
              "Name": "Acacia Timber",
              "Quantity": 0,
              "Total Trade Count": 204655455
          },
          "depth": 1
      }
  ]
}


class PPSOptimizer {

  constructor(rootItem = null, items = null) {
    this.bestRecipeActions = null
    this.startCalculatingOptimalActions(rootItem, items)
  }

  /**
   * Find the most optimal actions
   * @param {string} rootItemName Name of the main product being produced
   * @param {object} items {key: item name, value: Item Object found in recipesDashboard.jsx}
   */
  findOptimalActionSets(rootItemName, items) {
    this.bestRecipeActions = {}
    const rootItem = items[rootItemName]

    for (const [recipeId, recipe] of Object.entries(rootItem.recipes)) {
      this.startCalculatingOptimalActions(rootItemName, items, recipeId)

      if (this.bestRecipeActions == null) {
        this.bestRecipeActions = {} 
      }
      this.bestRecipeActions[recipeId] = {recipe: recipe, optimalActions: this.optimalActions}
    }

    return this.bestRecipeActions
  }

  startCalculatingOptimalActions(rootItemName, items, startingRecipeId) {
    this.optimalActions = {}
    if (rootItemName == null || items == null) { return; }
    this.items = items
    this.optimalActions = this.calculateOptimalActions(this.items[rootItemName], startingRecipeId)
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
  calculateOptimalActions(item, recipeRestriction = null, optimalActions = {}) {
    // If the calculations were already performed, just return those.
    if (optimalActions[item.name] != null) return optimalActions

    // What is the cost to buy this item?
    const itemMarketPrice = item.getMarketPrice()
    if (optimalActions[item.name] == null) {
      optimalActions[item.name] = {}
      if (!item.isSymbolic)
        optimalActions[item.name]['Buy'] = new Action(itemMarketPrice, 0, null, null, null)
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
            console.log("ERROR: There is no recipe entry for " + ingredient['Item Name'])
            continue
          }

          const result = this.calculateOptimalActions(ingredientItem, null, optimalActions)
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