const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
};

export const response = {
  ok: (data: unknown, statusCode = 200) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({ success: true, data }),
  }),
  error: (message: string, statusCode = 400) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({ success: false, error: message }),
  }),
};