import { type } from "arktype";

export const CallRequestPayloadValidator = type({
  callId: "string",
  method: "string",
  args: "object",
});
export type CallRequestPayload = typeof CallRequestPayloadValidator.infer;

const CallResponsePayloadValidator = type({
  kind: "'success'",
  result: "unknown",
}).or({
  kind: "'error'",
  error: "string",
}).and({
  callId: "string",
});
type CallResponsePayload = typeof CallResponsePayloadValidator.infer;

function generateCallId(): string {
  return crypto.randomUUID();
}

const pendingCalls = new Map<string, (payload: CallResponsePayload) => void>();

addEventListener("message", (event) => {
  const payload = CallResponsePayloadValidator(event.data);
  if (payload instanceof type.errors) {
    console.error("Invalid message received:", payload);
    return;
  }
  pendingCalls.get(payload.callId)?.(payload);
});

export async function call(method: string, args: object): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const callId = generateCallId();
    postMessage({
      callId, method, args
    } as CallRequestPayload);
    pendingCalls.set(callId, (payload) => {
      pendingCalls.delete(callId);
      if (payload.kind === "success") {
        resolve(payload.result);
      } else {
        reject(new Error(String(payload.error)));
      }
    });
  })
}
