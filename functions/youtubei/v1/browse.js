
import channels from '../../../data/channels.json';
import other from '../../../data/other.json';

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
    let browseName = "Popular";

    const requestedMax = parseInt(body["max-results"] || 25, 10);
    const maxResults = Number.isFinite(requestedMax)
        ? Math.max(1, Math.min(requestedMax, 25))
        : 25;

    let endpoint;
    let channelUploads = false;
    let playlist = false;

    const jsonResponse = (data, status = 200) => {
        return new Response(JSON.stringify(data), {
            status,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
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
                                    items: [
                                        {
                    gridChannelRenderer: {
                      thumbnail: {
                        thumbnails: [
                          {
                            url: "https://dingusline.pages.dev/static/home.svg",
                            width: 480,
                            height: 360
                          }
                        ]
                      },
                      title: {
                        runs: [
                          {
                            text: "Home"
                          }
                        ],
                        accessibility: {
                          accessibilityData: {
                            label: "Home"
                          }
                        }
                      },
                      publishedTimeText: {
                        runs: [
                          {
                            text: "ass"
                          }
                        ]
                      },
                      viewCountText: {
                        runs: [
                          {
                            text: "0 views"
                          }
                        ]
                      },
                      navigationEndpoint: {
                        browseEndpoint: {
                          browseId: "FEwhat_to_watch"
                        }
                      },
                      shortBylineText: {
                        runs: [
                          {
                            text: "ass",
                            navigationEndpoint: {
                              browseEndpoint: {
                                browseId: "UCass"
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                                    ]
                                }
                            }
                        }
                    }]
                }
            }
        }, status);
    };

    function getHeader(data) {
        const profile =
            data.authorThumbnails?.find(t => t.width >= 88) ||
            data.authorThumbnails?.[0];

        const banner =
            data.authorBanners?.find(t => t.width >= 1024) ||
            data.authorBanners?.[0];

        const renderer = {
            title: data.author || data.authorName || "",
            avatar: {
                thumbnails: profile?.url ? [{
                    url: profile.url,
                    width: profile.width || 88,
                    height: profile.height || 88
                }] : []
            }
        };

        if (banner?.url) {
            renderer.banner = {
                thumbnails: [{
                    url: banner.url.replace(
                        "w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
                        "w1280"
                    ),
                    width: 1280,
                    height: 720
                }]
            };
        }

        return {
            header: {
                tvChannelHeaderRenderer: renderer
            }
        };
    }

    function yttime(secs) {
        const lengthSeconds = Number(secs) || 0;
        const minutes = Math.floor(lengthSeconds / 60);
        const seconds = String(lengthSeconds % 60).padStart(2, "0");

        return `${minutes}:${seconds}`;
    }

    // Support older YTTV apps.
    if (browseId === "FEwhat_to_watch" || browseId === "default") {
        browseName = "What To Watch";
        endpoint = "https://inv.truehosting.net/api/v1/popular";

    } else if (browseId === "FEchannels") {
        return jsonResponse(channels);

    } else if (browseId === "FEother") {
        return jsonResponse(other);

    } else if (browseId === "FEtopics") {
        browseName = "Topics";
        endpoint =
            "https://inv.truehosting.net/api/v1/search?q=xbox%20before:2015";

    } else if (browseId.startsWith("UC")) {
        browseName = "Uploads";
        endpoint =
            `https://inv.truehosting.net/api/v1/channels/${encodeURIComponent(browseId)}`;

        channelUploads = true;

    } else if (
        browseId.startsWith("PL") ||
        browseId.startsWith("FL") ||
        browseId.startsWith("OL") ||
        browseId.startsWith("UU")
    ) {
        browseName = "Playlist"
        endpoint =
            `https://inv.truehosting.net/api/v1/playlists/${encodeURIComponent(browseId)}`;

        playlist = true;

    } else {
        browseName = "Unknown browseId";
        endpoint = "https://inv.truehosting.net/api/v1/popular";
    }

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

