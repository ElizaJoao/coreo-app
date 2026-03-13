import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import type { Choreography } from "@coreo/shared";

export default function App() {
  const sample: Choreography = { id: "1", name: "Warmup Flow", style: "Zumba" };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coreo</Text>
      <Text>Mobile app scaffold is running.</Text>
      <Text style={styles.code}>{JSON.stringify(sample, null, 2)}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12
  },
  code: {
    marginTop: 16,
    fontFamily: "monospace"
  }
});

