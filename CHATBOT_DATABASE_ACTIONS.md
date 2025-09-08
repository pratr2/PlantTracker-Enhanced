# Plant Tracker Chatbot - Database Actions & Capabilities

## 🤖 **Chatbot Overview**

The Plant Tracker chatbot is an AI-powered assistant that can directly modify your plant database through natural language commands. It uses OpenAI's function calling to perform database operations while maintaining conversation context.

---

## 📊 **Database Tables & Actions**

### **1. Plants Table (`plants`)**
**Actions Available:**
- ✅ **Add Plant** - Create new plant entries
- ✅ **Update Plant** - Modify existing plant information
- ✅ **Delete Plant** - Remove plants from database
- ✅ **Get Plants** - Retrieve all user's plants
- ✅ **Water Plant** - Update `last_watered` timestamp
- ✅ **Fertilize Plant** - Update `last_fertilized` timestamp
- ✅ **Repot Plant** - Update `last_repotted` timestamp

### **2. Fertilization Table (`fertilization`)**
**Actions Available:**
- ✅ **Add Fertilization Record** - Log fertilization activities

### **3. Soil Health Table (`soil_health`)**
**Actions Available:**
- ✅ **Add Soil Health Record** - Log soil measurements

### **4. Pest Control Table (`pest_control`)**
**Actions Available:**
- ✅ **Add Pest Control Record** - Log pest treatments

---

## 🎯 **Natural Language Commands**

### **Plant Management**
| Command | Action | Database Operation |
|---------|--------|-------------------|
| `"Add a new Monstera plant"` | Creates plant entry | `INSERT INTO plants` |
| `"Show me all my plants"` | Retrieves plants | `SELECT * FROM plants` |
| `"Update my orchid's care instructions"` | Updates plant info | `UPDATE plants` |
| `"Delete my cactus"` | Removes plant | `DELETE FROM plants` |

### **Plant Care Actions**
| Command | Action | Database Operation |
|---------|--------|-------------------|
| `"Water my snake plant"` | Marks as watered | `UPDATE last_watered` |
| `"Fertilize my pothos"` | Marks as fertilized | `UPDATE last_fertilized` |
| `"Repot my cactus"` | Marks as repotted | `UPDATE last_repotted` |

### **Care Records**
| Command | Action | Database Operation |
|---------|--------|-------------------|
| `"Add fertilization record for my orchid"` | Logs fertilization | `INSERT INTO fertilization` |
| `"Record soil pH for my Monstera"` | Logs soil data | `INSERT INTO soil_health` |
| `"Add pest treatment for my pothos"` | Logs pest control | `INSERT INTO pest_control` |

---

## 🧠 **AI Instructions Sent to OpenAI**

### **System Message**
```
You are a plant care assistant. You can add, update, and retrieve plant data, mark care actions, and provide plant care advice. Use the provided functions to modify or fetch data as needed.
```

### **Function Definitions**
The AI receives these function definitions to understand available actions:

#### **1. add_plant**
```json
{
  "name": "add_plant",
  "description": "Add a plant",
  "parameters": {
    "properties": {
      "plant_name": { "type": "string" },
      "plant_type": { "type": "string" },
      "species": { "type": "string" },
      "image_url": { "type": "string" },
      "date_acquired": { "type": "string", "format": "date" },
      "watering_frequency": { "type": "number" },
      "fertilizing_frequency": { "type": "number" },
      "repotting_frequency": { "type": "number" },
      "health_status": { "type": "string" },
      "care_instructions": { "type": "string" },
      "pot_size": { "type": "string" },
      "location": { "type": "string" },
      "notes": { "type": "string" }
    },
    "required": ["plant_name"]
  }
}
```

