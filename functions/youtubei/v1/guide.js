import guide from '../../../data/guide.json';
import guidechannels from '../../../data/guidechannels.json';


export async function onRequest(context) {
  const { request } = context;
  const method = request.method;
for (let channel of guidechannels) {
    guide.items[1].guideSectionRenderer.items.push(channel)
}
  // Handle CORS preflight requests if needed
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  return Response.json(guide, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    }
  });
}
