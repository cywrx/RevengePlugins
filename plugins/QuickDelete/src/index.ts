import { findByProps } from "@vendetta/metro";
import { registerMessageAction } from "@vendetta/ui/message";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
const msgModule = findByProps("deleteMessage", "dismissAutomatedMessage");
const { getCurrentUser } = findByProps("getCurrentUser");

let unpatch;

export default {
    onLoad: () => {
        unpatch = registerMessageAction({
            name: "Quick Delete",
            icon: getAssetIDByName("Trash"),
            predicate: (msg) => msg.author.id === getCurrentUser().id,
            onPress: (action, msg) => {
                msgModule.deleteMessage(msg.channel_id, msg.id)
                    .then(() => {
                        showToast("Deleted", getAssetIDByName("Check"));
                    })
                    .catch((e) => {
                        console.error("QuickDelete failed:", e);
                        showToast("Error deleting message", getAssetIDByName("Small"));
                    });
            }
        });
    },

    onUnload: () => {
        if (unpatch) unpatch();
    }
};
