
export async function onRequest(context) {
    const { request } = context;
    const method = request.method;
    const url = new URL(request.url);

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
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
            ).replace("=s32-c-k-c0x00ffffff-no-rj", "=s512");

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
                                    thumbnails: [
                                        {
                                            url: vidProfile,
                                            width: 48,
                                            height: 48
                                        }
                                    ]
                                },
                                title: {
                                    runs: [
                                        {
                                            text: ownerTitle
                                        }
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

        function formatDuration(seconds) {
            seconds = Number(seconds) || 0;

            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;

            if (hours > 0) {
                return hours + ":" +
                    String(minutes).padStart(2, "0") + ":" +
                    String(secs).padStart(2, "0");
            }

            return minutes + ":" +
                String(secs).padStart(2, "0");
        }

        const recommendedVideos =
            !isError && Array.isArray(videojson.recommendedVideos)
                ? videojson.recommendedVideos
                : [];

        if (recommendedVideos.length > 0) {
            contents.push({
                itemSectionRenderer: {
                    contents: recommendedVideos.map(video => {
                        const id = video.videoId || "";
                        const videoTitle = video.title || "Untitled video";
                        const author = video.author || "";

                        const thumbnail =
                            video.videoThumbnails?.at(-1)?.url ||
                            (
                                "https://i.ytimg.com/vi/" +
                                encodeURIComponent(id) +
                                "/hqdefault.jpg"
                            );

                        return {
                            compactVideoRenderer: {
                                videoId: id,

                                thumbnail: {
                                    thumbnails: [
                                        {
                                            url: thumbnail,
                                            width: 480,
                                            height: 360
                                        }
                                    ]
                                },

                                title: {
                                    runs: [
                                        {
                                            text: videoTitle
                                        }
                                    ],
                                    accessibility: {
                                        accessibilityData: {
                                            label: videoTitle
                                        }
                                    }
                                },

                                shortBylineText: {
                                    runs: [
                                        {
                                            text: author,
                                            navigationEndpoint: {
                                                browseEndpoint: {
                                                    browseId: video.authorId || "",
                                                    canonicalBaseUrl: video.authorUrl || ""
                                                }
                                            }
                                        }
                                    ]
                                },

                                viewCountText: {
                                    simpleText:
                                        (Number(video.viewCount) || 0).toLocaleString() +
                                        " views"
                                },

                                publishedTimeText: {
                                    simpleText: video.publishedText || ""
                                },

                                lengthText: {
                                    simpleText: formatDuration(video.lengthSeconds)
                                },

                                navigationEndpoint: {
                                    watchEndpoint: {
                                        videoId: id
                                    }
                                }
                            }
                        };
                    })
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
