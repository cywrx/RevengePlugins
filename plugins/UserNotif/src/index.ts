import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

const FluxDispatcher = findByProps("dispatch", "subscribe");
const PresenceStore = findByProps("getStatus");
const UserStore = findByProps("getUser");
const ChannelStore = findByProps("getChannel");
const PresenceRouter = findByProps("subscribeUserIds", "requestIsoceles");

const getTargetIds = () => storage.userIds ?? [];
const lastStatuses: Record<string, string | undefined> = {};
let unpatch: () => void;
let interval: any;

export default {
  onLoad() {
    const ids = getTargetIds();
    // Use BOTH methods to force Discord to watch the users
    if (ids.length) {
        PresenceRouter?.subscribeUserIds(ids);
        PresenceRouter?.requestIsoceles?.(ids);
    }

    interval = setInterval(() => {
      const ids = getTargetIds();
      if (ids.length) {
          PresenceRouter?.subscribeUserIds(ids);
          PresenceRouter?.requestIsoceles?.(ids);
      }
    }, 10000); // Faster refresh (10s)

    unpatch = after("dispatch", FluxDispatcher, ([payload]) => {
      const targetIds = getTargetIds();

      // Catch PRESENCE_UPDATE and the bulk PRESENCES_REPLACE event
      if (payload.type === "PRESENCE_UPDATE" || payload.type === "PRESENCES_REPLACE") {
        const updates = payload.type === "PRESENCES_REPLACE" ? payload.presences : [payload];
        
        updates.forEach((update: any) => {
          const userId = update.user?.id || update.userId;
          if (!targetIds.includes(userId)) return;

          const newStatus = update.status || PresenceStore.getStatus(userId);
          if (lastStatuses[userId] !== newStatus) {
            lastStatuses[userId] = newStatus;
            const name = UserStore.getUser(userId)?.globalName || UserStore.getUser(userId)?.username || userId;
            showToast(`${name} is now ${newStatus}`);
          }
        });
      }

      if (payload.type === "MESSAGE_CREATE") {
        const authorId = payload.message?.author?.id;
        if (targetIds.includes(authorId)) {
          const channelName = ChannelStore.getChannel(payload.message.channel_id)?.name || "DMs";
          const name = UserStore.getUser(authorId)?.username || authorId;
          showToast(`${name} messaged in #${channelName}`);
        }
      }
    });
  },
  onUnload() {
    unpatch?.();
    clearInterval(interval);
  },
  settings: Settings,
};
            