#### **2. get_plants**
```json
{
  "name": "get_plants",
  "description": "Get all plants",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

#### **3. water_plant**
```json
{
  "name": "water_plant",
  "description": "Mark a plant as watered",
  "parameters": {
    "type": "object",
    "properties": {
      "plant_id": { "type": "string" }
    },
    "required": ["plant_id"]
  }
}
```

#### **4. fertilize_plant**
```json
{
  "name": "fertilize_plant",
  "description": "Mark a plant as fertilized",
  "parameters": {
    "type": "object",
    "properties": {
      "plant_id": { "type": "string" }
    },
    "required": ["plant_id"]
  }
}
```

#### **5. repot_plant**
```json
{
  "name": "repot_plant",
  "description": "Mark a plant as repotted",
  "parameters": {
    "type": "object",
    "properties": {
      "plant_id": { "type": "string" }
    },
    "required": ["plant_id"]
  }
}
```

#### **6. update_plant**
```json
{
  "name": "update_plant",
  "description": "Update plant info",
  "parameters": {
    "type": "object",
    "properties": {
      "plant_id": { "type": "string" },
      "updates": {
        "type": "object",
        "properties": {
          "plant_name": { "type": "string" },
          "plant_type": { "type": "string" },
          "species": { "type": "string" },
          "image_url": { "type": "string" },
          "date_acquired": { "type": "string", "format": "date" },
          "watering_frequency": { "type": "number" },
          "fertilizing_frequency": { "type": "number" },
          "repotting_frequency": { "type": "number" },
          "last_watered": { "type": "string", "format": "date-time" },
          "last_fertilized": { "type": "string", "format": "date-time" },
          "last_repotted": { "type": "string", "format": "date-time" },
          "health_status": { "type": "string" },
          "care_instructions": { "type": "string" },
          "pot_size": { "type": "string" },
          "location": { "type": "string" },
          "notes": { "type": "string" }
        }
      }
    },
    "required": ["plant_id", "updates"]
  }
}
```

---

## 🔧 **Technical Implementation**

### **Backend (Supabase Edge Function)**
- **File**: `supabase/functions/openai-chat/index.ts`
- **Model**: GPT-4o-mini (default) or GPT-4o (for images)
- **Token Optimization**: Limited to last 10 messages
- **Function Calling**: `function_call: 'auto'`

### **Frontend (React Component)**
- **File**: `src/components/ChatBot.tsx`
- **Features**: Real-time chat, message history, action handling

### **Database Schema**
```sql
-- Plants table
CREATE TABLE plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plant_name text NOT NULL,
  plant_type text,
  species text,
  image_url text,
  date_acquired date,
  watering_frequency integer,
  fertilizing_frequency integer,
  repotting_frequency integer,
  last_watered timestamptz,
  last_fertilized timestamptz,
  last_repotted timestamptz,
  health_status text,
  care_instructions text,
  pot_size text,
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fertilization records
CREATE TABLE fertilization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plant_name text NOT NULL,
  date date NOT NULL,
  fertilizer_type text NOT NULL,
  dosage text,
  method text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Soil health records
CREATE TABLE soil_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plant_name text NOT NULL,
  date date NOT NULL,
  tds_ppm numeric,
  ph numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Pest control records
CREATE TABLE pest_control (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plant_name text NOT NULL,
  date date NOT NULL,
  pest_type text,
  treatment text NOT NULL,
  method text,
  notes text,
  created_at timestamptz DEFAULT now()
);
```

---

## 💡 **Example Conversations**

### **Adding Plants**
**User**: "Add a new Monstera plant named 'Big Leaf'"
**Bot**: "Plant 'Big Leaf' added successfully!"

### **Plant Care**
**User**: "Water my snake plant"
**Bot**: "Plant watered successfully!"

### **Getting Information**
**User**: "Show me all my plants"
**Bot**: "Found 3 plants. Here are your plants: [JSON data]"

### **Updating Information**
**User**: "Update my orchid's care instructions to water every 7 days"
**Bot**: "Plant updated successfully!"

---

## 🚀 **Usage Tips**

1. **Be Specific**: "Water my Monstera" works better than "Water plants"
2. **Use Plant Names**: The AI can identify plants by name
3. **Natural Language**: Speak naturally, the AI understands context
4. **Care Records**: Always specify the plant name for care records

---

## 🔒 **Security & Data Isolation**

- All database operations are scoped to the current user (`user_id`)
- No cross-user data access
- Input validation on all database operations
- Error handling for failed operations

---

## 📈 **Performance Optimizations**

- **Token Limiting**: Only last 10 messages sent to OpenAI
- **Concise System Message**: Reduced from ~400 to ~50 tokens
- **Simplified Function Descriptions**: Removed verbose descriptions
- **Efficient Database Queries**: Optimized for user-specific data

---

## 🐛 **Troubleshooting**

### **Common Issues**
1. **"I cannot modify the database"** - Check if functions are properly defined
2. **No response** - Verify OpenAI API key is set
3. **Wrong plant updated** - Ensure plant names are specific

### **Debug Steps**
1. Check Supabase Edge Function logs
2. Verify environment variables
3. Test with simple commands first
4. Check browser console for errors

---

This chatbot provides a complete plant management system through natural language, making plant care tracking intuitive and accessible! 🌱 