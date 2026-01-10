import { findByProps, findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { React, ReactNative as RN, NavigationNative } from "@vendetta/metro/common";

const UserStore = findByProps("getCurrentUser");
const UserProfileRenderer = findByName("UserProfileEditor", false) || findByName("UserProfileSettings", false);
const Button = findByProps("Button").Button;

let unpatch: () => void;

export default {
  onLoad() {
    unpatch = after("default", UserProfileRenderer, (_, res) => {
      const currentUser = UserStore.getCurrentUser();
      const navigation = NavigationNative.useNavigation();

      if (!res?.props?.children) return;

      const previewButton = React.createElement(Button, {
        text: "Preview Profile",
        size: "small",
        color: "brand",
        onPress: () => {
          navigation.push("UserProfile", {
            userId: currentUser.id,
          });
        },
        style: { marginVertical: 10 }
      });

      const list = res.props.children.props?.children || res.props.children;
      if (Array.isArray(list)) {
        list.unshift(previewButton);
      }
    });
  },
  onUnload() {
    unpatch?.();
  }
};
