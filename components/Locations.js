import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { base_url } from "../constants/api";
import axios from "axios";
import useUser from "../hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "./CustomButton";
import MapView, { Marker } from "react-native-maps";
import { GOOGLE_MAPS_API_KEY } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Locations = ({ isVisible, onClose, onSelectLocation }) => {
  const { token, role } = useUser();
  const [locations, setLocations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Debounce timer reference
  const debounceTimerRef = useRef(null);

  const mapRef = useRef(null);

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
  
  // Effect for debounced search
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Only search if query is at least 3 characters
    if (searchQuery.length >= 3) {
      // Set a new timer
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 500); // 500ms delay
    } else {
      setSuggestions([]);
    }
    
    // Cleanup function to clear timer if component unmounts or searchQuery changes
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const fetchLocations = async () => {
    if (role === "guest") return;
    try {
      const response = await axios.get(`${base_url}api/v1/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json",
        {
          params: {
            input: query,
            location: `${bigSkyRegion.latitude},${bigSkyRegion.longitude}`,
            region: "us",
            radius: 1000,
            strictbounds: true,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );
      setSuggestions(response.data.predictions || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation && !selectedLocation) return;

    const locationData = selectedLocation
      ? {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          location_name: newLocation,
        }
      : { location: newLocation };

    console.log("location data", locationData);

    if(role === 'guest') {
      saveSelectedLocation(locationData);
      onSelectLocation(locationData);
      return;
    }

    try {
      const response = await axios.post(
        `${base_url}api/v1/addresses`,
        { address: locationData },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLocations([...locations, response.data]);
      setNewLocation("");
      setSelectedLocation(null);
      setIsAdding(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding new location:", error);
    }
  };

  const handleSuggestionSelect = async (placeId) => {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
          params: {
            place_id: placeId,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );
      const { lat, lng } = response.data.result.geometry.location;
      const formattedAddress = response.data.result.formatted_address;

      setSelectedLocation({ latitude: lat, longitude: lng });
      setNewLocation(formattedAddress);
      setSuggestions([]);
      setSearchQuery("");

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
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

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });

    const locationName = await fetchLocationName(latitude, longitude);
    setNewLocation(locationName);
  };

  const fetchLocationName = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            latlng: `${latitude},${longitude}`,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );
      if (response.data.results[0]) {
        return response.data.results[0].formatted_address;
      }
      return "Unknown Location";
    } catch (error) {
      console.error("Error fetching location name:", error);
      return "Unknown Location";
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Ionicons name="close" size={32} color="black" onPress={onClose} />
          <Text style={styles.header}>Select Location</Text>
        </View>

        {isAdding && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={bigSkyRegion}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Selected Location"
                description={newLocation || "Selected Location"}
              />
            )}
          </MapView>
        )}

        <View style={styles.controlsContainer}>
          {isAdding ? (
            <View style={styles.addLocationContainer}>
              <TextInput
                style={styles.input}
                placeholder="Location Name"
                value={newLocation}
                onChangeText={(text) => {
                  setNewLocation(text);
                  setSearchQuery(text); // Update search query for debouncing
                }}
              />
              {suggestions.length > 0 && (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.place_id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSuggestionSelect(item.place_id)}
                    >
                      <Text style={styles.suggestionText}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsList}
                />
              )}
              <CustomButton text="Save Location" onPress={handleAddLocation} />
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
                onPress={() => {
                  saveSelectedLocation(item);
                  onSelectLocation(item);
                }}
              >
                <View style={styles.locationItem}>
                  <Ionicons name="location-sharp" size={24} />
                  <Text style={styles.locationText}>{item.location_name}</Text>
                </View>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#C0C0C0",
  },
  locationText: {
    fontSize: 16,
    width: "90%",
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
    borderRadius: 10,
  },
  suggestionText: {
    padding: 10,
    fontSize: 16,
    color: "black",
  },
  suggestionsList: {
    width: "100%",
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 5,
    marginBottom: 10,
  }
});

export default Locations;
