import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    const openaiApiKey = Deno.env.get('openai_api_key');
    if (!openaiApiKey) throw new Error('Missing OpenAI API Key');

    const body = await req.json();
    const userId = body.user_id || body.userId || null;
    if (!userId) throw new Error('Missing user_id in request');

    // ✅ Handle LLM chatbot actions (Bolt-style)
    if (body.type === 'action') {
      const { action, data } = body;
      let responseMessage = 'Action completed successfully.';

      switch (action) {
        case 'addPlant':
          {
            const { error } = await supabase.from('plants').insert([
              {
                user_id: userId,
                ...data
              }
            ]);
            if (error) throw error;
            responseMessage = `Plant "${data.plant_name || 'unnamed plant'}" added successfully!`;
            break;
          }
        case 'updatePlant':
          {
            const { id: plantIdToUpdate, ...updates } = data;
            const { error } = await supabase.from('plants').update(updates).eq('id', plantIdToUpdate).eq('user_id', userId);
            if (error) throw error;
            responseMessage = `Plant updated successfully!`;
            break;
          }
        case 'deletePlant':
          {
            const { id: plantIdToDelete } = data;
            const { error } = await supabase.from('plants').delete().eq('id', plantIdToDelete).eq('user_id', userId);
            if (error) throw error;
            responseMessage = `Plant deleted successfully!`;
            break;
          }
        case 'addFertilization':
          {
            const { error } = await supabase.from('fertilization').insert([
              {
                user_id: userId,
                date: new Date().toISOString().split('T')[0],
                ...data
              }
            ]);
            if (error) throw error;
            responseMessage = `Fertilization record added for "${data.plant_name || 'unnamed plant'}"!`;
            break;
          }
        case 'addSoil':
          {
            const { error } = await supabase.from('soil_health').insert([
              {
                user_id: userId,
                date: new Date().toISOString().split('T')[0],
                ...data
              }
            ]);
            if (error) throw error;
            responseMessage = `Soil health record added for "${data.plant_name || 'unnamed plant'}"!`;
            break;
          }
        case 'addPestControl':
          {
            const { error } = await supabase.from('pest_control').insert([
              {
                user_id: userId,
                date: new Date().toISOString().split('T')[0],
                ...data
              }
            ]);
            if (error) throw error;
            responseMessage = `Pest control record added for "${data.plant_name || 'unnamed plant'}"!`;
            break;
          }
        default:
          console.warn('Unknown action type from chatbot:', action);
          responseMessage = 'Unknown action requested.';
      }

      return new Response(JSON.stringify({
        type: 'action',
        action: action,
        message: responseMessage
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // ✅ Else: Handle OpenAI chat flow (standard)
    const { messages, functions, function_call, model = 'gpt-4o-mini' } = body;
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const hasImages = messages.some((msg) => Array.isArray(msg.content) && msg.content.some((item) => item.type === 'image_url'));

    // Add system message to help AI understand its capabilities
    const systemMessage = {
      role: 'system',
      content: `You are a helpful plant care assistant with the ability to modify plant data in a database. You have access to functions that can directly modify the database.

IMPORTANT: When users ask to modify data, you MUST use the available functions. Do not say you cannot modify the database - you can and should use the functions provided.

You can:
1. Add new plants with details like name, species, care instructions
2. Update existing plant information (watering schedule, notes, location, etc.)
3. Mark plants as watered, fertilized, or repotted
4. Add care records (fertilization, soil health, pest control)
5. Get plant information and history
6. Provide general plant care advice

When users ask to modify data, ALWAYS use the appropriate functions:
- "Add a new snake plant" → use add_plant function
- "Water my Monstera" → use water_plant function
- "Update my orchid's care instructions" → use update_plant function
- "Show me all my plants" → use get_plants function
- "Fertilize my pothos" → use fertilize_plant function
- "Repot my cactus" → use repot_plant function

You have the ability to modify the database directly through these functions. Always use them when users request data modifications.`
    };

    const functionSpecs = [
      {
        name: 'add_plant',
        description: 'Add a new plant to the user\'s collection',
        parameters: {
          type: 'object',
          properties: {
            plant_name: { type: 'string', description: 'Name of the plant' },
            plant_type: { type: 'string', description: 'Type of plant' },
            species: { type: 'string', description: 'Species of the plant' },
            image_url: { type: 'string', description: 'URL of plant image' },
            date_acquired: { type: 'string', format: 'date', description: 'Date when plant was acquired' },
            watering_frequency: { type: 'number', description: 'Watering frequency in days' },
            fertilizing_frequency: { type: 'number', description: 'Fertilizing frequency in days' },
            repotting_frequency: { type: 'number', description: 'Repotting frequency in days' },
            health_status: { type: 'string', description: 'Current health status' },
            care_instructions: { type: 'string', description: 'Care instructions for the plant' },
            pot_size: { type: 'string', description: 'Size of the pot' },
            location: { type: 'string', description: 'Location of the plant' },
            notes: { type: 'string', description: 'Additional notes about the plant' }
          },
          required: ['plant_name']
        }
      },
      {
        name: 'get_plants',
        description: 'Get all plants for the current user',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'water_plant',
        description: 'Mark a plant as watered',
        parameters: {
          type: 'object',
          properties: {
            plant_id: {
              type: 'string',
              description: 'The ID of the plant to water'
            }
          },
          required: ['plant_id']
        }
      },
      {
        name: 'fertilize_plant',
        description: 'Mark a plant as fertilized',
        parameters: {
          type: 'object',
          properties: {
            plant_id: {
              type: 'string',
              description: 'The ID of the plant to fertilize'
            }
          },
          required: ['plant_id']
        }
      },
      {
        name: 'repot_plant',
        description: 'Mark a plant as repotted',
        parameters: {
          type: 'object',
          properties: {
            plant_id: {
              type: 'string',
              description: 'The ID of the plant to repot'
            }
          },
          required: ['plant_id']
        }
      },
      {
        name: 'update_plant',
        description: 'Update plant information',
        parameters: {
          type: 'object',
          properties: {
            plant_id: {
              type: 'string',
              description: 'The ID of the plant to update'
            },
            updates: {
              type: 'object',
              properties: {
                plant_name: { type: 'string' },
                plant_type: { type: 'string' },
                species: { type: 'string' },
                image_url: { type: 'string' },
                date_acquired: { type: 'string', format: 'date' },
                watering_frequency: { type: 'number' },
                fertilizing_frequency: { type: 'number' },
                repotting_frequency: { type: 'number' },
                last_watered: { type: 'string', format: 'date-time' },
                last_fertilized: { type: 'string', format: 'date-time' },
                last_repotted: { type: 'string', format: 'date-time' },
                health_status: { type: 'string' },
                care_instructions: { type: 'string' },
                pot_size: { type: 'string' },
                location: { type: 'string' },
                notes: { type: 'string' }
              }
            }
          },
          required: ['plant_id', 'updates']
        }
      }
    ];

    const openaiRequest: any = {
      model: hasImages ? 'gpt-4o' : model,
      messages: [systemMessage, ...messages],
      max_tokens: 2000,
      temperature: 0.7,
      functions: functionSpecs,
      function_call: 'auto'
    };

    console.log('OpenAI request:', JSON.stringify(openaiRequest, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(openaiRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data, null, 2));

    // Handle function call (e.g., from OpenAI assistant)
    const functionCall = data.choices?.[0]?.message?.function_call;
    if (functionCall) {
      console.log('Function call detected:', functionCall);
      const { name, arguments: argsString } = functionCall;
      const args = JSON.parse(argsString);
      console.log('Function name:', name, 'Arguments:', args);

      let responseMessage = '';

      switch (name) {
        case 'add_plant':
          {
            const { error } = await supabase.from('plants').insert([
              {
                user_id: userId,
                ...args
              }
            ]);
            if (error) throw error;
            responseMessage = `Plant "${args.plant_name || 'unnamed plant'}" added successfully!`;
            break;
          }
        case 'get_plants':
          {
            const { data: plants, error } = await supabase
              .from('plants')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false });
            if (error) throw error;
            responseMessage = `Found ${plants.length} plants. Here are your plants: ${JSON.stringify(plants)}`;
            break;
          }
        case 'water_plant':
          {
            const { plant_id } = args;
            const { error } = await supabase
              .from('plants')
              .update({ last_watered: new Date().toISOString() })
              .eq('id', plant_id)
              .eq('user_id', userId);
            if (error) throw error;
            responseMessage = `Plant watered successfully!`;
            break;
          }
        case 'fertilize_plant':
          {
            const { plant_id } = args;
            const { error } = await supabase
              .from('plants')
              .update({ last_fertilized: new Date().toISOString() })
              .eq('id', plant_id)
              .eq('user_id', userId);
            if (error) throw error;
            responseMessage = `Plant fertilized successfully!`;
            break;
          }
        case 'repot_plant':
          {
            const { plant_id } = args;
            const { error } = await supabase
              .from('plants')
              .update({ last_repotted: new Date().toISOString() })
              .eq('id', plant_id)
              .eq('user_id', userId);
            if (error) throw error;
            responseMessage = `Plant repotted successfully!`;
            break;
          }
        case 'update_plant':
          {
            const { plant_id, updates } = args;
            const { error } = await supabase.from('plants').update(updates).eq('id', plant_id).eq('user_id', userId);
            if (error) throw error;
            responseMessage = 'Plant updated successfully!';
            break;
          }
        default:
          console.warn('Unknown function call:', name);
          responseMessage = 'Unknown function requested.';
      }

      // Return structured response for function call
      return new Response(JSON.stringify({
        choices: [{
          message: {
            content: responseMessage
          }
        }]
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Return the response in the format expected by the frontend
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({
      choices: [{
        message: {
          content: `Sorry, an error occurred: ${error.message || 'Unknown error'}. Please try again.`
        }
      }]
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});