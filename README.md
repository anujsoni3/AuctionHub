# 🧠 SmartAuction – Voice-Powered Real-Time Auction System

SmartAuction is a voice-driven, API-connected auction platform that allows users to participate in live auctions using natural language commands. Users can place bids, check the highest bid, view product listings, and track auction timing — all via a conversational voice agent or a full-featured web dashboard.

---

## Website Link

[https://smart-auction-1213.vercel.app/](https://smart-auction-1213.vercel.app/)

## Frontend Setup

Create a local env file before running locally:

```bash
cp .env.example .env
```

Set your backend URL in `.env`:

```env
VITE_API_BASE_URL=https://your-backend-url.example.com
```

## 🌟 Features

- 🎙️ Voice-controlled auction interactions (via OmniDimension agent)
- 🧠 AI-powered conversation flow using ChatGPT-4.0
- 🔄 Real-time bid placement and product status updates
- 📊 Web dashboard for managing products, auctions, and bids
- 🔗 API-driven architecture for seamless integration
- ⏱️ Auto-expiry logic for auctions and products

---

## 🛠️ Tech Stack

### 🔧 Backend
- **Language**: Python  
- **Framework**: Flask  
- **Database**: MongoDB  
- **APIs**: RESTful API for products, bids, and auctions  

### 🎙️ Voice Agent
- **Platform**: OmniDimension  
- **Model**: ChatGPT-4.0  
- **Speech-to-Text**: Deepgram (Nova-3)  
- **Text-to-Speech**: ElevenLabs  
- **Flows**: Custom voice flows using context-based triggers

### 🌐 Frontend
- **Languages**: HTML, CSS, JavaScript  
- **Functionality**: Full admin panel to manage products, bids, and auction control  
- **Deployment**: Railway (for backend) + local admin interface

---

## 📦 Data Models

### 📦 Product Model

```json
{
  "id": "P001",
  "name": "iPhone 15 Pro",
  "description": "Latest Apple flagship with A17 Bionic chip",
  "auction_id": "A001",
  "time": "2025-06-23T18:00:00",
  "status": "unsold",
  "bids": []
}

{
  "_id": "6859657bfbe4ead84ea5f4aa",
  "product_id": "P001",
  "product_name": "iPhone 15 Pro",
  "amount": 1000,
  "status": "success",
  "timestamp": "2025-06-23T14:32:26.834Z",
  "user_id": "user123",
  "auction_id": "A001"
}
{
  "_id": "685964defbe4ead84ea5f4a9",
  "id": "A001",
  "name": "Sale",
  "product_ids": ["P001", "P002", "P003"],
  "valid_until": "2025-06-26T19:59"
}
