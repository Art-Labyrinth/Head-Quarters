export type SalesStatsData = {
  date_from: string
  date_to: string
  total_orders: number
  total_amount: number
  avg_order_amount: number
  paid_orders: number
  paid_amount: number
  conversion_to_paid: number
  by_status: Array<{
    status: string
    orders: number
    amount: number
  }>
}
