export interface DailyConsumption {
  MONDAY: number
  TUESDAY: number
  WEDNESDAY: number
  THURSDAY: number
  FRIDAY: number
  SATURDAY: number
  SUNDAY: number
}

export interface Parameters {
  initialStock: number
  deliveryDelay: number
  packSize: number
  dailyConsumption: DailyConsumption
}

export interface PurchaseRecommendation {
  orderDate: string
  deliveryDate: string
  packsToBuy: number
  stockBeforePurchase: number
  stockAfterDelivery: number
}

export interface SimulationResult {
  dailyStockLevels: DailyStockLevel[] // ou adaptez en fonction de la structure réelle
  purchaseRecommendations: PurchaseRecommendation[]
  summary: Summary
}

export interface Summary {
  averagePacksToBuy: number
  averageStockLevel: number
  maximumStockLevel: number
  totalPurchases: number
  totalYogurtsConsumed: number
  totalYogurtsPurchased: number
}

export interface DailyStockLevel {
  date: string
  stockLevel: number
  isDeliveryDay: boolean
  isPurchaseDay: boolean
  consumption: number
}
