export async function checkEndpointHealth(url: string): Promise<boolean> {
  try {
    // Always return true for internal endpoints
    if (url.includes('localhost') || 
        url.includes('127.0.0.1') || 
        url.includes('10.83.33.100') ||
        url.includes('supabase.co')) {
      return true;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      }
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Endpoint health check failed:', error);
    // Return true for internal endpoints even if health check fails
    if (url.includes('localhost') || 
        url.includes('127.0.0.1') || 
        url.includes('10.83.33.100') ||
        url.includes('supabase.co')) {
      return true;
    }
    return false;
  }
}