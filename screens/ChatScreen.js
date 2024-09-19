import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import cable from '../cable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const route = useRoute();
  const [conversationId, setConversationId] = useState(route.params.conversationId);

  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);

      if (cable.connection.isOpen()) {
        console.log("WebSocket connection is open.");
      } else {
        console.log("WebSocket connection is not open.");
      }
      
      console.log('conversation id', route.params.conversationId)
      const subscription = await cable.subscriptions.create(
        { channel: 'ChatChannel', id: conversationId },
        {
          received: (data) => {
            console.log("Received new message:", data);
            setMessages((messages) => [...messages, data]);
          },
        }
      );

      console.log('subscription', subscription);
  
      const response = await axios.get(`http://localhost:3000/api/v1/conversations/${conversationId}`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
      );
  
      setMessages(response.data.messages);
  
      return () => {
        subscription.unsubscribe();
      };
    };
  
    initialize();
  }, [conversationId]);
  

  const handleSendMessage = async () => {
    const token = await AsyncStorage.getItem('userToken');

    try {
      const response = await fetch('http://localhost:3000/api/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: {
            text: newMessage,
            conversation_id: conversationId,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewMessage('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderItem = ({ item }) => {
    const isCurrentUser = item.user_id === parseInt(currentUserId);
    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUser : styles.otherUser]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message"
          style={styles.input}
          onSubmitEditing={handleSendMessage}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  currentUser: {
    backgroundColor: '#d1e7dd',
    alignSelf: 'flex-end',
  },
  otherUser: {
    backgroundColor: '#f8d7da',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    paddingHorizontal: 10,
  },
});

export default ChatScreen;
