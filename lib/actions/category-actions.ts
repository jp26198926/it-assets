"use server";

import * as categoryService from "@/lib/services/category-service";
import type { CreateCategoryInput, UpdateCategoryInput, CategoryFilters, Category } from "@/lib/types/category";

export async function getCategories(filters?: CategoryFilters): Promise<Category[]> {
  return categoryService.getCategories(filters);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return categoryService.getCategoryById(id);
}

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  return categoryService.createCategory(data);
}

export async function updateCategory(id: string, data: UpdateCategoryInput): Promise<Category> {
  return categoryService.updateCategory(id, data);
}

export async function deleteCategory(id: string, reason?: string): Promise<void> {
  return categoryService.deleteCategory(id, reason);
}

export async function restoreCategory(id: string): Promise<void> {
  return categoryService.restoreCategory(id);
}