if (playlist) {
    browseName =
        (typeof data.title === "string" && data.title) ||
        (typeof data.playlist?.title === "string" && data.playlist.title) ||
        "Playlist";
}

        let source;

        if (channelUploads) {
            source = data.latestVideos || data.videos || [];
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
                (item.videoId || item.id)
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
                views = parseInt(views.replace(/,/g, ""), 10);
            }

            if (!Number.isFinite(views)) {
                views = 0;
            }

            const published =
                video.publishedText ||
                video.publishedTimeText ||
                "";

            const thumbnail =
                video.videoThumbnails?.find(t =>
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
                        data.authorThumbnails?.find(t => t.width >= 88) ||
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
                        text: playlist
                            ? "Playlist"
                            : views.toLocaleString("en-US") + " views"
                    }]
                },

                lengthText: {
                    runs: [{
                        text: yttime(video.lengthSeconds || 0)
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

        const result = {};

        if (channelUploads) {
            Object.assign(result, getHeader(data));
        }

        result.contents = {
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
        };

        // Fetch playlists belonging to this channel.
        if (channelUploads) {
            let playlistData = [];

            const playlistsEndpoint =
                `https://inv.truehosting.net/api/v1/channels/${encodeURIComponent(browseId)}/playlists`;

            try {
                const playlistsResponse = await fetch(playlistsEndpoint, {
                    headers: {
                        "Accept": "application/json"
                    }
                });

                if (playlistsResponse.ok) {
                    const fetchedPlaylists = await playlistsResponse.json();

                    if (Array.isArray(fetchedPlaylists)) {
                        playlistData = fetchedPlaylists;
                    } else if (Array.isArray(fetchedPlaylists.playlists)) {
                        playlistData = fetchedPlaylists.playlists;
                    } else if (Array.isArray(fetchedPlaylists.playlists?.items)) {
                        playlistData = fetchedPlaylists.playlists.items;
                    }
                }
            } catch (playlistError) {
                playlistData = [];
            }

            const playlistItems = playlistData
                .filter(item => item && (item.playlistId || item.id))
                .slice(0, maxResults)
                .map(item => {
                    const playlistId =
                        item.playlistId ||
                        item.id;

                    const playlistTitle =
                        typeof item.title === "string"
                            ? item.title
                            : "";

                    const playlistAuthor =
                        item.author ||
                        data.author ||
                        data.authorName ||
                        "";

                    const playlistAuthorId =
                        item.authorId ||
                        item.ucid ||
                        browseId;

                    const rawCount =
                        item.videoCount ??
                        item.videosCount ??
                        item.video_count ??
                        -1;

                    const playlistThumbnail =
                        item.playlistThumbnail ||
                        item.thumbnailUrl ||
                        item.thumbnail?.url ||
                        (typeof item.thumbnail === "string"
                            ? item.thumbnail
                            : null) ||
                        item.videoThumbnails?.find(t =>
                            t.quality === "high" ||
                            t.quality === "medium"
                        )?.url ||
                        item.videoThumbnails?.[0]?.url ||
                        `http://inv.truehosting.net/vi/${playlistId}/hqdefault.jpg`;

                    const avatar =
                        data.authorThumbnails?.find(t => t.width >= 88) ||
                        data.authorThumbnails?.[0];

                    const playlistRenderer = {
                        videoId: playlistId,

                        thumbnail: {
                            thumbnails: [{
                                url: playlistThumbnail,
                                width: 480,
                                height: 360
                            }]
                        },

                        title: {
                            runs: [{
                                text: playlistTitle
                            }],
                            accessibility: {
                                accessibilityData: {
                                    label: playlistTitle
                                }
                            }
                        },

                        shortBylineText: {
                            runs: [{
                                text: playlistAuthor,
                                navigationEndpoint: {
                                    browseEndpoint: {
                                        browseId: playlistAuthorId
                                    }
                                }
                            }]
                        },

                        publishedTimeText: {
                            runs: [{
                                text: item.publishedText ||
                                    item.publishedTimeText ||
                                    ""
                            }]
                        },

                        viewCountText: {
                            runs: [{
                                text: `${rawCount} videos`
                            }]
                        },

                        lengthText: {
                            runs: [{
                                text: "Playlist"
                            }]
                        },

                        navigationEndpoint: {
                            browseEndpoint: {
                                browseId: playlistId
                            }
                        }
                    };

                    if (avatar?.url) {
                        playlistRenderer.channelThumbnail = {
                            thumbnails: [{
                                url: avatar.url,
                                width: 100,
                                height: 100
                            }]
                        };
                    }

                    return {
                        gridVideoRenderer: playlistRenderer
                    };
                });

            if (playlistItems.length > 0) {
                result.contents.sectionListRenderer.contents.push({
                    shelfRenderer: {
                        title: {
                            runs: [{
                                text: "Playlists"
                            }]
                        },
                        content: {
                            horizontalListRenderer: {
                                items: playlistItems
                            }
                        }
                    }
                });
            }
        }

        return jsonResponse(result);

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
