import { CartEntry } from './CartEntry';
import { Item } from './ShoppingCartCore';
import { ActionTaken } from '../optimizers/Action';

export class ProfitCalculator {

  static valuePackEnabled = false;
  static TAX_PERCENTAGE = 0.65;

  /**
   * 
   * @param item 
   * @param shoppingCartData 
   */
  static calculateProfitValuesForItem(item: Item, shoppingCartData: CartEntry | null = null): {profit: number, profitPerSecond: number} {
    if (shoppingCartData == null) {
      for (const val of Object.values(item.shoppingCartData)) {
        if (item.activeRecipeId != '' && val.action == ActionTaken.Craft) {
          shoppingCartData = val
          break
        } else if (item.activeRecipeId == '' && val.action == ActionTaken.Buy) {
          shoppingCartData = val
          break
        }
      }
    } 

    let {
      individualPrice,
      cumulativeTimeSpent,
    } = shoppingCartData!;

    const marketPrice = item.getMarketPrice()
    return {profit: this.calculateProfit(marketPrice, individualPrice), profitPerSecond: this.calculateProfitPerSecond(marketPrice, individualPrice, cumulativeTimeSpent)}
  }
  
  /**
   * 
   * @param marketPrice 
   * @param individualPrice 
   */
  static calculateProfit(marketPrice: number, individualPrice: number): number {
    let sellingPrice = marketPrice * this.TAX_PERCENTAGE;
    if (this.valuePackEnabled) sellingPrice = 1.3 * sellingPrice;
    // console.log('Total Profit | Selling Price:', sellingPrice, 'Individual Price:', individualPrice)
    const profit = sellingPrice - individualPrice;
    return profit
  }

  /**
   * 
   * @param marketPrice 
   * @param individualPrice 
   * @param cumulativeTimeSpent 
   */
  static calculateProfitPerSecond(marketPrice: number, individualPrice: number, cumulativeTimeSpent: number): number {
    const profit = this.calculateProfit(marketPrice, individualPrice)
    const profitPerSecond = Math.floor(profit / cumulativeTimeSpent);
    return profitPerSecond
  }
}

