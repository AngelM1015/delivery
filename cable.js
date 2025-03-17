// src/cable.js
import ActionCable from "react-native-actioncable";

const cable = ActionCable.createConsumer("ws://10.0.1.230:3000/cable");

cable.connection.monitor.reconnect = () => {
  console.log("Reconnecting to WebSocket...");
};
export default cable;
