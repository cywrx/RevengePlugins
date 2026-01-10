import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { React, NavigationNative } from "@vendetta/metro/common";

const UserStore = findByProps("getCurrentUser");
const Button = findByProps("Button");
const Editor = findByProps("UserProfileEditor") || findByProps("UserProfileSettingsEditor");

let unpatch: () => void;

export default {
  onLoad() {
    if (!Editor) return;

    unpatch = after("default", Editor, (_, res) => {
      const navigation = NavigationNative.useNavigation();
      const user = UserStore.getCurrentUser();

      const previewButton = React.createElement(Button.default || Button, {
        text: "Preview as Stranger",
        size: "small",
        color: "brand",
        onPress: () => {
          navigation.navigate("UserProfile", {
            userId: user.id,
          });
        },
        style: { 
          marginHorizontal: 16, 
          marginVertical: 8,
          borderRadius: 8
        }
      });


      try {
        const blocks = res?.props?.children?.props?.blocks || res?.props?.blocks;
        if (Array.isArray(blocks)) {

          blocks.unshift({
            type: "CUSTOM_BUTTON",
            render: () => previewButton
          });
        } else {
          
          const children = res?.props?.children?.props?.children || res?.props?.children;
          if (Array.isArray(children)) {
            children.unshift(previewButton);
          }
        }
      } catch (e) {}

      return res;
    });
  },
  onUnload() {
    unpatch?.();
  }
};
