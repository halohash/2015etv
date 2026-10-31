import guide from '../../../data/guide.json';
import guidechannels from '../../../data/guidechannels.json';
import guidelogin from '../../../data/guidelogin.json';
import guideplaylists from '../../../data/guideplaylists.json';



export async function onRequest(context) {
  const { request } = context;
  const method = request.method;

const isLoginFake = false;
var fakeLoginName = "2015ETV"
var fakeLoginProfile = "https://s.ytimg.com/yts/img/silhouette250-vflEqxKg9.png"

for (let channel of guidechannels) {
    guide.items[2].guideSectionRenderer.items.push(channel);
}

for (let playlist of guideplaylist) {
    guide.items[3].guideSectionRenderer.items.push(playlist);
}

if (isLoginFake) {
guidelogin.guideAccountEntryRenderer.title.runs[0].text = fakeLoginName;
guidelogin.guideAccountEntryRenderer.thumbnail.thumbnails[0].url = fakeLoginProfile;
  guide.items[0].guideSectionRenderer.items.push(guidelogin);
}

  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
      },
    });
  }

  return Response.json(guide, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    }
  });
}
