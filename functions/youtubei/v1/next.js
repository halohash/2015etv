
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
            body = await request.json().catch(() => ({}));
        } else {
            body.videoId =
                url.searchParams.get("videoId") ||
                url.searchParams.get("browseId");
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

        let videojson = {};

        try {
            videojson = await response.json();
        } catch {
            videojson = {};
        }

        const isError = !response.ok;

        const isBlocked =
            videojson.error ===
            "This helps protect our community. Learn more";

        if (isBlocked) {
            const message =
                "Sorry, This video isn't available right now. Please try again later.";

            return Response.json({
                error: {
                    code: 503,
                    message,
                    errors: [
                        {
                            message,
                            domain: "global",
                            reason: "videoFailed"
                        }
                    ],
                    status: "VIDEO_FAILED"
                }
            }, {
                status: 503,
                headers
            });
        }

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

        const vidAuthor = isError
            ? "System"
            : (videojson.author || "Unknown");

        const defaultProfile =
            "https://s.ytimg.com/yts/img/silhouette250-vflEqxKg9.png";

        const vidProfile = isError
            ? defaultProfile
            : (
                videojson.authorThumbnails?.[0]?.url ||
                defaultProfile
            );

        const authorId = isError
            ? ""
            : (videojson.authorId || "");

        const canonicalBaseUrl = isError
            ? "/@blank"
            : (
                videojson.authorUrl ||
                (videojson.author ? "/@" + videojson.author : "/@blank")
            );

        const ownerTitle = isError ? "blank" : vidAuthor;

        const ownerThumbnails = [48, 88, 176].map(size => ({
            url: vidProfile,
            width: size,
            height: size
        }));

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
                                        { text: vidAuthor }
                                    ]
                                },
                                badges: [],
                                likeStatus: "INDIFFERENT"
                            }
                        }
                    ]
                }
            },
            {
                itemSectionRenderer: {
                    contents: [
                        {
                            videoOwnerRenderer: {
                                thumbnail: {
                                    thumbnails: ownerThumbnails
                                },
                                title: {
                                    runs: [
                                        { text: ownerTitle }
                                    ]
                                },
                                navigationEndpoint: {
                                    clickTrackingParams: "",
                                    browseEndpoint: {
                                        browseId: authorId,
                                        canonicalBaseUrl
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ];

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
