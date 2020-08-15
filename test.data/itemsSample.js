const itemsSample = {
  "Acacia Plywood": {
    name: "Acacia Plywood",
    marketData: {
      _id: "5f15dac7cea9de4bcc529762",
      ID: 4681,
      "Last Update Attempt": "2020-08-14T20:54:26.275Z",
      "Last Updated": "2020-08-14T20:54:26.275Z",
      "Market Price": 17100,
      Name: "Acacia Plywood",
      Quantity: 10097,
      "Total Trade Count": 54614204,
    },
    shoppingCartData: {
      "/Acacia Plywood": {
        action: "Craft",
        craftCount: 100,
        expectedCount: 100,
        individualPrice: 36600,
        cumulativeTimeSpent: 744,
        for: null,
      },
    },
    recipes: {
      "5f35c46485ccdb8cadac761b": {
        productName: "Acacia Plywood",
        ingredients: [
          {
            "Item Name": "Acacia Plank",
            Amount: 10,
            "Total Needed": 1000,
            tableData: {
              id: 0,
            },
          },
        ],
        quantityProduced: 1,
        timeToProduce: 720,
        action: "Wood Workbench",
      },
      "5f35c46485ccdb8cadac761c": {
        productName: "Acacia Plywood",
        ingredients: [
          {
            "Item Name": "Acacia Plank",
            Amount: 30,
          },
        ],
        quantityProduced: 3,
        timeToProduce: 1800,
        action: "Wood Workbench",
      },
      "5f35c46485ccdb8cadac761d": {
        productName: "Acacia Plywood",
        ingredients: [
          {
            "Item Name": "Acacia Plank",
            Amount: 50,
          },
        ],
        quantityProduced: 5,
        timeToProduce: 3000,
        action: "Wood Workbench",
      },
      "5f36115282d3cdbd58fa5c96": {
        productName: "Acacia Plywood",
        ingredients: [
          {
            "Item Name": "Acacia Plank",
            Amount: 10,
          },
        ],
        quantityProduced: 2.5,
        timeToProduce: 6,
        action: "Chopping",
      },
    },
    usedInRecipes: {
      "/Acacia Plywood": {
        actionTaken: "Craft",
        parentName: null,
        parentRecipeId: null,
      },
    },
    activeRecipeId: "5f35c46485ccdb8cadac761b",
    depth: -1,
    overrideMarketPrice: null,
    isSymbolic: false,
  },
  "Acacia Timber": {
    name: "Acacia Timber",
    marketData: {
      _id: "5f15dac7cea9de4bcc529763",
      ID: 4609,
      "Last Update Attempt": "2020-08-14T20:54:26.277Z",
      "Last Updated": "2020-08-14T20:54:26.277Z",
      "Market Price": 1830,
      Name: "Acacia Timber",
      Quantity: 16312,
      "Total Trade Count": 272955770,
    },
    shoppingCartData: {
      "/Acacia Plywood/Acacia Plank/Acacia Timber": {
        action: "Buy",
        craftCount: 2000,
        expectedCount: 2000,
        individualPrice: 1830,
        cumulativeTimeSpent: 0,
        for: "Acacia Plank",
      },
    },
    recipes: {
      "5f3631bd17d0de0f34da8848": {
        productName: "Acacia Timber",
        quantityProduced: null,
        timeToProduce: null,
        action: "Gather/Purchase",
      },
    },
    usedInRecipes: {
      "/Acacia Plywood/Acacia Plank/Acacia Timber": {
        actionTaken: "Buy",
        parentName: "Acacia Plank",
        parentRecipeId: "5f36115282d3cdbd58fa5c95",
      },
    },
    activeRecipeId: null,
    depth: 1,
    overrideMarketPrice: null,
    isSymbolic: false,
  },
  "Acacia Plank": {
    name: "Acacia Plank",
    marketData: {
      _id: "5f15dac7cea9de4bcc529761",
      ID: 4680,
      "Last Update Attempt": "2020-08-14T20:54:26.276Z",
      "Last Updated": "2020-08-14T20:54:26.276Z",
      "Market Price": 3860,
      Name: "Acacia Plank",
      Quantity: 0,
      "Total Trade Count": 40694217,
    },
    shoppingCartData: {
      "/Acacia Plywood/Acacia Plank": {
        action: "Craft",
        craftCount: 400,
        expectedCount: 1000,
        individualPrice: 3660,
        cumulativeTimeSpent: 2.4,
        for: "Acacia Plywood",
      },
    },
    recipes: {
      "5f36115282d3cdbd58fa5c95": {
        productName: "Acacia Plank",
        ingredients: [
          {
            "Item Name": "Acacia Timber",
            Amount: 5,
            "Total Needed": 2000,
            tableData: {
              id: 0,
            },
          },
        ],
        quantityProduced: 2.5,
        timeToProduce: 6,
        action: "Chopping",
      },
    },
    usedInRecipes: {
      "/Acacia Plywood/Acacia Plank": {
        actionTaken: "Craft",
        parentName: "Acacia Plywood",
        parentRecipeId: "5f35c46485ccdb8cadac761b",
      },
    },
    activeRecipeId: "5f36115282d3cdbd58fa5c95",
    depth: 0,
    overrideMarketPrice: null,
    isSymbolic: false,
  },
};

module.exports = itemsSample;
