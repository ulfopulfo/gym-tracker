import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function GymTracker() {
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sets, setSets] = useState([]);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [exercises]);

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("exercises", JSON.stringify(exercises));
    } catch (e) {
      console.log("Error saving data", e);
    }
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem("exercises");
      if (saved) setExercises(JSON.parse(saved));
    } catch (e) {
      console.log("Error loading data", e);
    }
  };

  const addExercise = () => {
    if (!newExercise.trim()) return;
    setExercises([...exercises, { name: newExercise, history: [] }]);
    setNewExercise("");
  };

  const selectExercise = (exercise) => {
    setSelectedExercise(exercise);
    setSets([]);
    setWeight("");
    setReps("");
  };

  const addSet = () => {
    if (!weight || !reps) return;
    const newSet = { weight, reps };
    setSets([...sets, newSet]);
    setWeight("");
    setReps("");
  };

  const saveWorkout = () => {
    if (!selectedExercise) return;
    const updated = exercises.map((ex) =>
      ex.name === selectedExercise.name
        ? { ...ex, history: [...ex.history, sets] }
        : ex
    );
    setExercises(updated);
    setSelectedExercise(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minimal Gym Tracker</Text>

      {!selectedExercise && (
        <View>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="New Exercise"
              value={newExercise}
              onChangeText={setNewExercise}
            />
            <TouchableOpacity style={styles.addButton} onPress={addExercise}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={exercises}
            keyExtractor={(item, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => selectExercise(item)}
              >
                <Text style={styles.exerciseName}>{item.name}</Text>
                {item.history.length > 0 && (
                  <Text style={styles.lastSet}>
                    Last: {item.history[item.history.length - 1]
                      .map((s) => `${s.reps}x${s.weight}`)
                      .join(", ")}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {selectedExercise && (
        <View>
          <Text style={styles.subtitle}>{selectedExercise.name}</Text>
          {selectedExercise.history.length > 0 && (
            <Text style={styles.lastSet}>
              Last: {selectedExercise.history[selectedExercise.history.length - 1]
                .map((s) => `${s.reps}x${s.weight}`)
                .join(", ")}
            </Text>
          )}

          <View style={styles.row}>
            <TextInput
              style={styles.smallInput}
              placeholder="Reps"
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.smallInput}
              placeholder="Weight"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.greenButton} onPress={addSet}>
              <Text style={styles.buttonText}>Add Set</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginVertical: 10 }}>
            {sets.map((s, i) => (
              <Text key={i} style={styles.setItem}>
                {s.reps} reps @ {s.weight}
              </Text>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
              <Text style={styles.buttonText}>Save Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSelectedExercise(null)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 20, fontWeight: "600", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 },
  smallInput: { width: 80, borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginRight: 5 },
  addButton: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, marginLeft: 5 },
  greenButton: { backgroundColor: "#22c55e", padding: 12, borderRadius: 8 },
  saveButton: { flex: 1, backgroundColor: "#2563eb", padding: 15, borderRadius: 8, marginRight: 5 },
  cancelButton: { flex: 1, backgroundColor: "#9ca3af", padding: 15, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600", textAlign: "center" },
  exerciseItem: { padding: 15, backgroundColor: "#f3f4f6", borderRadius: 10, marginBottom: 8 },
  exerciseName: { fontSize: 16, fontWeight: "600" },
  lastSet: { fontSize: 14, color: "#6b7280" },
  setItem: { fontSize: 16, paddingVertical: 2 },
});