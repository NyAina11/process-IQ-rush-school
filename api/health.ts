export default function handler(req: any, res: any) {
    res.status(200).json({
        status: 'ok',
        message: 'Vercel API handler is reachable',
        url: req.url,
        query: req.query,
        env: {
            has_airtable_key: !!(process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_API_TOKEN),
            node_env: process.env.NODE_ENV
        }
    });
}
