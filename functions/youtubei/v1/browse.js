import channels from '../../../data/channels.json';

export async function onRequest(context) {
    const url = new URL(context.request.url);

    let body = {};

    if (context.request.method === "POST") {
        body = await context.request.json().catch(() => ({}));
    } else {
        body.browseId = url.searchParams.get("browseId");
        body["max-results"] = url.searchParams.get("max-results");
    }

    const browseId = body.browseId || "FEwhat_to_watch";
    var browseName = "Popular"
    const requestedMax = parseInt(body["max-results"] || 25, 10);
    const maxResults = Number.isFinite(requestedMax)
        ? Math.max(1, Math.min(requestedMax, 25))
        : 25;

    let endpoint;
    let channelUploads = false;
    let playlist = false;

    if (browseId === "FEwhat_to_watch") {
        browseName = "What To Watch"
        endpoint = "https://inv.truehosting.net/api/v1/popular";

    } else if (browseId === "FEchannels") {
        return new Response(JSON.stringify(channels), {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-store"
            }
        });

    } else if (browseId === "FEtopics") {
        browseName = "Topics"
        endpoint =
            "https://inv.truehosting.net/api/v1/search?q=xbox%20before:2015";

    } else if (browseId.startsWith("UC")) {
        browseName = "Uploads"
        endpoint =
            `https://inv.truehosting.net/api/v1/channels/${encodeURIComponent(browseId)}`;

        channelUploads = true;

    } else if (browseId.startsWith("PL") || browseId.startsWith("FL") || browseId.startsWith("OL") || browseId.startsWith("UU")) {
        browseName = "videos in current playlist - Topic"
        endpoint =
            `https://inv.truehosting.net/api/v1/playlists/${encodeURIComponent(browseId)}`;

        playlist = true;

    } else {
        browseName = "Unknown BrowseId"
        endpoint = "https://inv.truehosting.net/api/v1/popular";
    }

    const jsonResponse = (data, status = 200) => {
        return new Response(JSON.stringify(data), {
            status,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-store"
            }
        });
    };

    const errorResponse = (message, status = 502) => {
        return jsonResponse({
            error: message,
            contents: {
                sectionListRenderer: {
                    contents: [{
                        shelfRenderer: {
                            title: {
                                runs: [{
                                    text: message
                                }]
                            },
                            content: {
                                horizontalListRenderer: {
                                    items: []
                                }
                            }
                        }
                    }]
                }
            }
        }, status);
    };

    try {
        const response = await fetch(endpoint, {
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            return errorResponse(
                `Invidious request failed with status ${response.status}`,
                200
            );
        }

        const data = await response.json();

        let source;

        if (channelUploads) {
            source =
                data.latestVideos ||
                data.videos ||
                [];

        } else if (playlist) {
            source = data.videos || [];

        } else {
            source = data;
        }

        if (!Array.isArray(source)) {
            source = [];
        }

        const videos = source
            .filter(item =>
                item &&
                (
                    item.type === "video" ||
                    item.videoId ||
                    item.id
                )
            )
            .slice(0, maxResults);

        const contents = videos.map(video => {
            const videoId =
                video.videoId ||
                video.id ||
                "";

            const title =
                typeof video.title === "string"
                    ? video.title
                    : "";

            const author =
                typeof video.author === "string"
                    ? video.author
                    : "";

            let views =
                video.viewCount ??
                video.views ??
                0;

            if (typeof views === "string") {
                views = parseInt(
                    views.replace(/,/g, ""),
                    10
                );
            }

            if (!Number.isFinite(views)) {
                views = 0;
            }

            const published =
                video.publishedText ||
                video.publishedTimeText ||
                "";

            const thumbnail =
                video.videoThumbnails?.find(
                    t =>
                        t.quality === "medium" ||
                        t.quality === "high"
                ) ||
                video.videoThumbnails?.[0];

            const thumbnailUrl =
                thumbnail?.url ||
                `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

            const channelId =
                video.authorId ||
                video.ucid ||
                (channelUploads ? browseId : "");

            const channelThumbnail =
                channelUploads || playlist
                    ? (
                        data.authorThumbnails?.find(
                            t => t.width >= 88
                        ) ||
                        data.authorThumbnails?.[0]
                    )
                    : null;

            const renderer = {
                videoId,

                thumbnail: {
                    thumbnails: [{
                        url: thumbnailUrl,
                        width: thumbnail?.width || 480,
                        height: thumbnail?.height || 360
                    }]
                },

                title: {
                    runs: [{
                        text: title
                    }],
                    accessibility: {
                        accessibilityData: {
                            label: title
                        }
                    }
                },

                shortBylineText: {
                    runs: [{
                        text: author,
                        ...(channelId ? {
                            navigationEndpoint: {
                                browseEndpoint: {
                                    browseId: channelId
                                }
                            }
                        } : {})
                    }]
                },

                publishedTimeText: {
                    runs: [{
                        text: published
                    }]
                },

                viewCountText: {
                    runs: [{
                        text: views.toLocaleString("en-US") + " views"
                    }]
                },

                navigationEndpoint: {
                    watchEndpoint: {
                        videoId
                    }
                }
            };

            if (channelThumbnail?.url) {
                renderer.channelThumbnail = {
                    thumbnails: [{
                        url: channelThumbnail.url,
                        width: channelThumbnail.width || 88,
                        height: channelThumbnail.height || 88
                    }]
                };
            }

            return {
                gridVideoRenderer: renderer
            };
        });

        return jsonResponse({
            contents: {
                sectionListRenderer: {
                    contents: [{
                        shelfRenderer: {
                            title: {
                                runs: [{
                                    text: browseName
                                }]
                            },
                            content: {
                                horizontalListRenderer: {
                                    items: contents
                                }
                            }
                        }
                    }]
                }
            }
        });

    } catch (error) {
        return errorResponse(
            error?.message || "An unexpected error occurred",
            502
        );
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    });
}
