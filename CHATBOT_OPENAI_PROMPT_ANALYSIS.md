# Plant Tracker Chatbot - OpenAI Prompt Analysis

## Chat Window Size
- **Messages sent**: Last 10 messages from chat history
- **System message**: Always included as first message
- **Total messages per request**: 1 system + up to 10 chat messages

## System Message (Sent Every Time)
```
You are a plant care assistant. You can add, update, and retrieve plant data, mark care actions, and provide plant care advice. You can also analyze plant images for health issues and process plant data files. Only use functions when the user specifically asks for data operations or plant management tasks. For general conversation, respond normally without calling functions.
```

## Function Call Setting
- **Default**: `function_call: 'none'` (AI won't call functions unless explicitly needed)
- **When images present**: Uses `gpt-4o` model
- **When no images**: Uses `gpt-4o-mini` model

## Available Functions (Function Specifications)

### 1. add_plant
```json
{
  "name": "add_plant",
  "description": "Add a plant",
  "parameters": {
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

### 2. get_plants
```json
{
  "name": "get_plants",
  "description": "Get all plants",
  "parameters": { "type": "object", "properties": {}, "required": [] }
}
```

### 3. water_plant
```json
{
  "name": "water_plant",
  "description": "Mark a plant as watered",
  "parameters": { 
    "type": "object", 
    "properties": { "plant_id": { "type": "string" } }, 
    "required": ["plant_id"] 
  }
}
```

### 4. fertilize_plant
```json
{
  "name": "fertilize_plant",
  "description": "Mark a plant as fertilized",
  "parameters": { 
    "type": "object", 
    "properties": { "plant_id": { "type": "string" } }, 
    "required": ["plant_id"] 
  }
}
```

### 5. repot_plant
```json
{
  "name": "repot_plant",
  "description": "Mark a plant as repotted",
  "parameters": { 
    "type": "object", 
    "properties": { "plant_id": { "type": "string" } }, 
    "required": ["plant_id"] 
  }
}
```

### 6. update_plant
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

### 7. delete_plant
```json
{
  "name": "delete_plant",
  "description": "Delete a plant from the library",
  "parameters": {
    "type": "object",
    "properties": {
      "plant_id": { "type": "string" }
    },
    "required": ["plant_id"]
  }
}
```

### 8. bulk_import_plants
```json
{
  "name": "bulk_import_plants",
  "description": "Import multiple plants from file data",
  "parameters": {
    "type": "object",
    "properties": {
      "plants": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "plant_name": { "type": "string" },
            "plant_type": { "type": "string" },
            "species": { "type": "string" },
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
    },
    "required": ["plants"]
  }
}
```

## Backend Action Handlers

### delete_plant Action
```typescript
case 'delete_plant':
  {
    const { id: plantIdToDelete } = data;
    const { error } = await supabase.from('plants').delete().eq('id', plantIdToDelete).eq('user_id', userId);
    if (error) throw error;
    responseMessage = `Plant deleted successfully!`;
    break;
  }
```

## Frontend Action Handler
```typescript
case 'delete_plant':
  await onDeletePlant(parsedResponse.data.id)
  break
```

## Troubleshooting the Delete Issue

### Problem Analysis:
1. **First time**: AI says "ok I'll delete" but doesn't call the function
2. **Second time**: AI asks for plant ID instead of using the plant name

### Root Causes:
1. **Function call setting**: Set to `'none'` - AI might not be calling functions when it should
2. **Plant identification**: AI needs to know which plant to delete but doesn't have access to plant list
3. **Context loss**: AI might not remember the plant name from previous messages

### Solutions to Try:
1. **Change function_call back to 'auto'** for delete operations
2. **Add plant name to delete function** - let AI search by name first
3. **Improve system message** to be more specific about when to use functions

## Current Request Format
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a plant care assistant..."
    },
    // ... up to 10 chat messages
  ],
  "max_tokens": 2000,
  "temperature": 0.7,
  "functions": [/* all function specs */],
  "function_call": "none"
}
```

## Recommendations:
1. **For delete operations**: Change to `function_call: 'auto'` or add specific logic
2. **Add plant search**: Create a function to search plants by name before deleting
3. **Improve context**: Make AI remember plant names better in conversation
