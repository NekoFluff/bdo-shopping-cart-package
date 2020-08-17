// const PPSOptimizer = require('./../../src/optimizers/PPSOptimizer');
import PPSOptimizer from './../../src/optimizers/PPSOptimizer';
import { ItemManager, Item } from './../../src/shoppingCart/ShoppingCartCore';
import { expect } from 'chai'
import recipesSample from '../../test.data/recipesSample'
import sinon from 'sinon'
import ShoppingCart from './../../src/shoppingCart/ShoppingCart';
import CartEntry from './../../src/shoppingCart/CartEntry';
import { ActionTaken } from '../../src/optimizers/Action';

describe('ShoppingCart class tests', () => {
  let items: {[key: string]: Item}
  let shoppingCart: ShoppingCart
  let itemManager: ItemManager

  before(() => {
    itemManager = new ItemManager()
    items = itemManager.parseRecipes(recipesSample)
    items = itemManager.resetToOptimal();
  })

  beforeEach(() => {
    shoppingCart = new ShoppingCart(new PPSOptimizer())
  })

  describe('clearCart function test', () => {
    it('should empty the cart', () => {
      (shoppingCart.cart as any) = ['A', 'B', 'C']
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
      shoppingCart.cart = [ {
        action: ActionTaken.Buy,
        craftCount: 0,
        expectedCount: 0, // Store the total amount that is expected to be crafted
        individualPrice: 0,
        cumulativeTimeSpent: 0,
        for: '' 
      }, {
        action: ActionTaken.Buy,
        craftCount: 0,
        expectedCount: 0, // Store the total amount that is expected to be crafted
        individualPrice: 0,
        cumulativeTimeSpent: 0,
        for: '' 
      }, {
        action: ActionTaken.Buy,
        craftCount: 0,
        expectedCount: 0, // Store the total amount that is expected to be crafted
        individualPrice: 0,
        cumulativeTimeSpent: 0,
        for: '' 
      }]
      shoppingCart.addItem = sinon.spy()
    })

    it('should clear the cart and call the additem function', () => {
      const result = shoppingCart.calculateCosts('Acacia Plank', 100, items) // {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
      expect(shoppingCart.cart.length).to.equal(0)
      expect((shoppingCart.addItem as any).calledOnce).to.equal(true)
    })
  })

  describe('calculateCosts function test', () => {
    beforeEach(() => {
      shoppingCart.cart = [ {
        action: ActionTaken.Buy,
        craftCount: 0,
        expectedCount: 0, // Store the total amount that is expected to be crafted
        individualPrice: 0,
        cumulativeTimeSpent: 0,
        for: '' 
      }, {
        action: ActionTaken.Buy,
        craftCount: 0,
        expectedCount: 0, // Store the total amount that is expected to be crafted
        individualPrice: 0,
        cumulativeTimeSpent: 0,
        for: '' 
      }, {
        action: ActionTaken.Buy,
        craftCount: 0,
        expectedCount: 0, // Store the total amount that is expected to be crafted
        individualPrice: 0,
        cumulativeTimeSpent: 0,
        for: '' 
      }]
      shoppingCart.addItem = sinon.spy()
    })

    it('should clear the cart and call the additem function', () => {
      const result = shoppingCart.calculateCosts('Acacia Plank', 100, items) // {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
      expect(shoppingCart.cart.length).to.equal(0)
      expect((shoppingCart.addItem as any).calledOnce).to.equal(true)
    })
  })

  describe('addItem function test', () => {
    beforeEach(() => {
    })

    it('should return an empty cart (invalid name)', () => {
      const result = shoppingCart.addItem('asdf', 100, '5f35c46485ccdb8cadac761b', null, items, null) // {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
      expect(result.currentCart.length).to.equal(0)
    })

    it('should return an empty cart (null name)', () => {
      const result = shoppingCart.addItem(null, 100, '5f35c46485ccdb8cadac761b', null, items, null) // {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
      expect(result.currentCart.length).to.equal(0)
    })

    it('should return an empty cart (negative quantity)', () => {
      const result = shoppingCart.addItem('Acacia Plywood', -1, '5f35c46485ccdb8cadac761b', null, items, null) // {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
      expect(result.currentCart.length).to.equal(0)
    })

    it('should return an empty cart (invalid selectedRecipeId)', () => {
      const result = shoppingCart.addItem('Acacia Plywood', 100, 'aaaa', null, items, null) // {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
      expect(result.currentCart.length).to.equal(0)
    })

    it('should work (even with invalid parent name)', () => {
      const result = shoppingCart.addItem('Acacia Plywood', 100, '5f35c46485ccdb8cadac761b', 'PARENT NAME', items, null) // {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
      expect(result.currentCart.length).to.equal(3)
    })

    it('should work', () => {
      const result = shoppingCart.addItem('Acacia Plywood', 100, '5f35c46485ccdb8cadac761b', null, items, null) // {currentCart: this.cart, recipePrice, cumulativeTimeSpent}
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

