export async function checkEndpointHealth(url: string): Promise<boolean> {
  try {
    // Skip health check for internal and trusted endpoints
    if (url.includes('localhost') || 
        url.includes('127.0.0.1') || 
        url.includes('10.83.33.100') ||
        url.includes('supabase.co') ||
        url.includes('fkcloud.in')) {
      return true;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
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
    } catch (fetchError) {
      console.error('Health check fetch error:', fetchError);
      return false;
    }
  } catch (error) {
    console.error('Health check error:', error);
    // Return true for trusted endpoints even if health check fails
    if (url.includes('localhost') || 
        url.includes('127.0.0.1') || 
        url.includes('10.83.33.100') ||
        url.includes('supabase.co') ||
        url.includes('fkcloud.in')) {
      return true;
    }
    return false;
  }
}