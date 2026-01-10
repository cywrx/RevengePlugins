import { findByProps, findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { NavigationNative } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";

const UserStore = findByProps("getCurrentUser");
const UserProfileRenderer = findByName("UserProfile", false);

let unpatch: () => void;

export default {
  onLoad() {
    unpatch = after("default", UserProfileRenderer, (args, res) => {
      
      const currentUser = UserStore.getCurrentUser();

      if (!res?.props?.children) return;
      
    });
  },

  onUnload() {
    if (unpatch) unpatch();
  },
};
