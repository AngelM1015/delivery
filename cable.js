// src/cable.js
import ActionCable from 'react-native-actioncable';

const cable = ActionCable.createConsumer('ws://localhost:3000/cable');

cable.connection.monitor.reconnect = () => {
  console.log("Reconnecting to WebSocket...");
};
export default cable;
