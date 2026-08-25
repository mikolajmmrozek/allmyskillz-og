// Lightweight Wix Media preview-URL builder for places that render a plain
// <img> (admin thumbnails, masonry galleries) and would otherwise download the
// full-size original. Produces a width-constrained, WebP-reencoded URL so a
// ~200-700px preview weights a fraction of the source. Non-Wix / SVG URLs and
// non-strings pass through unchanged. Full-size is still served by the
// lightbox, which keeps the raw src.
const WIX_MEDIA_HOSTS = ['media.base44.com', 'static.wixstatic.com'];

export function thumbUrl(src, width = 600) {
  if (!src || typeof src !== 'string') return src;
  try {
    const url = new URL(src);
    if (!WIX_MEDIA_HOSTS.includes(url.hostname)) return src;
    const v1 = url.pathname.indexOf('/v1/');
    const basePath = v1 === -1 ? url.pathname : url.pathname.slice(0, v1);
    const filename = basePath.split('/').pop();
    if (!filename || /\.svg$/i.test(filename)) return src;
    const outputName = /\.gif$/i.test(filename)
      ? filename
      : filename.replace(/\.[a-z0-9]+$/i, '') + '.webp';
    // fit preserves aspect ratio (no crop); a generous height lets portrait
    // images keep their natural shape so masonry staggering still works.
    return `${url.origin}${basePath}/v1/fit/w_${width},h_${width * 4},q_80,enc_webp/${outputName}`;
  } catch {
    return src;
  }
}