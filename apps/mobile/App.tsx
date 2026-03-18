import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import type { Choreography, GenerateChoreographyRequest } from "@coreo/shared";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function App() {
  const [items, setItems] = useState<Choreography[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [style, setStyle] = useState("Zumba");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [level, setLevel] = useState<GenerateChoreographyRequest["level"]>("intermediate");
  const [audience, setAudience] = useState<GenerateChoreographyRequest["audience"]>("adults");

  const payload = useMemo<GenerateChoreographyRequest>(
    () => ({
      style,
      durationMinutes: Number(durationMinutes) || 30,
      level,
      audience,
      notes: ""
    }),
    [style, durationMinutes, level, audience]
  );

  async function refresh() {
    const res = await fetch(`${API_BASE}/choreographies`);
    if (!res.ok) throw new Error(`List failed (${res.status})`);
    const data = (await res.json()) as { items: Choreography[] };
    setItems(data.items ?? []);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await refresh();
      } catch (e) {
        if (mounted) Alert.alert("Error", e instanceof Error ? e.message : "Failed to load.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function onGenerate() {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/choreographies/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Generate failed (${res.status})`);
      await refresh();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to generate.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Coreo</Text>
        <Text style={styles.subtitle}>Generate and reuse choreographies</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick generate</Text>

          <Text style={styles.label}>Style</Text>
          <TextInput value={style} onChangeText={setStyle} style={styles.input} />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Duration</Text>
              <TextInput
                value={durationMinutes}
                onChangeText={setDurationMinutes}
                style={styles.input}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Level</Text>
              <TextInput value={level} onChangeText={(t) => setLevel(t as any)} style={styles.input} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Audience</Text>
              <TextInput
                value={audience}
                onChangeText={(t) => setAudience(t as any)}
                style={styles.input}
              />
            </View>
          </View>

          <Button title={isGenerating ? "Generating…" : "Generate"} onPress={onGenerate} disabled={isGenerating} />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.cardTitle}>Your choreographies</Text>
          <View style={{ width: 110 }}>
            <Button
              title={isLoading ? "Loading…" : "Refresh"}
              onPress={async () => {
                setIsLoading(true);
                try {
                  await refresh();
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            />
          </View>
        </View>

        {isLoading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.style} • {item.level} • {item.durationMinutes} min • {item.bpm} BPM
                </Text>
              </View>
            )}
          />
        )}

        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12
  },
  title: {
    fontSize: 32,
    fontWeight: "800"
  },
  subtitle: {
    color: "#555",
    marginTop: 4,
    marginBottom: 12
  },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10
  },
  row: {
    flexDirection: "row",
    gap: 8
  },
  col: { flex: 1 },
  listHeader: {
    marginTop: 4,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  item: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10
  },
  itemTitle: { fontWeight: "700" },
  itemMeta: { color: "#666", marginTop: 4 }
});

