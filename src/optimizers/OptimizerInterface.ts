import { Item, Recipe } from './../shoppingCart/ShoppingCartCore';
import { Action, ActionTaken } from './Action'

export interface OptimalActions {
  [key: string]: {
    [ActionTaken.Buy]: Action,
    [ActionTaken.Craft]: Action | null,
  }
}

export interface OptimizerInterface {
  startCalculatingOptimalActions(itemName: string, startingRecipeId: string): OptimalActions
  calculateOptimalActions(itemName: string, recipeRestriction : string, optimalActions : OptimalActions | null): OptimalActions
  findOptimalActionSets(): {[key: string]: {recipe: Recipe, optimalActions: OptimalActions}}
}

export abstract class Optimizer implements OptimizerInterface {
  items : {[key: string]: Item} = {}
  rootItemName : string = ''
  optimalActions : OptimalActions = {}

  /**
   * 
   */
  constructor() { }

  /**
   * 
   * @param items 
   * @param rootItemName 
   */
  setItems(items: {[key:  string]: Item}, rootItemName: string) {
    this.items = items
    this.rootItemName = rootItemName
  }

  calculateOptimalActions(itemName: string, recipeRestriction : string, optimalActions : OptimalActions | null): OptimalActions {
    console.log('This is an abstract optimizer. This method does not need to be called.')
    return {}
  }

  startCalculatingOptimalActions(itemName: string, startingRecipeId: string): OptimalActions {
    console.log('This is an abstract optimizer. This method does not need to be called.')
    return {}
  }

  findOptimalActionSets(): {[key: string]: {recipe: Recipe, optimalActions: OptimalActions}} {
    console.log('This is an abstract optimizer. This method does not need to be called.')
    return {}
  }

  resetOptimalActions() {
    this.optimalActions = {}
  }

  * sequenceGenerator(n: number, arr: Array<string>, i: number): any {
    if (i === n) {
      yield arr
      return
    }

    arr[i] = 'Buy'
    yield* this.sequenceGenerator(n, arr, i+1)      

    arr[i] = 'Craft'
    yield* this.sequenceGenerator(n, arr, i+1)
 }

  printOptimalActions() {
    // console.log('Hierarchy View of Recipe:', JSON.stringify(this.items, null, 4))
    console.log(JSON.stringify(this.optimalActions, null, 4))
  }
}