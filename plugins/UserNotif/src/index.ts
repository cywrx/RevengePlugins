import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

const FluxDispatcher = findByProps("dispatch", "subscribe");
const PresenceStore = findByProps("getStatus");
const PresenceRouter = findByProps("subscribeUserIds");

const getTargetIds = () => storage.userIds ?? [];
const lastStatuses: Record<string, string | undefined> = {};
let unsubscribe: (() => void) | null = null;

export default {
  onLoad() {
    const ids = getTargetIds();
    
    if (ids.length) PresenceRouter?.subscribeUserIds(ids);

    for (const id of ids) {
      lastStatuses[id] = PresenceStore.getStatus(id);
    }

    const presenceHandler = (payload: any) => {
      const userId = payload.user?.id;
      if (!getTargetIds().includes(userId)) return;

      const newStatus = payload.status || PresenceStore.getStatus(userId);
      if (lastStatuses[userId] !== newStatus) {
        lastStatuses[userId] = newStatus;
        showToast(`User ${userId} is now ${newStatus}`);
      }
    };

    const messageHandler = (payload: any) => {
      if (payload?.type !== "MESSAGE_CREATE") return;
      const authorId = payload.message?.author?.id;
      if (getTargetIds().includes(authorId)) {
        showToast(`User ${authorId} sent a message`);
      }
    };

    FluxDispatcher.subscribe("PRESENCE_UPDATE", presenceHandler);
    FluxDispatcher.subscribe("MESSAGE_CREATE", messageHandler);

    unsubscribe = () => {
      FluxDispatcher.unsubscribe("PRESENCE_UPDATE", presenceHandler);
      FluxDispatcher.unsubscribe("MESSAGE_CREATE", messageHandler);
    };
  },
  onUnload() {
    unsubscribe?.();
  },
  settings: Settings,
};

