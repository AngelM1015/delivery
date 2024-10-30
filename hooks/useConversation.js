import { useMemo, useState, useEffect } from "react";
import useUser from "./useUser";
import { ConversationService } from "../services/conversations";

const useConversation = () => {
  const { loading: fetchingUser, role, token, userId } = useUser()
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);

  const ConversationServiceClient = useMemo(() => {
    console.log('token', token)
    if (token && role) {
      return new ConversationService(token, role, conversation)
    }
  }, [token, role, conversation]);

  const fetchConversation = async () => {
    setLoading(true);
    try {
      const conversation = await ConversationServiceClient.fetchConversation();
      setMessages(conversation.messages);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async (body) => {
    setLoading(true);
    try {
      const message = await ConversationServiceClient.createMessage(body);
    } catch (error) {
      console.error('Error sending Message', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchingUser) {
      fetchConversation()
    }
  }, [fetchingUser])

  return{
    conversation,
    messages,
    loading,
    createMessage,
    setMessages,
    setConversation
  }
};

export default useConversation