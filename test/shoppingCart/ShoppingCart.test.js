// const PPSOptimizer = require('./../../src/optimizers/PPSOptimizer');
import PPSOptimizer from './../../src/optimizers/PPSOptimizer';
import { ItemManager } from './../../src/shoppingCart/ShoppingCartCore';
import { expect } from 'chai'
import recipesSample from '../../test.data/recipesSample'
import sinon from 'sinon'
import ShoppingCart from './../../src/shoppingCart/ShoppingCart';

describe('ShoppingCart class tests', () => {
  let items
  let shoppingCart
  let itemManager

  before(() => {
    itemManager = new ItemManager()
  })

  beforeEach(() => {
    items = itemManager.parseRecipes(recipesSample)
    shoppingCart = new ShoppingCart()
  })

  describe('clearCart function test', () => {
    it('should empty the cart', () => {
      shoppingCart.cart = ['A', 'B', 'C']
      shoppingCart.clearCart()
      expect(shoppingCart.cart.length).to.equal(0)
    })
  })
})

