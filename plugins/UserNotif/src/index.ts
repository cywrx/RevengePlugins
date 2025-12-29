import { findByProps } from "@vendetta/metro";
import { before, after } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

const FluxDispatcher = findByProps("dispatch", "subscribe");
const PresenceStore = findByProps("getStatus");
const ChannelStore = findByProps("getChannel");
const PresenceRouter = findByProps("subscribeUserIds");

const getTargetIds = () => storage.userIds ?? [];
const lastStatuses: Record<string, string | undefined> = {};

let unpatch: () => void;
let interval: NodeJS.Timeout | null = null;

export default {
  onLoad() {
    const ids = getTargetIds();
    if (ids.length) PresenceRouter?.subscribeUserIds(ids);

    // initial cache
    for (const id of ids) {
      lastStatuses[id] = PresenceStore.getStatus(id);
    }

    // force subscription every 15s
    interval = setInterval(() => {
      const ids = getTargetIds();
      if (ids.length) PresenceRouter?.subscribeUserIds(ids);
    }, 15000);

    unpatch = before("dispatch", FluxDispatcher, ([payload]) => {
      const targetIds = getTargetIds();

      if (payload.type === "PRESENCE_UPDATE" || payload.type === "USER_UPDATE") {
        const userId = payload.user?.id;
        if (!targetIds.includes(userId)) return;

        const newStatus = PresenceStore.getStatus(userId);
        if (lastStatuses[userId] !== newStatus) {
          lastStatuses[userId] = newStatus;
          showToast(`User ${userId} is now ${newStatus}`);
        }
      }

      if (payload.type === "MESSAGE_CREATE") {
        const authorId = payload.message?.author?.id;
        if (!targetIds.includes(authorId)) return;

        const channel = ChannelStore.getChannel(payload.message.channel_id);
        const channelName = channel?.name || "DMs";
        showToast(`User ${authorId} sent a message in #${channelName}`);
      }
    });
  },

  onUnload() {
    unpatch?.();
    if (interval) clearInterval(interval);
  },

  settings: Settings,
};
