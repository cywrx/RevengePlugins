import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { React, NavigationNative } from "@vendetta/metro/common";

const UserStore = findByProps("getCurrentUser");
const Button = findByProps("Button");
const ProfileEditor = findByProps("UserProfileEditorHeader") || findByProps("UserProfileEditor");

let unpatch: () => void;

export default {
  onLoad() {
    if (!ProfileEditor) return;

    unpatch = after("default", ProfileEditor, (_, res) => {
      const navigation = NavigationNative.useNavigation();
      const user = UserStore.getCurrentUser();

      const previewButton = React.createElement(Button.default || Button, {
        text: "Preview as Stranger",
        size: "small",
        color: "brand",
        onPress: () => {
          navigation.navigate("UserProfile", {
            userId: user.id,
            fromEditor: true
          });
        },
        style: { margin: 10 }
      });

      try {
        const children = res.props?.children || res.props?.children?.props?.children;
        if (Array.isArray(children)) {
          children.unshift(previewButton);
        }
      } catch (e) {}
    });
  },
  onUnload() {
    unpatch?.();
  }
};
