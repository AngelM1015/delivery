// src/cable.js
import ActionCable from 'react-native-actioncable';

const cable = ActionCable.createConsumer('ws://localhost:3000/cable');
export default cable;
