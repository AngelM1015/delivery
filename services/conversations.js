import client from "../client";

export class ConversationService {
  token = ""
  role = ""
  conversationId = ""
  constructor(token, role, conversationId) {
    this.token = token
    this.role = role
    this.conversationId = conversationId
  }

  async fetchConversation() {
    const url = `api/v1/conversations/${this.conversationId}`
    const response = await client.get(url, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.data
  }

  async createMessage(body) {
    const url = `api/v1/messages`
    const response = await client.post(url,
      { message: body.message },
      {
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      },
    });
    return response.data
  }
}
