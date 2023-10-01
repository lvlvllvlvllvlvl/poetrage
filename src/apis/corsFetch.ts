function corsFetch(...[req, init]: Parameters<typeof fetch>) {
  if (typeof req !== "string" && "url" in req) {
    return fetch({ ...req, url: "https://corsproxy.io/?" + encodeURIComponent(req.url) }, init);
  } else {
    return fetch("https://corsproxy.io/?" + encodeURIComponent(String(req)), init);
  }
}

export default corsFetch;
