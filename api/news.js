export default async function handler(req, res) {
  try {
    const targetUrl = `https://finance.yahoo.com/rss/topstories?ts=${Date.now()}`;
    
    // Fetch directly from Yahoo without CORS issues
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Yahoo API error' });
    }
    
    const xmlText = await response.text();
    
    // Allow CORS and set cache headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).send(xmlText);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
