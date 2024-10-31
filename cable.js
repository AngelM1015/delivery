// src/cable.js
import ActionCable from "react-native-actioncable";
import { cable_url } from "./constants/api";

const cable = ActionCable.createConsumer(`${cable_url}`);

cable.connection.monitor.reconnect = () => {
  console.log("Reconnecting to WebSocket...");
};
export default cable;
