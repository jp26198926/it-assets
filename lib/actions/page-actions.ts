"use server";

import * as pageService from "@/lib/services/page-service";
import type { CreatePageInput, UpdatePageInput, PageFilters, Page } from "@/lib/types/page";

export async function getSidebarPages(): Promise<Page[]> {
  return pageService.getSidebarPages();
}

export async function getPages(filters?: PageFilters): Promise<Page[]> {
  return pageService.getPages(filters);
}

export async function getPageById(id: string): Promise<Page | null> {
  return pageService.getPageById(id);
}

export async function createPage(data: CreatePageInput): Promise<Page> {
  return pageService.createPage(data);
}

export async function updatePage(id: string, data: UpdatePageInput): Promise<Page> {
  return pageService.updatePage(id, data);
}

export async function deletePage(id: string, reason?: string): Promise<void> {
  return pageService.deletePage(id, reason);
}

export async function restorePage(id: string): Promise<void> {
  return pageService.restorePage(id);
}
