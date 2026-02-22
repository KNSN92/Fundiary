import { ArkErrors, type } from "arktype";
import { v7 as uuidv7 } from "uuid";

export type Uuid = string;

export function uuid(): Uuid {
  return uuidv7() as Uuid;
}

const UuidValidator = type("string.uuid.v7").pipe(v => v as Uuid);

export function fromUuid(value: string): Uuid | null {
  const result = UuidValidator(value);
  if(result instanceof ArkErrors) return null;
  return result;
}

export function fromUuidOrThrow(value: string): Uuid {
  const result = UuidValidator(value);
  if(result instanceof ArkErrors) throw ArkErrors;
  return result;
}
