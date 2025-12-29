import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const Alerts = findByProps("show", "openLazy");
let stopPatch: () => void;

export default {
    onLoad: () => {
        stopPatch = instead("show", Alerts, (args, original) => {
            const [props] = args;
            
            const isDeletePopup = props?.onConfirm && 
                (props?.title?.toLowerCase().includes("delete") || 
                 props?.content?.toLowerCase().includes("delete"));
            if (isDeletePopup) {
                return props.onConfirm();
            }
            return original.apply(Alerts, args);
        });
    },
    onUnload: () => {
        if (stopPatch) stopPatch();
    }
};
