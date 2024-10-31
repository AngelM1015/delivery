import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { base_url } from "../constants/api";
import axios from "axios";
import useUser from "../hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "./CustomButton";
import MapView, { Marker } from "react-native-maps";

const Locations = ({ isVisible, onClose, onSelectLocation }) => {
  const { token } = useUser();
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Set initial region for Big Sky, Montana
  const bigSkyRegion = {
    latitude: 45.2614,
    longitude: -111.308,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  useEffect(() => {
    if (isVisible) {
      fetchLocations();
    }
  }, [isVisible]);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${base_url}api/v1/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(response.data);
      console.log("Fetched locations:", response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const saveSelectedLocation = async (location) => {
    try {
      await AsyncStorage.setItem("location", JSON.stringify(location));
      console.log("Location saved successfully");
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation && !selectedLocation) return;

    const locationData = selectedLocation
      ? {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          location_name: "Big Sky",
        }
      : { location: newLocation };

    try {
      const response = await axios.post(
        `${base_url}api/v1/addresses`,
        locationData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLocations([...locations, response.data]);
      setNewLocation("");
      setSelectedLocation(null);
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding new location:", error);
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Ionicons name="close" size={32} color="black" onPress={onClose} />
          <Text style={styles.header}>Select Location</Text>
        </View>

        {/* Map View centered on Big Sky */}
        <MapView
          style={styles.map}
          initialRegion={bigSkyRegion}
          onRegionChangeComplete={(region) => {
            // Optional: Restrict region to Big Sky area by checking the new region and resetting if needed
          }}
          onPress={handleMapPress}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Selected Location"
              description="Big Sky"
            />
          )}
        </MapView>

        <View style={styles.controlsContainer}>
          {isAdding ? (
            <View style={styles.addLocationContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter new location or select on map"
                value={newLocation}
                onChangeText={setNewLocation}
              />
              <Button title="Save" onPress={handleAddLocation} />
            </View>
          ) : (
            <CustomButton
              text="Add New Location"
              onPress={() => setIsAdding(true)}
            />
          )}

          <FlatList
            data={locations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => {
                  saveSelectedLocation(item);
                  onSelectLocation(item);
                }}
              >
                <Text style={styles.locationText}>
                  <Ionicons name="location-sharp" size={24} color="#F09B00" />
                  {item.location_name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    marginVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  map: {
    height: "40%",
    width: "100%",
  },
  controlsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  locationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  locationText: {
    fontSize: 16,
  },
  addLocationContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
});

export default Locations;
