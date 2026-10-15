export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.protocol === 'http:') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (url.hostname === 'www.formatfoundry.site' || url.hostname === 'formatfoundary.9021382809as.workers.dev') {
      url.hostname = 'formatfoundry.site';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  }
};
