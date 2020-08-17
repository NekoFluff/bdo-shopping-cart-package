import { PPSOptimizer } from './../../src/optimizers/PPSOptimizer';
import { ItemManager } from './../../src/shoppingCart/ShoppingCartCore';
import recipesSample from '../../test.data/recipesSample'
import recipesSample2 from '../../test.data/recipesSample2'
import { expect } from 'chai'
import sinon from 'sinon'
import { ProfitCalculator } from './../../src/shoppingCart/ShoppingCartProfitCalculator';


describe('Shopping Cart Calculator class tests', () => {
  let items: any
  let optimizer: any
  let itemManager: any

  before(() => {
    itemManager = new ItemManager()
    items = itemManager.parseRecipes(recipesSample)
    items = itemManager.resetToOptimal() // Get best actions
    itemManager.shoppingCart.calculateCosts('Acacia Plank', 100, items)
  })

  beforeEach(() => {
    optimizer = new PPSOptimizer()
    optimizer.setItems(items)
  })

  describe('calculateProfitValuesForItem function test', () => {
    it('should work', () => {
      const result = ProfitCalculator.calculateProfitValuesForItem(items['Acacia Plywood'])
      expect(result['profit']).to.equal(-25485)
      expect(result['profitPerSecond']).to.equal(-35)
    })

    // it('should not work', () => {
    //   try {
    //     const result = ProfitCalculator.calculateProfitValuesForItem(null)
    //   } catch (e) {
    //     expect(e).to.not.equal(null)
    //   }
    // })
  })
})

describe('Shopping Cart Calculator class tests 2', () => {
  let items: any
  let optimizer: any
  let itemManager: any

  before(() => {
    itemManager = new ItemManager()
    items = itemManager.parseRecipes(recipesSample2)
    items = itemManager.resetToOptimal() // Get best actions
    itemManager.shoppingCart.calculateCosts('JIN Magic Crystal - Hystria', 100, items)
  })

  beforeEach(() => {
    optimizer = new PPSOptimizer()
    optimizer.setItems(items)
  })

  describe('calculateProfitValuesForItem function test', () => {
    it('should work', () => {
      const result = ProfitCalculator.calculateProfitValuesForItem(items['JIN Magic Crystal - Hystria'])
      expect(result['profit']).to.equal(61650000)
      expect(result['profitPerSecond']).to.equal(10275000)
    })

    it('should work', () => {
      const result = ProfitCalculator.calculateProfitValuesForItem(items['Forest Fury'])
      expect(result['profit']).to.equal(-4900000)
      expect(result['profitPerSecond']).to.equal(-Infinity)
    })

    // it('should not work', () => {
    //   try {
    //     const result = ProfitCalculator.calculateProfitValuesForItem(null)
    //   } catch (e) {
    //     expect(e).to.not.equal(null)
    //   }
    // })
  })
})