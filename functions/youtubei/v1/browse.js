
import channels from '../../../data/channels.json';
import other from '../../../data/other.json';


var separateRows = true;

// ADD CHANNEL IDS TO THIS LIST
const HOME_CHANNELS = [
    "UCDVYQ4Zhbm3S2dlz7P1GBDg",
    "UCUjlPym2cxucUVPdE8kYOOg",
    "UCS-WzPVpAAli-1IfEG2lN8A",
    "UC-2Y8dQb0S6DtpxNgAKoJKA"
];

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
    const isHomeFeed =
        browseId === "FEwhat_to_watch" ||
        browseId === "FE_what_to_watch" ||
        browseId === "default";

    let browseName = "Popular";
    let endpoint;
    let channelUploads = false;
    let playlist = false;

    const requestedMax = parseInt(body["max-results"] || 25, 10);
    const maxResults = Number.isFinite(requestedMax)
        ? Math.max(1, Math.min(requestedMax, 25))
        : 25;

    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Cache-Control": "no-store"
    };

    const jsonResponse = (data, status = 200) =>
        new Response(JSON.stringify(data), { status, headers });

    const errorResponse = (message, status = 502) =>
        jsonResponse({
            error: message,
            contents: {
                sectionListRenderer: {
                    contents: [{
                        shelfRenderer: {
                            title: {
                                runs: [{ text: message }]
                            },
                            content: {
                                horizontalListRenderer: {
                                    items: [{
                                        gridChannelRenderer: {
                                            thumbnail: {
                                                thumbnails: [{
                                                    url: "https://dingusline.pages.dev/static/home_border.svg",
                                                    width: 480,
                                                    height: 360
                                                }]
                                            },
                                            title: {
                                                runs: [{ text: "Home" }],
                                                accessibility: {
                                                    accessibilityData: {
                                                        label: "Home"
                                                    }
                                                }
                                            },
                                            publishedTimeText: {
                                                runs: [{ text: "0 seconds ago" }]
                                            },
                                            viewCountText: {
                                                runs: [{ text: "0 views" }]
                                            },
                                            navigationEndpoint: {
                                                browseEndpoint: {
                                                    browseId: "FEwhat_to_watch"
                                                }
                                            }
                                        }
                                    }]
                                }
                            }
                        }
                    }]
                }
            }
        }, status);

    function createShelf(title, items) {
        return {
            shelfRenderer: {
                title: {
                    runs: [{ text: title }]
                },
                content: {
                    horizontalListRenderer: {
                        items
                    }
                }
            }
        };
    }

    function yttime(secs) {
        const lengthSeconds = Number(secs) || 0;
        const minutes = Math.floor(lengthSeconds / 60);
        const seconds = String(lengthSeconds % 60).padStart(2, "0");

        return `${minutes}:${seconds}`;
    }

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

    function makeVideoRenderer(video, channelId = "") {
        const videoId = video.videoId || video.id || "";
        const title = typeof video.title === "string"
            ? video.title
            : "";

        const author = video.author || "";
        const authorId = video.authorId || video.ucid || channelId;

        let views = video.viewCount ?? video.views ?? 0;

        if (typeof views === "string") {
            views = parseInt(views.replace(/,/g, ""), 10);
        }

        if (!Number.isFinite(views)) {
            views = 0;
        }

        const thumbnail =
            video.videoThumbnails?.find(t =>
                t.quality === "medium" || t.quality === "high"
            ) ||
            video.videoThumbnails?.[0];

        const renderer = {
            videoId,

            thumbnail: {
                thumbnails: [{
                    url: thumbnail?.url ||
                        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    width: thumbnail?.width || 480,
                    height: thumbnail?.height || 360
                }]
            },

            title: {
                runs: [{ text: title }],
                accessibility: {
                    accessibilityData: {
                        label: title
                    }
                }
            },

            shortBylineText: {
                runs: [{
                    text: author,
                    ...(authorId ? {
                        navigationEndpoint: {
                            browseEndpoint: {
                                browseId: authorId
                            }
                        }
                    } : {})
                }]
            },

            publishedTimeText: {
                runs: [{
                    text: video.publishedText ||
                        video.publishedTimeText ||
                        ""
                }]
            },

            viewCountText: {
                runs: [{
                    text: views.toLocaleString("en-US") + " views"
                }]
            },

            lengthText: {
                runs: [{
                    text: yttime(video.lengthSeconds || 0)
                }]
            },

            navigationEndpoint: {
                watchEndpoint: { videoId }
            }
        };

        return { gridVideoRenderer: renderer };
    }

    function getChannelVideos(data) {
        const videos = data.latestVideos || data.videos || [];

        return Array.isArray(videos) ? videos : [];
    }

    
    if (browseId === "FEchannels") {
        return jsonResponse(channels);
    }

    if (browseId === "FEother") {
        return jsonResponse(other);
    }

    if (isHomeFeed) {
        browseName = "What To Watch";
        endpoint = "https://inv.truehosting.net/api/v1/popular";
    } else if (browseId === "FEtopics_gaming") {
        browseName = "Gaming";
        endpoint =
            "https://inv.truehosting.net/api/v1/trending?type=gaming";
    } else if (browseId === "FEtopics_movies") {
        browseName = "Movies & TV";
        endpoint =
            "https://inv.truehosting.net/api/v1/trending?type=movies&region=GB";
    } else if (browseId.startsWith("UC")) {
        browseName = "Uploads";
        endpoint =
            `https://inv.truehosting.net/api/v1/channels/${encodeURIComponent(browseId)}`;
        channelUploads = true;
    } else if (
        browseId.startsWith("PL") ||
        browseId.startsWith("FL") ||
        browseId.startsWith("OL") ||
        browseId.startsWith("UU") ||
        browseId.startsWith("RD")
    ) {
        browseName = "Playlist";
        endpoint =
            `https://inv.truehosting.net/api/v1/playlists/${encodeURIComponent(browseId)}`;
        playlist = true;
    } else {
        browseName = "Unknown browseId";
        endpoint = "https://inv.truehosting.net/api/v1/popular";
    }

    try {
        const result = {};
        const shelves = [];

        
        if (isHomeFeed) {
            const channelResults = await Promise.all(
                HOME_CHANNELS.map(async channelId => {
                    try {
                        const response = await fetch(
                            `https://inv.truehosting.net/api/v1/channels/${encodeURIComponent(channelId)}`,
                            {
                                headers: {
                                    "Accept": "application/json"
                                }
                            }
                        );

                        if (!response.ok) {
                            return {
                                channelId,
                                name: channelId,
                                videos: []
                            };
                        }

                        const data = await response.json();

                        return {
                            channelId,
                            name: data.author || data.authorName || channelId,
                            videos: getChannelVideos(data)
                                .filter(video => video && (video.videoId || video.id))
                                .slice(0, maxResults)
                        };
                    } catch (error) {
                        return {
                            channelId,
                            name: channelId,
                            videos: []
                        };
                    }
                })
            );

            for (const channel of channelResults) {
                channel.items = channel.videos.map(video =>
                    makeVideoRenderer(video, channel.channelId)
                );
            }

            if (separateRows) {
                for (const channel of channelResults) {
                    if (channel.items.length > 0) {
                        shelves.push(
                            createShelf(channel.name, channel.items)
                        );
                    }
                }
            } else {
                const allItems = channelResults.flatMap(channel =>
                    channel.items
                );

                if (allItems.length > 0) {
                    shelves.push(
                        createShelf(browseName, allItems)
                    );
                }
            }

            result.contents = {
                sectionListRenderer: {
                    contents: shelves
                }
            };

            return jsonResponse(result);
        }

        
        const response = await fetch(endpoint, {
            headers: {
                "Accept": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return errorResponse(
                `Invidious request failed: ${data.error || response.statusText}`,
                200
            );
        }

        if (playlist) {
            browseName =
                (typeof data.title === "string" && data.title) ||
                (typeof data.playlist?.title === "string" &&
                    data.playlist.title) ||
                "Playlist";
        }

        let source;

        if (channelUploads) {
            source = getChannelVideos(data);
        } else if (playlist) {
            source = data.videos || [];
        } else {
            source = data;
        }

        if (!Array.isArray(source)) {
            source = [];
        }

        const videos = source
            .filter(item => item && (item.videoId || item.id))
            .slice(0, maxResults);

        const videoItems = videos.map(video =>
            makeVideoRenderer(video, channelUploads ? browseId : "")
        );

        if (channelUploads) {
            Object.assign(result, getHeader(data));
        }

        shelves.push(createShelf(browseName, videoItems));

        
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
            } catch (error) {
                playlistData = [];
            }

            const avatar =
                data.authorThumbnails?.find(t => t.width >= 88) ||
                data.authorThumbnails?.[0];

            const playlistItems = playlistData
                .filter(item => item && (item.playlistId || item.id))
                .slice(0, maxResults)
                .map(item => {
                    const playlistId = item.playlistId || item.id;
                    const playlistTitle =
                        typeof item.title === "string" ? item.title : "";

                    const playlistAuthor =
                        item.author || data.author || data.authorName || "";

                    const playlistAuthorId =
                        item.authorId || item.ucid || browseId;

                    const rawCount =
                        item.videoCount ??
                        item.videosCount ??
                        item.video_count ??
                        -1;

                    const thumbnail =
                        item.playlistThumbnail ||
                        item.thumbnailUrl ||
                        item.thumbnail?.url ||
                        (typeof item.thumbnail === "string"
                            ? item.thumbnail
                            : null) ||
                        item.videoThumbnails?.find(t =>
                            t.quality === "high" || t.quality === "medium"
                        )?.url ||
                        item.videoThumbnails?.[0]?.url ||
                        `https://inv.truehosting.net/vi/${playlistId}/hqdefault.jpg`;

                    const renderer = {
                        videoId: playlistId,

                        thumbnail: {
                            thumbnails: [{
                                url: thumbnail,
                                width: 480,
                                height: 360
                            }]
                        },

                        title: {
                            runs: [{ text: playlistTitle }],
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
                            runs: [{ text: "Playlist" }]
                        },

                        navigationEndpoint: {
                            browseEndpoint: {
                                browseId: playlistId
                            }
                        }
                    };

                    if (avatar?.url) {
                        renderer.channelThumbnail = {
                            thumbnails: [{
                                url: avatar.url,
                                width: avatar.width || 100,
                                height: avatar.height || 100
                            }]
                        };
                    }

                    return { gridVideoRenderer: renderer };
                });

            if (playlistItems.length > 0) {
                shelves.push(createShelf("Playlists", playlistItems));
            }
        }

        result.contents = {
            sectionListRenderer: {
                contents: shelves
            }
        };

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
