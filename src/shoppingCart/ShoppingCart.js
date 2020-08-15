import PPSOptimizer from './../optimizers/PPSOptimizer';

class ShoppingCart {

  /**
   * 
   * @param {object} optimizer Instance of PPSOptimizer
   */
  constructor(optimizer) {
    this.cart = []
    this.optimizer = new PPSOptimizer()
  }

  clearCart() {
    this.cart = []
  }


  calculateCosts(itemName, quantity = 1, items) {
    this.clearCart()
    // for (const [key, _] of Object.entries(items)) {
    //   items[key]['shoppingCartData'] = [] // Oops everything is wiped...
    // }

    this.addItem(itemName, quantity, items[itemName].activeRecipeId, null, items)
  }

  /**
   * Adds item to cart if it doesn't exist
   * @param {object} item Instance of Item
   * @param {int} quantity The number 
   * @param {string} action Either Craft or Buy. Craft by default
   */
  addItem(itemName, quantity = 1, selectedRecipeId, parentName = null, items, parentPath) {
    // Retrieve the recipe from the optimalActions variable in the optimizer
    // console.log('ShoppingCart.js | Adding item to shopping cart:', itemName)
    const item = items[itemName]
    if (item == null) return {currentCart: this.cart, recipePrice: 0, cumulativeTimeSpent: 0}

    const currentPath = `${parentPath || ''}/${itemName}`
    const recipe = item.recipes[selectedRecipeId]

    // Prevent infinite looping
    let action = selectedRecipeId == null ? 'Buy' : 'Craft'
    const recipePathArr = currentPath.split('/')
    const containsLoop = new Set(recipePathArr).size !== recipePathArr.length
    if (containsLoop) {
      action = 'Buy'
    }
    if (item.usedInRecipes[currentPath] == null) return {currentCart: this.cart, recipePrice: 0, cumulativeTimeSpent: 0}

    // Calculate how many times the player must 'craft' the item
    let craftCount = quantity
    if (action === "Craft") {
      craftCount = Math.ceil(quantity / recipe.quantityProduced)
    }

    // Add the ingredients of the recipe to the cart as well if the item is being crafted
    let recipePrice = 0
    let cumulativeTimeSpent = 0
    if (action === "Craft") {
      for (let ingredient of recipe.ingredients) {
        const ingredientQuantity = ingredient['Amount'] * craftCount
        const ingredientName = ingredient['Item Name']
        const ingredientItem = items[ingredientName]
        const activeRecipeId = ingredientItem == null ? null : ingredientItem.activeRecipeId
        const {recipePrice: price, cumulativeTimeSpent: timeSpentToCraftIngredient} = this.addItem(ingredientName, ingredientQuantity, activeRecipeId, itemName, items, currentPath)
        recipePrice += price * ingredient['Amount']
        cumulativeTimeSpent += timeSpentToCraftIngredient * ingredient['Amount']
      }
      cumulativeTimeSpent += recipe.timeToProduce
      cumulativeTimeSpent /= recipe.quantityProduced
      recipePrice /= recipe.quantityProduced
    } else {
      recipePrice = item.getMarketPrice()
    }

    const shoppingCartData = {
      // name: itemName,
      action: action,
      // recipe: recipe != null ? recipe.ingredients : null, 
      craftCount: craftCount,
      expectedCount: action === "Craft" ? recipe.quantityProduced * craftCount : craftCount, // Store the total amount that is expected to be crafted
      individualPrice: recipePrice,
      cumulativeTimeSpent: cumulativeTimeSpent,
      for: parentName 
      // marketData: marketData
    }
    this.cart.push(shoppingCartData) 
    console.log('Added shopping cart data for ', itemName, shoppingCartData)
    items[itemName].addShoppingCartData(currentPath, shoppingCartData)
    return {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
  }

  printShoppingCart() {
    console.log(JSON.stringify(this.cart, null, 4))
  }

  getPriceForRecipe(item, recipeId, items) {
    const recipe = item.recipes[recipeId]
    if (recipeId == null) return item.getMarketPrice()
  
    let totalCost = 0
    for (const ingredient of recipe.ingredients) {
      const ingredientName = ingredient['Item Name']
      totalCost += this.getPriceForRecipe(items[ingredientName], items[ingredientName].activeRecipeId, items)
    }
  
    return totalCost
  }
}



export default ShoppingCart