"use server";

import * as assetService from "@/lib/services/asset-service";
import type { CreateAssetInput, UpdateAssetInput, AssetFilters, Asset } from "@/lib/types/asset";

export async function getAssets(filters?: AssetFilters): Promise<Asset[]> {
  return assetService.getAssets(filters);
}

export async function getAssetById(id: string): Promise<Asset | null> {
  return assetService.getAssetById(id);
}

export async function createAsset(data: CreateAssetInput): Promise<Asset> {
  return assetService.createAsset(data);
}

export async function updateAsset(id: string, data: UpdateAssetInput): Promise<Asset> {
  return assetService.updateAsset(id, data);
}

export async function deleteAsset(id: string, reason?: string): Promise<void> {
  return assetService.deleteAsset(id, reason);
}

export async function restoreAsset(id: string): Promise<void> {
  return assetService.restoreAsset(id);
}

export async function getAssetSelectOptions(): Promise<{
  items: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  employees: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}> {
  return assetService.getAssetSelectOptions();
}

export async function generateBarcode(): Promise<string> {
  return assetService.generateBarcode();
}
