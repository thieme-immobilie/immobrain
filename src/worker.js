export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/somantic/check") return env.ASSETS.fetch(request);
    if (request.method !== "POST") return Response.json({error:"Methode nicht erlaubt"}, {status:405,headers:{"Cache-Control":"no-store","Allow":"POST"}});
    if (request.headers.get("Origin") !== url.origin) return Response.json({error:"Ungültiger Ursprung"}, {status:403,headers:{"Cache-Control":"no-store"}});
    if (!env.SOMANTIC_API_KEY) return Response.json({error:"Somantic-Secret ist nicht eingerichtet."}, {status:503,headers:{"Cache-Control":"no-store"}});
    try {
      const response = await fetch("https://www.somantic.net/api/graphql", {
        method:"POST",
        headers:{"Content-Type":"application/json","X-API-Key":env.SOMANTIC_API_KEY},
        body:JSON.stringify({query:"{ all_appartments(per_page: 1) { edges { node { immo_id } } } }"}),
        signal:AbortSignal.timeout(10000)
      });
      if (response.status===401 || response.status===403) return Response.json({error:"Somantic hat den Zugang abgelehnt."}, {status:502,headers:{"Cache-Control":"no-store"}});
      if (response.status===429) return Response.json({error:"Somantic-Limit erreicht."}, {status:429,headers:{"Cache-Control":"no-store"}});
      if (!response.ok) return Response.json({error:"Somantic ist momentan nicht erreichbar."}, {status:502,headers:{"Cache-Control":"no-store"}});
      const data=await response.json();
      if (data.errors || !data.data?.all_appartments) return Response.json({error:"Somantic hat die Testabfrage nicht akzeptiert."}, {status:502,headers:{"Cache-Control":"no-store"}});
      return Response.json({ok:true,message:"Somantic-Verbindung funktioniert."}, {headers:{"Cache-Control":"no-store"}});
    } catch { return Response.json({error:"Somantic ist momentan nicht erreichbar."}, {status:502,headers:{"Cache-Control":"no-store"}}); }
  }
};
