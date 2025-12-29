import { React, ReactNative as RN } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { showToast } from "@vendetta/ui/toasts";

export default function Settings() {
  const [val, setVal] = React.useState(storage.userIds?.join(",") ?? "");

  function applyValue() {
    if (!val) return showToast("enter at least one user id")
    const ids = val.split(",").map(i => i.trim()).filter(i => i)
    storage.userIds = ids
    showToast(`tracking ${ids.length} user${ids.length > 1 ? "s" : ""}`)
  }

  return (
    <RN.ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#2f3136" }}>
      <RN.View style={{ marginBottom: 12 }}>
        <RN.TextInput
          placeholder="Enter user IDs separated by commas"
          placeholderTextColor="#ccc"
          value={val}
          onChangeText={setVal}
          style={{
            borderWidth: 1,
            borderColor: "#7289da",
            padding: 10,
            borderRadius: 8,
            color: "#fff",
            fontSize: 16,
            backgroundColor: "#202225",
          }}
        />
      </RN.View>

      <RN.TouchableOpacity
        onPress={applyValue}
        style={{
          backgroundColor: "#7289da",
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <RN.Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          Apply
        </RN.Text>
      </RN.TouchableOpacity>

      <RN.View>
        <RN.Text style={{ color: "#fff", fontSize: 16, marginBottom: 6 }}>
          💡 instructions
        </RN.Text>
        <RN.Text style={{ color: "#fff", marginBottom: 4 }}>
          - separate multiple user IDs with commas
        </RN.Text>
        <RN.Text style={{ color: "#fff", marginBottom: 4 }}>
          - plugin will notify you when any listed user messages
        </RN.Text>
      </RN.View>
    </RN.ScrollView>
  )
}
