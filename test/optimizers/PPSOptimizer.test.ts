import { PPSOptimizer } from "./../../src/optimizers/PPSOptimizer";
import { ItemManager, Item } from "./../../src/shoppingCart/ShoppingCartCore";
import recipesSample from "../../test.data/recipesSample";
import { expect } from "chai";
import sinon from "sinon";
import { Action } from "../../src/optimizers/Action";

describe("PPSOptimizer class tests", () => {
  let items: { [key: string]: Item };
  let optimizer: any;
  let itemManager: ItemManager;

  before(() => {
    itemManager = new ItemManager();
    items = itemManager.parseRecipes(recipesSample);
  });

  beforeEach(() => {
    optimizer = new PPSOptimizer();
    optimizer.setItems(items, "Acacia Plywood");
  });

  describe("recipes sample contains Acacia Plywood", () => {
    it("should contain the Acacia Plywood recipe", () => {
      expect(items["Acacia Plywood"]).to.not.equal(null);
    });
  });

  describe("findOptimalActionSets function test", () => {
    beforeEach(() => {
      optimizer.startCalculatingOptimalActions = sinon.spy();
    });

    it("should return 4 optimal actions (one for each recipe)", () => {
      const bestActions = optimizer.findOptimalActionSets();
      expect(Object.keys(bestActions).length).to.equal(4);
    });

    it("should return null with no rootItemName provided", () => {
      optimizer.setItems(items, null);
      const bestActions = optimizer.findOptimalActionSets();
      expect(Object.keys(bestActions).length).to.equal(0);
    });

    it("should return null with no items dictionary provided", () => {
      optimizer.setItems(null, "Acacia Plywood");
      const bestActions = optimizer.findOptimalActionSets();
      expect(Object.keys(bestActions).length).to.equal(0);
    });
  });

  describe("startCalculatingOptimalActions function test", () => {
    beforeEach(() => {
      optimizer.calculateOptimalActions = sinon.spy();
    });

    it("should return null with no rootItemName provided", () => {
      optimizer.setItems(items, null);
      const optimalActions = optimizer.startCalculatingOptimalActions(
        null,
        "5f35c46485ccdb8cadac761b"
      );
      expect(Object.keys(optimalActions).length).to.equal(0);
      expect((optimizer.calculateOptimalActions as any).calledOnce).to.equal(
        false
      );
    });

    it("should return null with no items dictionary provided", () => {
      optimizer.setItems(null, "Acacia Plywood");
      const optimalActions = optimizer.startCalculatingOptimalActions(
        "Acacia Plywood",
        "5f35c46485ccdb8cadac761b"
      );
      expect(Object.keys(optimalActions).length).to.equal(0);
      expect((optimizer.calculateOptimalActions as any).calledOnce).to.equal(
        false
      );
    });

    it("should work with no startingRecipeId provided (Buy action)", () => {
      const optimalActions = optimizer.startCalculatingOptimalActions(
        "Acacia Plywood",
        null
      );
      expect(Object.keys(optimalActions).length).to.equal(0);
      expect((optimizer.calculateOptimalActions as any).calledOnce).to.equal(
        true
      );
    });

    it("should work", () => {
      const optimalActions = optimizer.startCalculatingOptimalActions(
        "Acacia Plywood",
        "5f35c46485ccdb8cadac761b"
      );
      expect(Object.keys(optimalActions).length).to.equal(0);
      expect((optimizer.calculateOptimalActions as any).calledOnce).to.equal(
        true
      );
    });
  });

  describe("sequenceGenerator function test", () => {
    it("should generate 32", () => {
      let arr = [];
      for (let i = 0; i < 5; i++) {
        arr.push("Buy");
      }
      const gen = optimizer.sequenceGenerator(arr.length, arr, 0); // Sample sequence: ['Buy', 'Sell', 'Buy']
      let generatorResult = gen.next();

      // 5 long
      expect(generatorResult.value.length).to.equal(5);

      // All actions are 'Buy'
      for (const action of generatorResult.value) {
        expect(action).to.equal("Buy");
      }

      // 32 possible sequences
      let allResults = [];
      while (generatorResult.done === false) {
        allResults.push(generatorResult.value);
        generatorResult = gen.next();
      }
      expect(allResults.length).to.equal(32);
    });
  });

  describe("calculateOptimalActions function test", () => {
    it("should return the already calculated optimal actions dictionary", () => {
      let optimalActions = {
        "Acacia Plywood": {
          Buy: new Action(0, 0, null, null, null),
          Craft: null,
        },
      };
      const optimalActionsResult = optimizer.calculateOptimalActions(
        "Acacia Plywood",
        "5f35c46485ccdb8cadac761b",
        optimalActions
      );
      expect(optimalActionsResult).to.be.equal(optimalActions);
      expect(Object.keys(optimalActionsResult).length).to.equal(1);
    });

    // it('should return the current optimal actions if no item is provided', () => {
    //   let optimalActions = {'Acacia Plywood': 'Action'}
    //   const optimalActionsResult = optimizer.calculateOptimalActions(null, '5f35c46485ccdb8cadac761b', optimalActions)
    //   expect(optimalActionsResult).to.be.equal(optimalActions)
    //   expect(Object.keys(optimalActionsResult).length).to.equal(1)
    // })

    it("should work", () => {
      let optimalActions = {};
      const optimalActionsResult = optimizer.calculateOptimalActions(
        "Acacia Plywood",
        "5f35c46485ccdb8cadac761b",
        optimalActions
      );

      expect(
        optimalActionsResult["Acacia Plywood"]["Buy"]["monetaryCost"]
      ).to.equal(17100);
      expect(optimalActionsResult["Acacia Plywood"]["Buy"]["time"]).to.equal(0);
      expect(optimalActionsResult["Acacia Plywood"]["Buy"]["recipe"]).to.equal(
        null
      );
      expect(
        optimalActionsResult["Acacia Plywood"]["Buy"]["recipe_id"]
      ).to.equal("");
      expect(
        optimalActionsResult["Acacia Plywood"]["Buy"]["actionSequence"]
      ).to.equal(null);
      const craftAction = optimalActionsResult["Acacia Plywood"]["Craft"];
      expect(craftAction).to.not.equal(null);
      expect(craftAction!["monetaryCost"]).to.equal(36600);
      expect(craftAction!["time"]).to.equal(744);
      expect(craftAction!["recipe"]).to.not.equal(null);
      expect(craftAction!["recipe_id"]).to.equal("5f35c46485ccdb8cadac761b");
      expect(craftAction!["actionSequence"]).to.not.equal(null);
      expect(craftAction!["actionSequence"]).to.be.a("array");
    });

    it("should work", () => {
      let optimalActions = {};
      let buffs = {
        Chopping: {
          timeReduction: 100,
        },
        "Wood Workbench": {
          timeReduction: 1,
        },
      };
      itemManager.applyBuffs(buffs);
      const optimalActionsResult = optimizer.calculateOptimalActions(
        "Acacia Plywood",
        "5f35c46485ccdb8cadac761b",
        optimalActions
      );

      expect(
        optimalActionsResult["Acacia Plywood"]["Buy"]["monetaryCost"]
      ).to.equal(17100);
      expect(optimalActionsResult["Acacia Plywood"]["Buy"]["time"]).to.equal(0);
      expect(optimalActionsResult["Acacia Plywood"]["Buy"]["recipe"]).to.equal(
        null
      );
      expect(
        optimalActionsResult["Acacia Plywood"]["Buy"]["recipe_id"]
      ).to.equal("");
      expect(
        optimalActionsResult["Acacia Plywood"]["Buy"]["actionSequence"]
      ).to.equal(null);
      const craftAction = optimalActionsResult["Acacia Plywood"]["Craft"];
      expect(craftAction).to.not.equal(null);
      expect(craftAction!["monetaryCost"]).to.equal(36600);
      expect(craftAction!["time"]).to.equal(719);
      expect(craftAction!["recipe"]).to.not.equal(null);
      expect(craftAction!["recipe_id"]).to.equal("5f35c46485ccdb8cadac761b");
      expect(craftAction!["actionSequence"]).to.not.equal(null);
      expect(craftAction!["actionSequence"]).to.be.a("array");
    });
  });
});
