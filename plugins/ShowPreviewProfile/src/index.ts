import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

const ProfileCustomizationUtils = findByProps("canUsePremiumProfileCustomization");

let unpatch: (() => void) | null = null;

export default {
  onLoad() {
    
    if (ProfileCustomizationUtils) {
      unpatch = after(
        "canUsePremiumProfileCustomization",
        ProfileCustomizationUtils,
        () => true
      );
    }
  },

  onUnload() {
    unpatch?.();
  },
};
