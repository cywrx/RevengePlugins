import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

const FluxDispatcher = findByProps("dispatch", "subscribe");
const UserStore = findByProps("getUser");
const ChannelStore = findByProps("getChannel");

const getTargetIds = () => storage.userIds ?? [];
const cooldowns: Record<string, number> = {};
let unpatch: () => void;

export default {
  onLoad() {
    unpatch = after("dispatch", FluxDispatcher, ([payload]) => {
      if (payload.type !== "MESSAGE_CREATE") return;

      const targetIds = getTargetIds();
      const authorId = payload.message?.author?.id;

      if (targetIds.includes(authorId)) {
        const now = Date.now();
        
        if (cooldowns[authorId] && (now - cooldowns[authorId] < 60000)) {
          return;
        }

        const channel = ChannelStore.getChannel(payload.message.channel_id);
        const channelName = channel?.name || "DMs";
        const name = UserStore.getUser(authorId)?.globalName || authorId;

        cooldowns[authorId] = now;

        showToast(`${name} has texted a message in ${channelName}`);
      }
    });
  },
  onUnload() {
    unpatch?.();
  },
  settings: Settings,
};
