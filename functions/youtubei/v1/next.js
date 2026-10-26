export async function onRequest(context) {
  const { request } = context;
  const method = request.method;

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

  return Response.json(`
{
  "currentVideoEndpoint": {},
  "contents": {
    "singleColumnWatchNextResults": {
      "autoplay": {
        "autoplay": {}
      },
      "playlist": {
        "playlist": {}
      },
      "endScreen": {
        "endScreen": {}
      },
      "pivot": {
        "pivot": {}
      },
      "results": {
        "results": {
          "contents": [
            {
              "itemSectionRenderer": {
                "contents": [
                  {
                    "videoMetadataRenderer": {
                      "videoId": "dQw4w9WgXcQ",
                      "title": {
                        "runs": [
                          {
                            "text": "merely an example"
                          }
                        ]
                      },
                      "description": {
                        "simpleText": "Sample video description"
                      },
                      "dateText": {
                        "runs": [
                          {
                            "text": "9 years ago"
                          }
                        ]
                      },
                      "shortViewCountText": {
                        "runs": [
                          {
                            "text": "0 views"
                          }
                        ]
                      },
                      "shortBylineText": {
                        "runs": [
                          {
                            "text": "Creator Channel"
                          }
                        ]
                      },
                      "badges": [],
                      "likeStatus": "INDIFFERENT"
                    }
                  },
                  {
                    "videoOwnerRenderer": {
                      "title": {
                        "runs": [
                          {
                            "text": "Creator Channel"
                          }
                        ]
                      },
                      "thumbnail": {
                        "thumbnails": [
                          {
                            "url": "https://yt3.ggpht.com/example=s88-c-k-c0x00ffffff-no-rj",
                            "width": 88,
                            "height": 88
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }
}`, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    }
  });
}
