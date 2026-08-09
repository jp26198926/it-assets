"use server";

import * as conversionService from "@/lib/services/conversion-service";
import type { CreateConversionInput, ConversionFilters, Conversion } from "@/lib/types/conversion";

export async function getConversions(filters?: ConversionFilters): Promise<Conversion[]> {
  return conversionService.getConversions(filters);
}

export async function getConversionById(id: string): Promise<Conversion | null> {
  return conversionService.getConversionById(id);
}

export async function createConversion(data: CreateConversionInput): Promise<Conversion> {
  return conversionService.createConversion(data);
}
