import type { Uuid } from "fundiary-api";
import { atom, getDefaultStore, useAtomValue, useSetAtom } from "jotai";
import {getUser as getUserFromDB, type User } from "@/db/user-db";
import { ArkErrors } from "arktype";

const userAtom = atom<User | null>(null);

export function getUser() {
  return getDefaultStore().get(userAtom);
}

export async function switchUser(id: Uuid) {
  const user = await getUserFromDB(id);
  if (user instanceof ArkErrors) {
    console.error(user);
    return;
  }
  if (user == null) {
    console.warn(`User with id ${id} not found`);
    return;
  }
  getDefaultStore().set(userAtom, user);
}

export function useUserSwitch() {
  const setUser = useSetAtom(userAtom);
  return (id: Uuid) => {
  getUserFromDB(id).then(
    (user) => {
      if (user instanceof ArkErrors) {
        console.error(user);
        return;
      }
      if (user == null) {
        console.warn(`User with id ${id} not found`);
        return;
      }
      setUser(user);
    });
  }
}

export function useUser() {
	return useAtomValue(userAtom);
}
