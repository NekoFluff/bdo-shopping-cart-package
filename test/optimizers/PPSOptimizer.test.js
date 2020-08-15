import PPSOptimizer from './../../src/optimizers/PPSOptimizer';
import { ItemManager } from './../../src/shoppingCart/ShoppingCartCore';
import recipesSample from '../../test.data/recipesSample'
import { expect } from 'chai'
import sinon from 'sinon'

describe('PPSOptimizer class tests', () => {
  let items
  let optimizer
  let itemManager

  before(() => {
    itemManager = new ItemManager()
    items = itemManager.parseRecipes(recipesSample)

  })

  beforeEach(() => {
    optimizer = new PPSOptimizer()
    optimizer.setItems(items)
  })

  describe('recipes sample contains Acacia Plywood', () => {
    it('should contain the Acacia Plywood recipe', () => {
      expect(items['Acacia Plywood']).to.not.equal(null)
    })
  })

  describe('findOptimalActionSets function test', () => {
    beforeEach(() => {
      optimizer.startCalculatingOptimalActions = sinon.spy()
    })

    it('should return 4 optimal actions (one for each recipe)', () => {
      const bestActions = optimizer.findOptimalActionSets('Acacia Plywood', items)
      expect(Object.keys(bestActions).length).to.equal(4)
    })

    it('should return null with no rootItemName provided', () => {
      const bestActions = optimizer.findOptimalActionSets(null, items)
      expect(bestActions).to.equal(null)
    })
    
    it('should return null with no items dictionary provided', () => {
      const bestActions = optimizer.findOptimalActionSets('Acacia Plywood')
      expect(bestActions).to.equal(null)
    })
  })


  describe('startCalculatingOptimalActions function test', () => {
    beforeEach(() => {
      optimizer.calculateOptimalActions = sinon.spy()
    })

    it('should return null with no rootItemName provided', () => {
      const optimalActions = optimizer.startCalculatingOptimalActions(null, items, '5f35c46485ccdb8cadac761b')
      expect(optimalActions).to.equal(null)
      expect(optimizer.calculateOptimalActions.calledOnce).to.equal(false)
    })
    
    it('should return null with no items dictionary provided', () => {
      const optimalActions = optimizer.startCalculatingOptimalActions('Acacia Plywood', null, '5f35c46485ccdb8cadac761b')
      expect(optimalActions).to.equal(null)
      expect(optimizer.calculateOptimalActions.calledOnce).to.equal(false)
    })
    
    it('should return null with no startingRecipeId provided', () => {
      const optimalActions = optimizer.startCalculatingOptimalActions('Acacia Plywood', items, null)
      expect(optimalActions).to.equal(null)
      expect(optimizer.calculateOptimalActions.calledOnce).to.equal(false)
    })
    
    it('should work', () => {
      const optimalActions = optimizer.startCalculatingOptimalActions('Acacia Plywood', items, '5f35c46485ccdb8cadac761b')
      expect(optimalActions).to.not.equal(null)
      expect(optimizer.calculateOptimalActions.calledOnce).to.equal(true)
    })
  })

  describe('sequenceGenerator function test', () => {
    it('should generate 32', () => {
      let arr = []
      for (let i = 0; i < 5; i++) { arr.push("Buy") }
      const gen = optimizer.sequenceGenerator(arr.length, arr, 0) // Sample sequence: ['Buy', 'Sell', 'Buy']
      let generatorResult = gen.next()

      // 5 long
      expect(generatorResult.value.length).to.equal(5)

      // All actions are 'Buy'
      for (const action of generatorResult.value) {
        expect(action).to.equal('Buy')
      }
      
      // 32 possible sequences
      let allResults = []
      while (generatorResult.done === false) {
        allResults.push(generatorResult.value)
        generatorResult = gen.next()
      }
      expect(allResults.length).to.equal(32)
    })
  })

  describe('calculateOptimalActions function test', () => {
    it('should return the already calculated optimal actions dictionary', () => {
      let optimalActions = {'Acacia Plywood': 'Action'}
      const optimalActionsResult = optimizer.calculateOptimalActions(items['Acacia Plywood'], '5f35c46485ccdb8cadac761b', optimalActions)
      expect(optimalActionsResult).to.be.equal(optimalActions)
      expect(Object.keys(optimalActionsResult).length).to.equal(1)
    })

    it('should return the current optimal actions if no item is provided', () => {
      let optimalActions = {'Acacia Plywood': 'Action'}
      const optimalActionsResult = optimizer.calculateOptimalActions(null, '5f35c46485ccdb8cadac761b', optimalActions)
      expect(optimalActionsResult).to.be.equal(optimalActions)
      expect(Object.keys(optimalActionsResult).length).to.equal(1)
    })

    it('should work', () => {
      let optimalActions = {}
      const optimalActionsResult = optimizer.calculateOptimalActions(items['Acacia Plywood'], '5f35c46485ccdb8cadac761b', optimalActions)
      expect(optimalActionsResult['Acacia Plywood']['Buy']['monetaryCost']).to.equal(17100)
      expect(optimalActionsResult['Acacia Plywood']['Buy']['time']).to.equal(0)
      expect(optimalActionsResult['Acacia Plywood']['Buy']['recipe']).to.equal(null)
      expect(optimalActionsResult['Acacia Plywood']['Buy']['recipe_id']).to.equal(null)
      expect(optimalActionsResult['Acacia Plywood']['Buy']['actionSequence']).to.equal(null)
      expect(optimalActionsResult['Acacia Plywood']['Craft']['monetaryCost']).to.equal(36600)
      expect(optimalActionsResult['Acacia Plywood']['Craft']['time']).to.equal(744)
      expect(optimalActionsResult['Acacia Plywood']['Craft']['recipe']).to.not.equal(null)
      expect(optimalActionsResult['Acacia Plywood']['Craft']['recipe_id']).to.equal('5f35c46485ccdb8cadac761b')
      expect(optimalActionsResult['Acacia Plywood']['Craft']['actionSequence']).to.not.equal(null)
      expect(optimalActionsResult['Acacia Plywood']['Craft']['actionSequence']).to.be.a('array')
    })
  })
})

