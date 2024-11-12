// src/cable.js
import ActionCable from 'react-native-actioncable';

const cable = ActionCable.createConsumer('ws://192.168.150.27:3000/cable');

cable.connection.monitor.reconnect = () => {
  console.log("Reconnecting to WebSocket...");
};
export default cable;
