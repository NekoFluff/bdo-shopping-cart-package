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
    items = itemManager.parseRecipes(recipesSample)
    items = itemManager.resetToOptimal();
  })

  beforeEach(() => {
    shoppingCart = new ShoppingCart()
  })

  describe('clearCart function test', () => {
    it('should empty the cart', () => {
      shoppingCart.cart = ['A', 'B', 'C']
      shoppingCart.clearCart()
      expect(shoppingCart.cart.length).to.equal(0)
    })
  })

  describe('setOptimizer function test', () => {
    it('should set the optimizer', () => {
      let optimizer = new PPSOptimizer()
      shoppingCart.setOptimizer(optimizer)
      expect(shoppingCart.optimizer).to.equal(optimizer)
    })
  })

  describe('calculateCosts function test', () => {
    beforeEach(() => {
      shoppingCart.cart = ['A', 'B', 'C']
      shoppingCart.addItem = sinon.spy()
    })

    it('should clear the cart and call the additem function', () => {
      const result = shoppingCart.calculateCosts('Acacia Plank', 100, items) // {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
      expect(shoppingCart.cart.length).to.equal(0)
      expect(shoppingCart.addItem.calledOnce).to.equal(true)
    })
  })

  describe('calculateCosts function test', () => {
    beforeEach(() => {
      shoppingCart.cart = ['A', 'B', 'C']
      shoppingCart.addItem = sinon.spy()
    })

    it('should clear the cart and call the additem function', () => {
      const result = shoppingCart.calculateCosts('Acacia Plank', 100, items) // {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
      expect(shoppingCart.cart.length).to.equal(0)
      expect(shoppingCart.addItem.calledOnce).to.equal(true)
    })
  })

  describe('addItem function test', () => {
    beforeEach(() => {
    })

    it('should return an empty cart', () => {
      const result = shoppingCart.addItem('Acacia Plywood', 100, '5f35c46485ccdb8cadac761b', null, items, null) // {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
      console.log(result)

      expect(result.currentCart[0]['craftCount']).to.equal(2000)
      expect(result.currentCart[0]['cumulativeTimeSpent']).to.equal(0)
      expect(result.currentCart[1]['craftCount']).to.equal(400)
      expect(result.currentCart[1]['cumulativeTimeSpent']).to.equal(2.4)
      expect(result.currentCart[2]['craftCount']).to.equal(100)
      expect(result.currentCart[2]['cumulativeTimeSpent']).to.equal(744)
      expect(result.currentCart.length).to.equal(3)
      expect(result.recipePrice).to.equal(36600)
      expect(result.cumulativeTimeSpent).to.equal(744)
    })
  })
})

