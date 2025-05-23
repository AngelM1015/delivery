// src/cable.js
import { BACKEND_HOST } from "@env";
import ActionCable from "react-native-actioncable";

const cable = ActionCable.createConsumer(
  `ws://${BACKEND_HOST || "localhost"}:3000/cable`,
);

cable.connection.monitor.reconnect = () => {
  console.log("Reconnecting to WebSocket...");
};
export default cable;
