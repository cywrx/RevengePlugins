import { React, ReactNative as RN } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { showToast } from "@vendetta/ui/toasts";

export default function Settings() {
  const [val, setVal] = React.useState(storage.userIds?.join(",") ?? "");

  function applyValue() {
    if (!val.trim()) return showToast("Enter at least one user ID");
    const ids = val.split(",").map(i => i.trim()).filter(i => i);
    storage.userIds = ids;
    showToast(`Tracking ${ids.length} user${ids.length !== 1 ? "s" : ""}`);
  }

  function clearAll() {
    setVal("");
    storage.userIds = [];
    showToast("Cleared all tracked users");
  }

  return (
    <RN.ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#2f3136" }}>
      <RN.View style={{ marginBottom: 12 }}>
        <RN.TextInput
          placeholder="User IDs (858031702927736874, ...)"
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
          marginBottom: 8,
        }}
      >
        <RN.Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          Apply
        </RN.Text>
      </RN.TouchableOpacity>

      <RN.TouchableOpacity
        onPress={clearAll}
        style={{
          paddingVertical: 8,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <RN.Text style={{ color: "#ff4747", fontSize: 14 }}>
          Clear All
        </RN.Text>
      </RN.TouchableOpacity>

      <RN.View style={{ backgroundColor: "#202225", padding: 12, borderRadius: 8 }}>
        <RN.Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          💡 Instructions
        </RN.Text>
        <RN.Text style={{ color: "#bbb", marginBottom: 6 }}>
          - To add multiple users, separate IDs with a comma.
        </RN.Text>
        <RN.Text style={{ color: "#7289da", fontStyle: "italic", marginBottom: 12 }}>
          Example: 12345678, 98765432
        </RN.Text>
        <RN.Text style={{ color: "#bbb" }}>
          - You will be notified once per minute when a listed user sends a message.
        </RN.Text>
      </RN.View>
    </RN.ScrollView>
  );
}

