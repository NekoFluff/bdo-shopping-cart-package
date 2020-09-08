// const PPSOptimizer = require('./../../src/optimizers/PPSOptimizer');
import { ItemManager } from './../../src/shoppingCart/ShoppingCartCore';
import { expect } from 'chai'
import recipesSample from '../../test.data/recipesSample'
import sinon from 'sinon'

describe('ItemManager class tests', () => {
  let itemManager: any

  before(() => {

  })

  beforeEach(() => {
    itemManager = new ItemManager()
  })

  describe('parseRecipes function test', () => {
    it('should return an empty object', () => {
      const result = itemManager.parseRecipes(null)
      expect(Object.keys(result).length).to.equal(0)
    })

    it('should update itemManager.items', () => {
      const result = itemManager.parseRecipes(recipesSample)
      expect(Object.keys(result).length).to.equal(3) // There are 3 distinct names
      expect(Object.keys(result['Acacia Plywood'].recipes).length).to.equal(4)
      expect(Object.keys(result['Acacia Timber'].recipes).length).to.equal(1)
      expect(Object.keys(result['Acacia Plank'].recipes).length).to.equal(1)
    })
  })



  describe('addItem function test', () => {
    let items: any

    beforeEach(() => {
      items = {}
    })

    it('should not have any recipes', () => {
      itemManager.addItem(items, null)
      expect(Object.keys(items).length).to.equal(0)
    })

    it('should not have any recipes', () => {
      const item = recipesSample[0]
      itemManager.addItem(null, item)
      expect(Object.keys(items).length).to.equal(0)
    })

    it('should only include one recipe', () => {
      const item = recipesSample[0]
      itemManager.addItem(items, item)
      expect(items[item["Name"]]).to.not.equal(null)
      expect(Object.keys(items[item["Name"]].recipes).length).to.equal(1) // There are 3 distinct names
    })

    it('should only include one recipe (two inserts of the same recipe)', () => {
      const item = recipesSample[0]
      itemManager.addItem(items, item)
      itemManager.addItem(items, item)
      expect(items[item["Name"]]).to.not.equal(null)
      expect(Object.keys(items[item["Name"]].recipes).length).to.equal(1) // There are 3 distinct names
    })

    it('should include two recipes', () => {
      const item = recipesSample[0]
      itemManager.addItem(items, item)
      const item2 = recipesSample[1]
      itemManager.addItem(items, item2)
      expect(items[item["Name"]]).to.not.equal(null)
      expect(items[item2["Name"]]).to.not.equal(null)
      expect(Object.keys(items[item["Name"]].recipes).length).to.equal(2) // There are 3 distinct names
    })
  })

  describe('resetRecipePath function test', () => {
    let items: any

    beforeEach(() => {
      items = itemManager.parseRecipes(recipesSample)
      items = itemManager.resetToOptimal();
      itemManager.startRecursiveReset = sinon.spy()
    })

    it('should start the recursive reset', () => {
      itemManager.resetRecipePath('Acacia Plywood', '/Acacia Plywood')
      expect((itemManager.startRecursiveReset as any).calledOnce).to.equal(true)
    })
  })

  describe('startRecursiveReset function test', () => {
    beforeEach(() => {
      itemManager.recursivelyResetItemUses = sinon.spy()
    })

    it('should start the recursive reset', () => {
      itemManager.startRecursiveReset()
      expect((itemManager.recursivelyResetItemUses as any).calledOnce).to.equal(true)
    })
  })

  describe('recursivelyResetItemUses function test', () => {
    let items: any

    beforeEach(() => {
      items = itemManager.parseRecipes(recipesSample)
      items = itemManager.resetToOptimal();
    })

    it('should start with 1 recipe in every usedInRecipes dictionary', () => {
      expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(1)
      expect(items['Acacia Plywood'].usedInRecipes['/Acacia Plywood'].actionTaken).to.equal('Craft')
      expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(1)
      expect(items['Acacia Plank'].usedInRecipes['/Acacia Plywood/Acacia Plank'].actionTaken).to.equal('Craft')
      expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(1)
      expect(items['Acacia Timber'].usedInRecipes['/Acacia Plywood/Acacia Plank/Acacia Timber'].actionTaken).to.equal('Buy')
    })

    it('should correctly reset all usedInRecipes', () => {
      itemManager.recursivelyResetItemUses(items['Acacia Plywood'], items)
      expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(0)
      expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(0)
      expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(0)
    })

    it('should correctly reset all Acacia Plank and Acacia Timber', () => {
      itemManager.recursivelyResetItemUses(items['Acacia Plank'], items, '/Acacia Plywood')
      expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(1)
      expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(0)
      expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(0)
    })

    it('should NOT reset any given improper parentPath', () => {
      itemManager.recursivelyResetItemUses(items['Acacia Plank'], items, null)
      expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(1)
      expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(1)
      expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(1)
    })

    it('should NOT reset any given improper items input', () => {
      itemManager.recursivelyResetItemUses(items['Acacia Plank'], null, '/Acacia Plywood')
      expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(1)
      expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(1)
      expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(1)
    })

    it('should NOT reset any given improper item input', () => {
      itemManager.recursivelyResetItemUses(null, items, '/Acacia Plywood')
      expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(1)
      expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(1)
      expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(1)
    })
  })

  describe('selectRecipe function test', () => {
    let items: any

    beforeEach(() => {
      items = itemManager.parseRecipes(recipesSample)
      // items = itemManager.resetToOptimal();
    })

    it('should work', () => {
      itemManager.selectRecipe('Acacia Plywood', '5f35c46485ccdb8cadac761b', '/Acacia Plywood')
      expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(1)
      expect(items['Acacia Plywood'].usedInRecipes['/Acacia Plywood'].actionTaken).to.equal('Craft')
      expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(1)
      expect(items['Acacia Plank'].usedInRecipes['/Acacia Plywood/Acacia Plank'].actionTaken).to.equal('Craft')
      expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(1)
      expect(items['Acacia Timber'].usedInRecipes['/Acacia Plywood/Acacia Plank/Acacia Timber'].actionTaken).to.equal('Buy')
    })

    it('should work 2', () => {
      itemManager.selectRecipe('Acacia Plywood', '5f35c46485ccdb8cadac761c', '/Acacia Plywood')
      expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(1)
      expect(items['Acacia Plywood'].usedInRecipes['/Acacia Plywood'].actionTaken).to.equal('Craft')
      expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(1)
      expect(items['Acacia Plank'].usedInRecipes['/Acacia Plywood/Acacia Plank'].actionTaken).to.equal('Craft')
      expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(1)
      expect(items['Acacia Timber'].usedInRecipes['/Acacia Plywood/Acacia Plank/Acacia Timber'].actionTaken).to.equal('Buy')
    })


    it('should work 3', () => {
      itemManager.selectRecipe('Acacia Plank', '5f36115282d3cdbd58fa5c95', '/Acacia Plywood/Acacia Plank')
      expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(0)
      expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(1)
      expect(items['Acacia Plank'].usedInRecipes['/Acacia Plywood/Acacia Plank'].actionTaken).to.equal('Craft')
      expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(1)
      expect(items['Acacia Timber'].usedInRecipes['/Acacia Plywood/Acacia Plank/Acacia Timber'].actionTaken).to.equal('Buy')
    })

    it('should work with invalid parent path', () => {
      itemManager.selectRecipe('Acacia Plank', '5f36115282d3cdbd58fa5c95', '/PARENT IS WRONG/Acacia Plank')
      expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(0)
      expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(1)
      expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(1)
    })

    it('should not work with invalid recipe id', () => {
      itemManager.selectRecipe('Acacia Plank', 'asdf', '/PARENT IS WRONG/Acacia Plank')
      expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(0)
      expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(0)
      expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(0)
    })

    it('should not work with invalid recipe id', () => {
      try {
        itemManager.selectRecipe('Acacia Plank', null, '/PARENT IS WRONG/Acacia Plank')
      } catch (e) {
        expect(e).to.not.equal(null)
        expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(0)
        expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(0)
        expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(0)
      }
    })

    it('should not work with invalid recipe id', () => {
      try {
        itemManager.selectRecipe('Poop', '5f36115282d3cdbd58fa5c95', '/PARENT IS WRONG/Acacia Plank')
      } catch (e) {
        expect(e).to.not.equal(null)
        expect(Object.keys(items['Acacia Plywood'].usedInRecipes).length).to.equal(0)
        expect(Object.keys(items['Acacia Plank'].usedInRecipes).length).to.equal(0)
        expect(Object.keys(items['Acacia Timber'].usedInRecipes).length).to.equal(0)
      }
    })
  })

  describe('recalculate function test', () => {
    let items: any

    beforeEach(() => {
      items = itemManager.parseRecipes(recipesSample)
      items = itemManager.resetToOptimal();
      itemManager.shoppingCart.calculateCosts = sinon.spy()
    })

    it('should always call calculate costs only once', () => {
      itemManager.recalculate() 
      expect(itemManager.shoppingCart.calculateCosts.calledOnce).to.equal(true)
    })
  })

  describe('resetToOptimal function test', () => {
    let items: any

    beforeEach(() => {
      items = itemManager.parseRecipes(recipesSample)
    })

    it('should work and choose the most optimal path', () => {
      expect(items['Acacia Plywood'].activeRecipeId).to.equal('')
      expect(items['Acacia Plank'].activeRecipeId).to.equal('')
      expect(items['Acacia Timber'].activeRecipeId).to.equal('')
      items = itemManager.resetToOptimal();
      expect(items['Acacia Plywood'].activeRecipeId).to.equal('5f35c46485ccdb8cadac761b')
      expect(items['Acacia Plank'].activeRecipeId).to.equal('5f36115282d3cdbd58fa5c95')
      expect(items['Acacia Timber'].activeRecipeId).to.equal('')
    })
  })

  describe('cascadeActiveRecipeWithOptimalActions function test', () => {
    let items: any

    beforeEach(() => {
      items = itemManager.parseRecipes(recipesSample)
    })

    it('should work and choose the most optimal path', () => {
      expect(items['Acacia Plywood'].activeRecipeId).to.equal('')
      expect(items['Acacia Plank'].activeRecipeId).to.equal('')
      expect(items['Acacia Timber'].activeRecipeId).to.equal('')
      // items = itemManager.cascadeActiveRecipeWithOptimalActions();
      // AAAA I need optimal actions calcuatled from PPSOptimizer or some other optimizer.
    })

  })
})

