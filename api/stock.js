export default async function handler(req, res) {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

  try {
    const cleanSymbol = symbol.toUpperCase().trim();
    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSymbol}?ts=${Date.now()}`;
    
    // Fetch directly from Yahoo without CORS issues because this runs on the server
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Yahoo API error' });
    }
    
    const data = await response.json();
    
    // Allow CORS and set cache headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
