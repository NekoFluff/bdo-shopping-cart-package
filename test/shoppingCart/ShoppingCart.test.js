// const PPSOptimizer = require('./../../src/optimizers/PPSOptimizer');
import PPSOptimizer from './../../src/optimizers/PPSOptimizer';
import { ItemManager } from './../../src/shoppingCart/ShoppingCartCore';
import chai from 'chai'
import recipesSample from '../../test.data/recipesSample'
import sinon from 'sinon'
const expect = chai.expect

describe('ShoppingCart class tests', () => {
  let items
  let optimizer
  let itemManager

  before(() => {
    itemManager = new ItemManager()
  })

  beforeEach(() => {
    items = itemManager.parseRecipes(recipesSample)
    optimizer = new PPSOptimizer()
    optimizer.setItems(items)
  })

  describe('recipes sample contains Acacia Plywood', () => {
    it('should contain the Acacia Plywood recipe', () => {
      expect(items['Acacia Plywood']).to.not.equal(null)
    })
  })
})

