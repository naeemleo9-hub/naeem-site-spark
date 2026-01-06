import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Server-side validation
function validateContactForm(data: unknown): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: { form: 'Invalid form data' } };
  }

  const form = data as Record<string, unknown>;

  // Name validation
  if (!form.name || typeof form.name !== 'string') {
    errors.name = 'Name is required';
  } else {
    const name = form.name.trim();
    if (name.length < 1) {
      errors.name = 'Name is required';
    } else if (name.length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }
  }

  // Email validation
  if (!form.email || typeof form.email !== 'string') {
    errors.email = 'Email is required';
  } else {
    const email = form.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email';
    } else if (email.length > 255) {
      errors.email = 'Email must be less than 255 characters';
    }
  }

  // Subject validation
  if (!form.subject || typeof form.subject !== 'string') {
    errors.subject = 'Subject is required';
  } else {
    const subject = form.subject.trim();
    if (subject.length < 1) {
      errors.subject = 'Subject is required';
    } else if (subject.length > 200) {
      errors.subject = 'Subject must be less than 200 characters';
    }
  }

  // Message validation
  if (!form.message || typeof form.message !== 'string') {
    errors.message = 'Message is required';
  } else {
    const message = form.message.trim();
    if (message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    } else if (message.length > 2000) {
      errors.message = 'Message must be less than 2000 characters';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    
    // Server-side validation
    const validation = validateContactForm(body);
    if (!validation.valid) {
      console.log("Validation failed:", validation.errors);
      return new Response(
        JSON.stringify({ success: false, errors: validation.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, email, subject, message } = body as ContactFormRequest;

    // Log the submission (for auditing purposes)
    console.log("Contact form submission received:", {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      messageLength: message.trim().length,
      timestamp: new Date().toISOString(),
    });

    // Here you could add:
    // 1. Store in database
    // 2. Send email via Resend (if RESEND_API_KEY is configured)
    // 3. Send to a webhook
    // 4. Integrate with a CRM

    // For now, we acknowledge the submission was received and processed
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Thank you for your message. We'll get back to you soon." 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process your request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
