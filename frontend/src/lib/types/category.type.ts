export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: {
    products: number;
  };
};

export type CategoryRequest = {
  name: string;
};
