import client from "../client";

export class LocationService {
  token = "";
  role = "";
  constructor(token, role) {
    this.token = token;
    this.role = role;
  }

  async addAddress(data) {
    const url = 'api/v1/addresses'
    const response = await client.post(url,
      { address: data },
      {
      headers: { Authorization: `Bearer ${this.token}`}
    })

    return response.data;
  }

  async getAddresses() {
    const url = 'api/v1/addresses'
    const response = await client.get(url, {
      headers: { Authorization: `Bearer ${this.token}`}
    })

    return response.data;
  }
}