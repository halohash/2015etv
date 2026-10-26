export async function onRequest(context) {
  const { request } = context;
  const formData = await request.formData();
  const method = request.method;
var time = Date.now();
var expiration = time + 3600000;
var screenId = formData.get('screen_ids');
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  return Response.json({"screens":[{"screenId":screenId,"refreshIntervalInMillis":1123200000,"remoteRefreshIntervalMs":79200000,"refreshIntervalMs":1123200000,"loungeTokenLifespanMs":1209600000,"loungeToken":"KIdnam-EDfingERTunGsahuREmeMVKHc-P5gn3cg7ejA7wfXflB3RclhY_WcTBY2guGmemtn-bmOga-DEK3VDVW6m6qXKe7OUjGqvGhNV5xaefWAPwS8Ddw","remoteRefreshIntervalInMillis":79200000,"expiration":expiration}]}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    }
  });
}
