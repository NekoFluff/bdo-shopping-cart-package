import { ProfitCalculator } from './../shoppingCart/ShoppingCartProfitCalculator';
import { Recipe } from '../shoppingCart/ShoppingCartCore'

export enum ActionTaken {
  Buy = 'Buy',
  Craft = 'Craft'
}

export class Action {
  monetaryCost: number 
  time: number
  recipe: Recipe | null
  recipe_id: string
  actionSequence: Array<ActionTaken> | null

  /**
   * 
   * @param monetaryCost Cost of individual item
   * @param time Time spent per item
   * @param recipe 
   * @param recipe_id 
   * @param actionSequence 
   */
  constructor(monetaryCost: number = 0, time: number = 0, recipe: Recipe | null, recipe_id: string | null, actionSequence: Array<ActionTaken> | null) {
    this.monetaryCost = monetaryCost 
    this.time = time 
    this.recipe = recipe
    this.recipe_id = recipe_id || ''
    this.actionSequence = actionSequence
  }

  calculateProfit(sellPrice: number): number {
    return this.calculatePPS(sellPrice)
  }

  calculatePPS(sellPrice: number): number {
    return ProfitCalculator.calculateProfitPerSecond(sellPrice, this.monetaryCost, this.time)
  }
}