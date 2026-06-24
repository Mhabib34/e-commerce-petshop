export interface CreateCategoryBody {
  name: string;
  slug: string;
}

export interface UpdateCategoryBody {
  name?: string;
  slug?: string;
}