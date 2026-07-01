export type RevenueChartItem = {
  date: string;
  revenue: number;
};

export type DashboardStats = {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
  };
  revenueChart: RevenueChartItem[];
  recentOrders: Array<{
    id: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    items?: Array<{
      quantity: number;
      variant: {
        name: string;
        product: {
          name: string;
        }
      }
    }>;
  }>;
};
