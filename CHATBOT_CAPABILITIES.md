# Plant Tracker Chatbot - Data Modification Capabilities

Your chatbot now has comprehensive data modification capabilities! Here's what it can do:

## 🌱 Plant Management

### Add Plants
- **Example**: "Add a new Monstera plant"
- **Example**: "Create a new snake plant with care instructions"
- **Function**: `addPlant` action

### Update Plants
- **Example**: "Update my orchid's care instructions"
- **Example**: "Change my pothos watering frequency to 7 days"
- **Function**: `update_plant` function

### Delete Plants
- **Example**: "Delete my cactus plant"
- **Function**: `deletePlant` action

### Get Plant Information
- **Example**: "Show me all my plants"
- **Example**: "Get details for my Monstera"
- **Functions**: `get_plants`, `get_plant_by_id`

## 💧 Plant Care Actions

### Water Plants
- **Example**: "Water my Monstera"
- **Example**: "Mark my snake plant as watered"
- **Function**: `water_plant` function
- **Updates**: `last_watered` timestamp

### Fertilize Plants
- **Example**: "Fertilize my orchid"
- **Example**: "Mark my pothos as fertilized"
- **Function**: `fertilize_plant` function
- **Updates**: `last_fertilized` timestamp

### Repot Plants
- **Example**: "Repot my cactus"
- **Example**: "Mark my Monstera as repotted"
- **Function**: `repot_plant` function
- **Updates**: `last_repotted` timestamp

## 📊 Care Records

### Add Fertilization Records
- **Example**: "Add a fertilization record for my pothos"
- **Example**: "Record that I fertilized my orchid with 10-10-10 NPK"
- **Function**: `add_fertilization_record`
- **Data**: plant_name, fertilizer_type, dosage, method, notes

### Add Soil Health Records
- **Example**: "Add soil health record for my Monstera"
- **Example**: "Record soil pH of 6.5 for my snake plant"
- **Function**: `add_soil_health_record`
- **Data**: plant_name, tds_ppm, ph, notes

### Add Pest Control Records
- **Example**: "Add pest control record for my orchid"
- **Example**: "Record spider mite treatment for my pothos"
- **Function**: `add_pest_control_record`
- **Data**: plant_name, pest_type, treatment, method, notes

### Get History
- **Example**: "Show my fertilization history"
- **Example**: "Get my soil health records"
- **Example**: "Show my pest control history"
- **Functions**: `get_fertilization_history`, `get_soil_history`, `get_pest_control_history`

## 🧠 How It Works

1. **Natural Language Processing**: The AI understands natural language requests
2. **Function Calling**: When you ask to modify data, the AI calls the appropriate function
3. **Database Updates**: Functions directly modify your Supabase database
4. **Confirmation**: You get a clear message confirming what was done

## 💡 Example Conversations

**User**: "Add a new Monstera plant"
**Bot**: "I'll add a new Monstera plant to your collection. What would you like to name it?"

**User**: "Water my snake plant"
**Bot**: "I've marked your snake plant as watered! The last_watered timestamp has been updated."

**User**: "Show me all my plants"
**Bot**: "Here are all your plants: [list of plants with details]"

**User**: "Add a fertilization record for my pothos"
**Bot**: "I'll add a fertilization record for your pothos. What type of fertilizer did you use?"

## 🔧 Technical Details

- **Backend**: Supabase Edge Functions with OpenAI integration
- **Database**: Direct Supabase database modifications
- **Security**: User-specific data isolation
- **Real-time**: Immediate database updates with confirmation

The chatbot maintains conversation context and can handle complex multi-step requests while ensuring data integrity and user privacy. 