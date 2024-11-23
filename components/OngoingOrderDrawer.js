import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import useOrder from '../hooks/useOrder';

const { height: screenHeight } = Dimensions.get('window');

const OngoingOrderDrawer = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { recentOrder, getRecentOrder }= useOrder()

  useEffect(() => {
    getRecentOrder();
  }, [])

  const openModal = () => {
    setModalVisible(true)
  }
  const closeModal = () => setModalVisible(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={openModal}
      >
        <Text>
          Order #{recentOrder.id}
        </Text>
        <Text>
          latest order modal
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>order status: {recentOrder.status} 🎉</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 70,
    height: 80,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContainer: {
    width: '100%',
    height: screenHeight * 0.7,
    backgroundColor: 'white',
    borderRadius: 10,
    bottom: -120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#e23744',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default OngoingOrderDrawer;



