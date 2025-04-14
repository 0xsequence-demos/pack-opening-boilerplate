import { IEnv } from "./IEnv";
import { mint } from "./mint";

export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      const endpointName = url.pathname.replace("/api/", "");
      switch (endpointName) {
        case "mint":
          return mint(request, env);
      }
      return Response.json({
        name: "Cloudflare",
      });
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<IEnv>;
