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
  website?: string; // Honeypot field
}

// Simple in-memory rate limiting (resets on function restart)
// For production, consider using Supabase storage or Redis
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const MAX_REQUESTS_PER_WINDOW = 5;

function getClientIP(req: Request): string {
  // Try various headers that might contain the client IP
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  // Fallback - use a hash of user-agent as identifier
  const userAgent = req.headers.get("user-agent") || "unknown";
  return `ua-${hashString(userAgent)}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function checkRateLimit(clientIP: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);

  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

// Server-side validation
function validateContactForm(data: unknown): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: { form: 'Invalid form data' } };
  }

  const form = data as Record<string, unknown>;

  // Honeypot check - if website field is filled, it's likely a bot
  if (form.website && typeof form.website === 'string' && form.website.trim().length > 0) {
    console.log("Honeypot triggered - likely bot submission");
    // Return success to not alert the bot, but don't process
    return { valid: false, errors: { _honeypot: 'Bot detected' } };
  }

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

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP);
  
  if (!rateLimit.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        error: "Too many requests. Please try again later.",
        retryAfter: rateLimit.retryAfter 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfter)
        } 
      }
    );
  }

  try {
    const body = await req.json();
    
    // Server-side validation (includes honeypot check)
    const validation = validateContactForm(body);
    
    // Special handling for honeypot - return success to not alert bots
    if (validation.errors._honeypot) {
      console.log("Silently rejecting bot submission");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Thank you for your message. We'll get back to you soon." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
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
      clientIP: clientIP,
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
