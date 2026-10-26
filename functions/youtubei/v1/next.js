export async function onRequest(context) {
  const { request } = context;
  const method = request.method;
body = {};
    if (context.request.method === "POST") {
        body = await context.request.json().catch(() => ({}));
    } else {
        body.videoId = url.searchParams.get("browseId");
    }
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }
try {
  var video = await fetch("https://www.invidious.frantisekfiala.eu/api/v1/videos/" + body.videoId);
var videojson = await video.json();
if (!video.ok) {
  return Response.json({
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
                      "title": {
                        "runs": [
                          {
                            "text": videojson.error
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
}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    }
  });
}
  
  return Response.json({
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
                      "title": {
                        "runs": [
                          {
                            "text": videojson.title
                          }
                        ]
                      },
                      "description": {
                        "simpleText": "Sample video description"
                      },
                      "dateText": {
                        "runs": [
                          {
                            "text": videojson.publishedText
                          }
                        ]
                      },
                      "shortViewCountText": {
                        "runs": [
                          {
                            "text": videojson.viewCount + " views"
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
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }
}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    }
  });
} catch(e) {
return new Response(e, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    }
  });
}
}
