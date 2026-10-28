
export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
    };

    let body = {};

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                ...headers,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        });
    }

    if (request.method !== "GET" && request.method !== "POST") {
        return new Response(JSON.stringify({
            error: "Method not allowed"
        }), {
            status: 405,
            headers: {
                ...headers,
                "Allow": "GET, POST, OPTIONS"
            }
        });
    }

    try {
        if (request.method === "POST") {
            body = await request.json().catch(() => ({}));
        }

        const query =
            body.query ||
            url.searchParams.get("query") ||
            "gorillaz";

        const requestedMax =
            body["max-results"] ||
            url.searchParams.get("max-results") ||
            25;

        const parsedMax = parseInt(requestedMax, 10);

        const maxResults = Number.isFinite(parsedMax)
            ? Math.max(1, Math.min(parsedMax, 25))
            : 25;

        const endpoint =
            "https://inv.truehosting.net/api/v1/search?q=" +
            encodeURIComponent(query);

        const response = await fetch(endpoint, {
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            return new Response(JSON.stringify({
                error: "Invidious request failed",
                status: response.status
            }), {
                status: 502,
                headers
            });
        }

        const data = await response.json();

        const source = Array.isArray(data)
            ? data
            : [];

        const results = source
            .filter(item =>
                item &&
                (
                    item.type === "channel"
                        ? !!(item.authorId || item.channelId || item.id)
                        : !!(item.videoId || item.id || item.liveNow === false)
                )
            )
            .slice(0, maxResults);

        const contents = results.map(item => {
            const title =
                typeof item.title === "string"
                    ? item.title
                    : typeof item.author === "string"
                        ? item.author
                        : "";

            const isChannel = item.type === "channel";

            if (isChannel) {
                const channelId =
                    item.authorId ||
                    item.channelId ||
                    item.id ||
                    "";

                const thumbnail =
                    item.authorThumbnails?.find(
                        image => image.width >= 120
                    ) ||
                    item.authorThumbnails?.[0] ||
                    item.thumbnails?.[0];

                const thumbnailUrl =
                    thumbnail?.url ||
                    thumbnail?.url?.url ||
                    "";

                let subscribers =
                    item.subCount ??
                    item.subscriberCount ??
                    item.subscribers;

                let subscriberText = "";

                if (typeof subscribers === "number") {
                    subscriberText =
                        subscribers.toLocaleString("en-US") +
                        " subscribers";
                } else if (typeof subscribers === "string") {
                    subscriberText = subscribers;
                }

                const channelRenderer = {
                    thumbnail: {
                        thumbnails: [
                            {
                                url: thumbnailUrl,
                                width: thumbnail?.width || 480,
                                height: thumbnail?.height || 360
                            }
                        ]
                    },

                    title: {
                        runs: [
                            {
                                text: title
                            }
                        ],
                        accessibility: {
                            accessibilityData: {
                                label: title
                            }
                        }
                    },

                    navigationEndpoint: {
                        browseEndpoint: {
                            browseId: channelId
                        }
                    }
                };

                if (subscriberText) {
                    channelRenderer.videoCountText = {
                        runs: [
                            {
                                text: subscriberText
                            }
                        ]
                    };
                }

                return {
                    gridChannelRenderer: channelRenderer
                };
            }

            const videoId =
                item.videoId ||
                item.id ||
                "";

            const author =
                typeof item.author === "string"
                    ? item.author
                    : "";

            let views =
                item.viewCount ??
                item.views ??
                0;

            if (typeof views === "string") {
                const parsedViews = parseInt(
                    views.replace(/,/g, ""),
                    10
                );

                views = Number.isFinite(parsedViews)
                    ? parsedViews
                    : 0;
            }

            if (typeof views !== "number" || !Number.isFinite(views)) {
                views = 0;
            }

            const viewText =
                typeof item.viewCount === "string" &&
                /views?/i.test(item.viewCount)
                    ? item.viewCount
                    : views.toLocaleString("en-US") + " views";

            const published =
                item.publishedText ||
                item.publishedTimeText ||
                "";

            const thumbnail =
                item.videoThumbnails?.find(
                    image =>
                        image.quality === "medium" ||
                        image.quality === "high"
                ) ||
                item.videoThumbnails?.[0] ||
                item.thumbnails?.[0];

            const thumbnailUrl =
                thumbnail?.url ||
                "https://i.ytimg.com/vi/" +
                videoId +
                "/hqdefault.jpg";

            const channelThumbnail =
                item.authorThumbnails?.find(
                    image => image.width >= 88
                ) ||
                item.authorThumbnails?.[0];
function yttime(secs) {
const lengthSeconds = secs;

const minutes = Math.floor(lengthSeconds / 60);
const seconds = String(lengthSeconds % 60).padStart(2, '0');

const formattedTime = `${minutes}:${seconds}`; 
return formattedTime
}
const time = video.lengthSeconds || 0;
            return {
                videoRenderer: {
                    videoId,

                    thumbnail: {
                        thumbnails: [
                            {
                                url: thumbnailUrl,
                                width: thumbnail?.width || 480,
                                height: thumbnail?.height || 360
                            }
                        ]
                    },

                    channelThumbnail: {
                        thumbnails: [
                            {
                                url:
                                    channelThumbnail?.url ||
                                    "https://file.garden/aUYIWVAKvQxCBY-_/database/images/profilepuckett.png",
                                width: channelThumbnail?.width || 88,
                                height: channelThumbnail?.height || 88
                            }
                        ]
                    },

                    shortBylineText: {
                        runs: [
                            {
                                text: author
                            }
                        ]
                    },

                    publishedTimeText: {
                        runs: [
                            {
                                text: published
                            }
                        ]
                    },

                    viewCountText: {
                        runs: [
                            {
                                text: viewText
                            }
                        ]
                    },

                    title: {
                        runs: [
                            {
                                text: title
                            }
                        ],
                        accessibility: {
                            accessibilityData: {
                                label: title
                            }
                        }
                    },
lengthText:{
                                                                runs:[
                                                                   {
                                                                      text: yttime(time)
                                                                   }
                                                                ]
                                                             },
                    navigationEndpoint: {
                        watchEndpoint: {
                            videoId
                        }
                    }
                }
            };
        });

        return new Response(JSON.stringify({
            estimatedResults: String(source.length),
            contents: {
                sectionListRenderer: {
                    contents: [
                        {
                            itemSectionRenderer: {
                                contents
                            }
                        }
                    ]
                }
            }
        }), {
            status: 200,
            headers
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: error.message || "Internal server error"
        }), {
            status: 500,
            headers
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Cache-Control": "no-store"
        }
    });
}
