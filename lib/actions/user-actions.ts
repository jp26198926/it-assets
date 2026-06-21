"use server";

import * as userService from "@/lib/services/user-service";
import type { CreateUserInput, UpdateUserInput, UserFilters, User, UserSelectItem } from "@/lib/types/user";

export async function getUserSelectOptions(): Promise<{ roles: UserSelectItem[]; departments: UserSelectItem[] }> {
  return userService.getUserSelectOptions();
}

export async function getUsers(filters?: UserFilters): Promise<User[]> {
  return userService.getUsers(filters);
}

export async function getUserById(id: string): Promise<User | null> {
  return userService.getUserById(id);
}

export async function createUser(data: CreateUserInput): Promise<User> {
  return userService.createUser(data);
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User> {
  return userService.updateUser(id, data);
}

export async function changePassword(id: string, password: string): Promise<void> {
  return userService.changePassword(id, password);
}

export async function deleteUser(id: string, reason?: string): Promise<void> {
  return userService.deleteUser(id, reason);
}

export async function restoreUser(id: string): Promise<void> {
  return userService.restoreUser(id);
}
