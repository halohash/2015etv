
export async function onRequest(context) {
    const { request } = context;
    const method = request.method;
    const url = new URL(request.url);

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    };

    if (method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers
        });
    }

    try {
        let body = {};

        if (method === "POST") {
            body = await request.json();
        } else {
            body.videoId = url.searchParams.get("browseId");
        }

        const videoId = body.videoId;

        if (!videoId) {
            return Response.json({
                error: "Missing videoId or browseId"
            }, {
                status: 400,
                headers
            });
        }

        const response = await fetch(
            "https://www.invidious.frantisekfiala.eu/api/v1/videos/" +
            encodeURIComponent(videoId)
        );

        let videojson;

        try {
            videojson = await response.json();
        } catch {
            videojson = {};
        }

        const isError = !response.ok;

        const title = isError
            ? (videojson.error || "Video unavailable")
            : (videojson.title || "Untitled video");

        const description = isError
            ? "Sample video description"
            : (videojson.description || "Sample video description");

        const publishedText = isError
            ? "9 years ago"
            : (videojson.publishedText || "");

        const viewCount = isError
            ? "0"
            : String(videojson.viewCount ?? 0);

        const contents = [
            {
                itemSectionRenderer: {
                    contents: [
                        {
                            videoMetadataRenderer: {
                                title: {
                                    runs: [
                                        { text: title }
                                    ]
                                },
                                description: {
                                    simpleText: description
                                },
                                dateText: {
                                    runs: [
                                        { text: publishedText }
                                    ]
                                },
                                shortViewCountText: {
                                    runs: [
                                        { text: viewCount + " views" }
                                    ]
                                },
                                shortBylineText: {
                                    runs: [
                                        { text: "Creator Channel" }
                                    ]
                                },
                                badges: [],
                                likeStatus: "INDIFFERENT"
                            }
                        }
                    ]
                }
            }
        ];

        if (isError) {
            contents[0].itemSectionRenderer.contents.push({
                videoOwnerRenderer: {
                    title: {
                        runs: [
                            { text: "Creator Channel" }
                        ]
                    },
                    thumbnail: {
                        thumbnails: [
                            {
                                url: "https://yt3.ggpht.com/example=s88-c-k-c0x00ffffff-no-rj",
                                width: 88,
                                height: 88
                            }
                        ]
                    }
                }
            });
        }

        return Response.json({
            currentVideoEndpoint: {},
            contents: {
                singleColumnWatchNextResults: {
                    autoplay: {
                        autoplay: {}
                    },
                    playlist: {
                        playlist: {}
                    },
                    endScreen: {
                        endScreen: {}
                    },
                    pivot: {
                        pivot: {}
                    },
                    results: {
                        results: {
                            contents
                        }
                    }
                }
            }
        }, {
            status: 200,
            headers
        });

    } catch (e) {
        return Response.json({
            error: e.message || String(e)
        }, {
            status: 500,
            headers
        });
    }
}
