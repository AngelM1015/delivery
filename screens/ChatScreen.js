import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from "react-native";
import cable from "../cable";
import { useRoute } from "@react-navigation/native";
import { Icons } from "../constants/Icons";
import { COLORS } from "../constants/colors";
import useConversation from "../hooks/useConversation";
import useUser from "../hooks/useUser";

const ChatScreen = ({ navigation }) => {
  const {
    messages,
    conversation,
    setMessages,
    setConversation,
    createMessage,
  } = useConversation();
  const { userId } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const route = useRoute();
  const [conversationId, setConversationId] = useState(
    route.params.conversationId,
  );

  useEffect(() => {
    setConversation(route.params.conversationId);

    const initialize = async () => {
      if (cable.connection.isOpen()) {
        console.log("WebSocket connection is open.");
      } else {
        console.log("WebSocket connection is not open.");
      }

      console.log("conversation id", route.params.conversationId);
      const subscription = await cable.subscriptions.create(
        { channel: "ChatChannel", id: conversationId },
        {
          received: (data) => {
            console.log("Received new message:", data);
            setMessages((messages) => [...messages, data]);
          },
        },
      );

      console.log("subscription", subscription);

      return () => {
        subscription.unsubscribe();
      };
    };

    initialize();
  }, [conversationId]);

  const handleSendMessage = async () => {
    const body = {
      message: {
        text: newMessage,
        conversation_id: conversation,
      },
    };
    createMessage(body);
    setNewMessage("");
  };

  const handleCall = () => {
    const phoneNumber = "+92111111111";
    Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
      console.error("Failed to open dialer", err),
    );
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderItem = ({ item }) => {
    const isCurrentUser = item.user_id === parseInt(userId);

    return (
      <View style={styles.messageWrapper}>
        {!isCurrentUser && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Icons.ChatProfile />
            <Text style={styles.receiverName}>Steve</Text>
          </View>
        )}

        <View
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.currentUser : styles.otherUser,
          ]}
        >
          <Text style={[isCurrentUser ? styles.currentText : styles.otherText]}>
            {item.text}
          </Text>
        </View>

        {isCurrentUser ? (
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
            <Icons.DoubleTick style={styles.timeIcon} />
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons.BackIcon />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Chat</Text>

          <TouchableOpacity onPress={handleCall}>
            <Icons.Callcon />
          </TouchableOpacity>
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Icons.SmileIcon />
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type something..."
              style={styles.input}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity onPress={() => {}}>
              <Icons.AttachmentIcon />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleSendMessage}
            style={{ marginLeft: 10 }}
          >
            <Icons.SendIcon />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  messageWrapper: {
    marginBottom: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  receiverName: {
    color: COLORS.black,
    fontWeight: "700",
    marginBottom: 5,
    marginLeft: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 5,
    marginRight: 10,
  },
  otherContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 5,
    marginRight: 10,
  },
  timeIcon: {
    marginLeft: 5,
  },
  timeText: {
    fontSize: 12,
    color: "#8F90A6",
    fontWeight: "400",
  },
  currentUser: {
    backgroundColor: "#F09B00",
    alignSelf: "flex-end",
  },
  otherUser: {
    backgroundColor: "#F2F2F5",
    alignSelf: "flex-start",
    marginLeft: 30,
  },
  currentText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#EBEBF0",
  },
  otherText: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.black,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    backgroundColor: "white",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDE5E9",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    marginHorizontal: 5,
    paddingHorizontal: 5,
    color: COLORS.black,
  },
  leftIcon: {
    marginRight: 5,
  },
  rightIcon: {
    marginLeft: 5,
  },
  fab: {
    backgroundColor: "#F09B00",
    marginLeft: 10,
  },
});

export default ChatScreen;
