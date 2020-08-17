import { ActionTaken } from '../optimizers/Action'
export default interface CartEntry {
  // name: string,
  action: ActionTaken,
  // recipe: Array<object>, 
  craftCount: number,
  expectedCount: number, // Store the total amount that is expected to be crafted
  individualPrice: number,
  cumulativeTimeSpent: number,
  for: string 
  // marketData: marketData
}