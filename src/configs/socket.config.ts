import { io, type Socket } from "socket.io-client";
import { backendOrigin } from "./axios.config";
import { fetchSessionToken, isEmbedded } from "./appbridge.config";

let socket: Socket | null = null;

/**
 * Lazily creates (and memoizes) the notification socket. Not auto-connected —
 * callers should call `.connect()` once they're ready to receive events (see
 * NotificationProvider).
 *
 * Auth mirrors the axios request interceptor: embedded merchants send a fresh
 * App Bridge session token (re-fetched on every connect/reconnect attempt,
 * since it's short-lived); standalone sessions fall back to the better-auth
 * cookie via withCredentials. The backend's connAuthBridge accepts either.
 */
export const getNotificationSocket = (): Socket => {
  if (socket) return socket;

  socket = io(backendOrigin, {
    withCredentials: true,
    autoConnect: false,
    auth: (cb) => {
      (async () => {
        const token = isEmbedded ? await fetchSessionToken() : null;
        cb({ token });
      })();
    },
  });

  return socket;
};
