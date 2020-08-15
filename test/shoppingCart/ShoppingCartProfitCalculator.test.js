import PPSOptimizer from './../../src/optimizers/PPSOptimizer';
import { ItemManager } from './../../src/shoppingCart/ShoppingCartCore';
import recipesSample from '../../test.data/recipesSample'
import { expect } from 'chai'
import sinon from 'sinon'
import ProfitCalculator from './../../src/shoppingCart/ShoppingCartProfitCalculator';


describe('PPSOptimizer class tests', () => {
  let items
  let optimizer
  let itemManager

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

    it('should not work', () => {
      try {
        const result = ProfitCalculator.calculateProfitValuesForItem(null)
      } catch (e) {
        expect(e).to.not.equal(null)
      }
    })
  })
})