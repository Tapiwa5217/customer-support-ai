import { NextResponse } from "next/server"
import OpenAI from "openai"

const systemPrompt = '';

export async function POST(req) {
    const openai = new OpenAI();
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
        model: 'gpt-4o', // Specify the model to use
        stream: true, // Enable streaming responses
    })

    const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
          try {
            // Iterate over the streamed chunks of the response
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
              if (content) {
                const text = encoder.encode(content) // Encode the content to Uint8Array
                controller.enqueue(text) // Enqueue the encoded text to the stream
              }
            }
          } catch (err) {
            controller.error(err) // Handle any errors that occur during streaming
          } finally {
            controller.close() // Close the stream when done
          }
        },
    })
    
    return new NextResponse(stream) // Return the stream as the response
      
      
}