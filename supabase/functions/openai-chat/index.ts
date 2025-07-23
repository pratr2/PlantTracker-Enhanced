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
    const userId = body.user_id || body.userId || null; // assuming Bolt includes this
    if (!userId) throw new Error('Missing user_id in request');

    // ✅ Handle LLM chatbot actions (Bolt-style)
    if (body.type === 'action') {
      const { action, data } = body;
      let responseMessage = 'Action completed successfully.'; // Default success message

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

      // Return structured action response
      return new Response(JSON.stringify({
        type: 'action', // Crucial for frontend to identify as an action
        action: action, // The specific action performed
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

    const functionSpecs = [
      {
        name: 'update_plant',
        description: 'Update plant info',
        parameters: {
          type: 'object',
          properties: {
            plant_id: {
              type: 'string'
            },
            updates: {
              type: 'object',
              properties: {
                plant_name: {
                  type: 'string'
                },
                // Ensure these properties match your database schema and frontend expectations
                last_watered: {
                  type: 'string',
                  format: 'date-time'
                },
                notes: {
                  type: 'string'
                },
                species: { type: 'string' },
                image_url: { type: 'string' },
                date_acquired: { type: 'string', format: 'date' },
                watering_frequency: { type: 'number' },
                fertilizing_frequency: { type: 'number' },
                repotting_frequency: { type: 'number' },
                last_fertilized: { type: 'string', format: 'date-time' },
                last_repotted: { type: 'string', format: 'date-time' },
                health_status: { type: 'string' },
                care_instructions: { type: 'string' },
                pot_size: { type: 'string' },
                location: { type: 'string' },
              }
            }
          },
          required: [
            'plant_id',
            'updates'
          ]
        }
      }
    ];

    const openaiRequest: any = { // Use 'any' for now to allow dynamic properties
      model: hasImages ? 'gpt-4o' : model,
      messages,
      max_tokens: 2000,
      temperature: 0.7
    };

    if (functions && functions.length > 0 && !hasImages) {
      openaiRequest.functions = functions;
      if (function_call) {
        openaiRequest.function_call = function_call;
      }
    } else if (!functions) {
      openaiRequest.functions = functionSpecs;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(openaiRequest)
    });

    const data = await response.json();

    // Handle function call (e.g., from OpenAI assistant)
    const functionCall = data.choices?.[0]?.message?.function_call;
    if (functionCall) {
      const { name, arguments: argsString } = functionCall;
      const args = JSON.parse(argsString);

      if (name === 'update_plant') {
        const { plant_id, updates } = args;
        const { error } = await supabase.from('plants').update(updates).eq('id', plant_id).eq('user_id', userId);
        if (error) throw error;

        // Return structured action response for update_plant function call
        return new Response(JSON.stringify({
          type: 'action',
          action: 'updatePlant',
          message: 'Plant updated successfully via AI function call!'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // Extract AI message content for standard chat response
    const aiMessageContent = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Return structured chat response
    return new Response(JSON.stringify({
      type: 'chat', // Crucial for frontend to identify as a chat message
      message: aiMessageContent
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({
      type: 'chat', // Always return a chat type for errors to be handled gracefully
      message: `Sorry, an error occurred: ${error.message || 'Unknown error'}. Please try again.`
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});