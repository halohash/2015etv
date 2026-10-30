import guide from '../../../data/guide.json';
import guidechannels from '../../../data/guidechannels.json';


export async function onRequest(context) {
  const { request } = context;
  const method = request.method;
for (let channel of guidechannels) {
    guide.items[1].guideSectionRenderer.items.push(channel)
}
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
      },
    });
  }

  return Response.json(guide, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    }
  });
}
