import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

const FluxDispatcher = findByProps("dispatch", "subscribe");
const PresenceStore = findByProps("getStatus");
const UserStore = findByProps("getUser");
const ChannelStore = findByProps("getChannel");
const PresenceRouter = findByProps("subscribeUserIds");

const getTargetIds = () => storage.userIds ?? [];
const lastStatuses: Record<string, string | undefined> = {};

let unpatch: () => void;
let interval: any;

export default {
  onLoad() {
    const ids = getTargetIds();
    if (ids.length) PresenceRouter?.subscribeUserIds(ids);

    for (const id of ids) {
        lastStatuses[id] = PresenceStore.getStatus(id);
    }

    interval = setInterval(() => {
      const ids = getTargetIds();
      if (ids.length) PresenceRouter?.subscribeUserIds(ids);
    }, 15000);

    unpatch = before("dispatch", FluxDispatcher, ([payload]) => {
      const targetIds = getTargetIds();

      if (payload.type === "PRESENCE_UPDATE") {
        const userId = payload.user?.id;
        if (!targetIds.includes(userId)) return;

        // Use the raw status directly from the packet
        const newStatus = payload.status; 
        if (lastStatuses[userId] !== newStatus) {
          lastStatuses[userId] = newStatus;
          const name = UserStore.getUser(userId)?.username || userId;
          showToast(`${name} is now ${newStatus}`);
        }
      }

      if (payload.type === "MESSAGE_CREATE") {
        const authorId = payload.message?.author?.id;
        if (!targetIds.includes(authorId)) return;

        const channelName = ChannelStore.getChannel(payload.message.channel_id)?.name || "DMs";
        const name = UserStore.getUser(authorId)?.username || authorId;
        showToast(`${name} sent a message in #${channelName}`);
      }
    });
  },

  onUnload() {
    unpatch?.();
    clearInterval(interval);
  },

  settings: Settings,
};

