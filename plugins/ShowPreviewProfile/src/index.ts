import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

const PremiumUtils = findByProps("canUsePremiumProfileCustomization");

let patches: (() => void)[] = [];

export default {
  onLoad() {
    if (!PremiumUtils) return;

    const propertiesToPatch = [
      "canUsePremiumProfileCustomization",
    ];

    propertiesToPatch.forEach((prop) => {

      if (PremiumUtils[prop]) {
        
        patches.push(after(prop, PremiumUtils, () => true));
      }
    });
  },

  onUnload() {
    
    patches.forEach((unpatch) => unpatch());
    patches = [];
  },
};

