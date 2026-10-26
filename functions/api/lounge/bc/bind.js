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

  return new Response(`16
[[5,["noop"]]
]
34
[[6,["onSetDiscoveryDeviceId"]]
]`, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    }
  });
}
