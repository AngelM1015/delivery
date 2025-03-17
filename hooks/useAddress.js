import {useEffect, useMemo, useState} from "react";
import { LocationService } from "../services/locations";
import useUser from "./useUser";
import { GOOGLE_MAPS_API_KEY } from "@env";
import axios from "axios";

const useAddress = () => {
  const {token, role} = useUser();
  const [addresses, setAddresses] = useState({});

  const LocationServiceClient =  useMemo(() => {
    if (token && role) {
      return new LocationService(token, role);
    }
  }, [token, role]);

  const fetchAddresses = async () => {
    if(!LocationServiceClient) return;
    const response = await LocationServiceClient.getAddresses();
    setAddresses(response);
  }

  const addAddress = async (lat, lng) => {
    const data = {
      latitude: lat,
      longitude: lng,
      location_name: await fetchLocationName(lat, lng)
    }
    const response = await LocationServiceClient.addAddress(data)

    return response;
  }

  const fetchLocationName = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
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

  useEffect(() => {
    if(LocationServiceClient){
      fetchAddresses();
    }
  }, [LocationServiceClient])

  return {
    addresses,
    fetchAddresses,
    addAddress
  }
}

export default useAddress;
