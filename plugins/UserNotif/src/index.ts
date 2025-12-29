import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";

const FluxDispatcher = findByProps("dispatch", "subscribe");
const PresenceStore = findByProps("getStatus");

const TARGET_USER_IDS = storage.userIds ?? []

const lastStatuses: Record<string, string | undefined> = {};

let unpatchPresence: (() => void) | null = null;
let unsubscribeMessage: (() => void) | null = null;

function notify(text: string) {
  showToast(text);
}

export default {
  onLoad() {

    for (const id of TARGET_USER_IDS) {
      lastStatuses[id] = PresenceStore.getStatus(id);
    }

    unpatchPresence = after(
      "dispatch",
      FluxDispatcher,
      ([payload]) => {
        if (payload?.type !== "PRESENCE_UPDATE") return;

        const userId = payload.user?.id;
        if (!TARGET_USER_IDS.includes(userId)) return;

        const newStatus = payload.status;
        if (lastStatuses[userId] !== newStatus) {
          lastStatuses[userId] = newStatus;
          notify(`user ${userId} is now ${newStatus}`);
        }
      }
    );


    const messageHandler = (payload: any) => {
      if (payload?.type !== "MESSAGE_CREATE") return;

      const authorId = payload.message?.author?.id;
      if (!TARGET_USER_IDS.includes(authorId)) return;

      notify(`user ${authorId} sent a message`);
    };

    FluxDispatcher.subscribe("MESSAGE_CREATE", messageHandler);
    unsubscribeMessage = () =>
      FluxDispatcher.unsubscribe("MESSAGE_CREATE", messageHandler);
  },

  onUnload() {
    unpatchPresence?.();
    unsubscribeMessage?.();
  },
};
