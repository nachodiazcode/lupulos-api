/**
 * ImageProcessingService — Sharp-based image editing pipeline.
 *
 * Pipeline order (all non-destructive, always produces a new Buffer):
 *   1. Filter preset (modulate / linear / grayscale chains)
 *   2. User adjustments on top of the preset
 *   3. Geometric transforms (crop → aspect ratio → rotate → flip)
 *   4. Composited overlays (vignette, grain, text, sticker)
 *   5. Output encoding (format, quality, resize)
 */

import sharp from 'sharp';
import { FilterType } from '../enums/filter-type.enum.js';
import { MediaProcessingException } from '../exceptions/media.exceptions.js';

/* ── Filter presets ─────────────────────────────────────────────────────── */

/**
 * Each preset is a function (pipeline: Sharp) => Sharp.
 * Operations are chained so Sharp can optimise the vips pipeline internally.
 */
const FILTER_CHAINS = {
  [FilterType.NONE]: (p) => p,
  [FilterType.ENHANCE]: (p) =>
    p.modulate({ brightness: 1.05, saturation: 1.1 }).sharpen({ sigma: 0.6 }),
  [FilterType.VIVID]: (p) =>
    p.modulate({ saturation: 1.8, brightness: 1.02 }).linear(1.12, -12),
  [FilterType.WARM]: (p) =>
    p.modulate({ brightness: 1.02, saturation: 1.05, hue: -12 }),
  [FilterType.COOL]: (p) =>
    p.modulate({ brightness: 1.02, saturation: 1.05, hue: 18 }),
  [FilterType.VINTAGE]: (p) =>
    p.modulate({ saturation: 0.55, brightness: 0.95 }).gamma(1.5),
  [FilterType.FADE]: (p) =>
    p.modulate({ saturation: 0.5, brightness: 1.05 }).linear(0.85, 22),
  [FilterType.NOIR]: (p) =>
    p.grayscale().linear(1.2, -10),
  [FilterType.DRAMATIC]: (p) =>
    p.modulate({ saturation: 0.75 }).linear(1.4, -42),
  [FilterType.SILHOUETTE]: (p) =>
    p.modulate({ saturation: 0 }).linear(2.8, -240),
  [FilterType.DAWN]: (p) =>
    p.modulate({ brightness: 1.1, saturation: 1.2, hue: -20 }),
  [FilterType.DUSK]: (p) =>
    p.modulate({ brightness: 0.9, saturation: 0.88, hue: 28 }),
  [FilterType.CREMA]: (p) =>
    p.modulate({ saturation: 0.7, brightness: 1.05 }).gamma(1.2),
  [FilterType.LARK]: (p) =>
    p.modulate({ saturation: 1.1, brightness: 1.15, hue: 10 }).linear(1.08, -8),
  [FilterType.REYES]: (p) =>
    p.modulate({ saturation: 0.75, brightness: 1.1 }).gamma(1.3),
  [FilterType.JUNO]: (p) =>
    p.modulate({ saturation: 1.3, brightness: 1.02 }).linear(1.08, -8),
  [FilterType.SLUMBER]: (p) =>
    p.modulate({ saturation: 0.6, brightness: 0.95 }).blur(0.6).linear(0.9, 18),
  [FilterType.SIERRA]: (p) =>
    p.modulate({ saturation: 0.85, brightness: 1.05 }).linear(1.18, -18),
  [FilterType.MAYFAIR]: (p) =>
    p.modulate({ saturation: 1.1, brightness: 1.08 }).gamma(1.1),
  [FilterType.NASHVILLE]: (p) =>
    p.modulate({ saturation: 1.1, brightness: 1.04, hue: -14 }),
  [FilterType.CLARENDON]: (p) =>
    p.modulate({ saturation: 1.4 }).linear(1.28, -28),
  [FilterType.GINGHAM]: (p) =>
    p.modulate({ saturation: 0.4, brightness: 1.15 }).linear(0.85, 28),
  [FilterType.MOON]: (p) =>
    p.grayscale().linear(1.1, -8).modulate({ brightness: 1.05 }),
  [FilterType.INKWELL]: (p) =>
    p.grayscale().linear(1.4, -38),
};

/* ── SVG overlay helpers ────────────────────────────────────────────────── */

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const vignetteOverlay = (w, h, strength) => {
  const opacity = ((strength / 100) * 0.85).toFixed(3);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      `<defs><radialGradient id="v" cx="50%" cy="50%" r="70%">` +
      `<stop offset="0%" stop-color="black" stop-opacity="0"/>` +
      `<stop offset="100%" stop-color="black" stop-opacity="${opacity}"/>` +
      `</radialGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#v)"/></svg>`
  );
};

const grainOverlay = (w, h, strength) => {
  const opacity = ((strength / 100) * 0.18).toFixed(3);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch"/>` +
      `<feColorMatrix type="saturate" values="0"/></filter>` +
      `<rect width="${w}" height="${h}" filter="url(#n)" opacity="${opacity}"/></svg>`
  );
};

/**
 * @param {number} w canvas width
 * @param {number} h canvas height
 * @param {object} overlay TextOverlay config
 */
const textOverlaySvg = (w, h, overlay) => {
  const {
    text,
    fontFamily = 'Arial',
    fontSize = 24,
    color = '#ffffff',
    position,
    backgroundColor,
    backgroundOpacity = 0,
    bold = false,
    italic = false,
  } = overlay;

  const px = Math.round(position.x * w);
  const py = Math.round(position.y * h);
  const fWeight = bold ? 'bold' : 'normal';
  const fStyle = italic ? 'italic' : 'normal';

  let bgRect = '';
  if (backgroundColor && backgroundOpacity > 0) {
    const bw = Math.min(text.length * fontSize * 0.62 + 24, w);
    const bh = fontSize * 1.6;
    bgRect =
      `<rect x="${px - 10}" y="${py - fontSize}" ` +
      `width="${bw}" height="${bh}" ` +
      `fill="${escapeXml(backgroundColor)}" fill-opacity="${backgroundOpacity}"/>`;
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      bgRect +
      `<text x="${px}" y="${py}" font-family="${escapeXml(fontFamily)}" ` +
      `font-size="${fontSize}" fill="${escapeXml(color)}" ` +
      `font-weight="${fWeight}" font-style="${fStyle}">${escapeXml(text)}</text></svg>`
  );
};

/* ── Aspect ratio helpers ───────────────────────────────────────────────── */

const RATIO_MAP = {
  '1:1': [1, 1],
  '4:5': [4, 5],
  '9:16': [9, 16],
  '16:9': [16, 9],
  '3:4': [3, 4],
  '4:3': [4, 3],
};

const applyAspectRatio = (pipeline, ratio, srcW, srcH) => {
  const parts = RATIO_MAP[ratio];
  if (!parts) return pipeline;
  const [rw, rh] = parts;
  const targetW = srcW;
  const targetH = Math.round((srcW * rh) / rw);
  if (targetH > srcH) {
    return pipeline.resize(Math.round((srcH * rw) / rh), srcH, {
      fit: 'cover',
      position: 'centre',
    });
  }
  return pipeline.resize(targetW, targetH, { fit: 'cover', position: 'centre' });
};

/* ── Main processing function ───────────────────────────────────────────── */

/**
 * Process an image buffer according to the edit config.
 *
 * @param {Buffer} inputBuffer  Original image bytes
 * @param {object} edit         EditImageDto payload (validated)
 * @returns {Promise<Buffer>}   Processed image bytes
 */
export async function processImage(inputBuffer, edit) {
  try {
    const {
      filter = FilterType.NONE,
      adjustments = {},
      transform = {},
      textOverlays = [],
      stickerOverlay,
      output = {},
    } = edit;

    /* ── 1. Read metadata once for dimension-dependent operations ── */
    const meta = await sharp(inputBuffer).metadata();
    let { width: srcW, height: srcH } = meta;

    /* ── 2. Start pipeline ── */
    let pipeline = sharp(inputBuffer);

    /* ── 3. Apply filter preset ── */
    const filterFn = FILTER_CHAINS[filter] ?? FILTER_CHAINS[FilterType.NONE];
    pipeline = filterFn(pipeline);

    /* ── 4. User adjustments ── */
    const {
      brightness = 100,
      contrast = 100,
      saturation = 100,
      sharpness = 0,
      blur: blurAmt = 0,
      vignette = 0,
      fade = 0,
      highlights = 0,
      shadows = 0,
      warmth = 0,
      tint: tintAmt = 0,
      grain = 0,
    } = adjustments;

    if (brightness !== 100 || saturation !== 100) {
      pipeline = pipeline.modulate({
        brightness: brightness / 100,
        saturation: saturation / 100,
      });
    }

    if (contrast !== 100) {
      const a = contrast / 100;
      const b = Math.floor(128 * (1 - a));
      pipeline = pipeline.linear(a, b);
    }

    const hueShift = warmth * -0.45 + tintAmt * 0.45;
    if (Math.abs(hueShift) > 0.1) {
      pipeline = pipeline.modulate({ hue: hueShift });
    }

    if (fade > 0) {
      const lift = (fade / 100) * 48;
      pipeline = pipeline.linear(1 - fade / 200, lift);
    }

    if (shadows !== 0) {
      const gamma = shadows > 0 ? 1 - shadows / 220 : 1 + Math.abs(shadows) / 160;
      pipeline = pipeline.gamma(Math.max(0.1, Math.min(gamma, 9.99)));
    }

    if (highlights !== 0) {
      pipeline = pipeline.linear(1 + highlights / 220, -(highlights * 0.4));
    }

    if (sharpness > 0) {
      pipeline = pipeline.sharpen({ sigma: 0.3 + (sharpness / 100) * 3.2 });
    }

    if (blurAmt > 0) {
      pipeline = pipeline.blur(0.3 + (blurAmt / 100) * 12);
    }

    /* ── 5. Geometric transforms ── */
    const { rotate = 0, flipHorizontal = false, flipVertical = false, crop, aspectRatio = 'original' } = transform;

    if (crop) {
      const isRelative = crop.x <= 1 && crop.y <= 1 && crop.width <= 1 && crop.height <= 1;
      const left = isRelative ? Math.round(crop.x * srcW) : Math.round(crop.x);
      const top = isRelative ? Math.round(crop.y * srcH) : Math.round(crop.y);
      const w = isRelative ? Math.round(crop.width * srcW) : Math.round(crop.width);
      const h = isRelative ? Math.round(crop.height * srcH) : Math.round(crop.height);
      pipeline = pipeline.extract({ left, top, width: w, height: h });
      srcW = w;
      srcH = h;
    }

    if (aspectRatio && aspectRatio !== 'original') {
      pipeline = applyAspectRatio(pipeline, aspectRatio, srcW, srcH);
      /* Recompute overlay canvas size without executing the pipeline */
      const ratioParts = RATIO_MAP[aspectRatio];
      if (ratioParts) {
        const [rw, rh] = ratioParts;
        const candidateH = Math.round((srcW * rh) / rw);
        if (candidateH > srcH) {
          srcW = Math.round((srcH * rw) / rh);
        } else {
          srcH = candidateH;
        }
      }
    }

    if (rotate !== 0) pipeline = pipeline.rotate(rotate);
    if (flipHorizontal) pipeline = pipeline.flop();
    if (flipVertical) pipeline = pipeline.flip();

    /* ── 6. Composited overlays ── */
    const compositeInputs = [];

    if (vignette > 0) {
      compositeInputs.push({
        input: vignetteOverlay(srcW, srcH, vignette),
        blend: 'over',
      });
    }

    if (grain > 0) {
      compositeInputs.push({
        input: grainOverlay(srcW, srcH, grain),
        blend: 'over',
      });
    }

    for (const overlay of textOverlays) {
      compositeInputs.push({
        input: textOverlaySvg(srcW, srcH, overlay),
        blend: 'over',
      });
    }

    if (stickerOverlay?.overlayUrl) {
      try {
        const resp = await fetch(stickerOverlay.overlayUrl);
        if (resp.ok) {
          const rawBuf = Buffer.from(await resp.arrayBuffer());
          const scale = stickerOverlay.scale ?? 1;
          const rot = stickerOverlay.rotation ?? 0;
          const opacity = stickerOverlay.opacity ?? 1;
          const stickerMeta = await sharp(rawBuf).metadata();
          const sw = Math.round(stickerMeta.width * scale);
          const sh = Math.round(stickerMeta.height * scale);
          let stickerBuf = await sharp(rawBuf)
            .resize(sw, sh)
            .rotate(rot)
            .toBuffer();

          if (opacity < 1) {
            /* Blend opacity via a full-alpha rectangle composited dest-in */
            const alphaVal = Math.round(opacity * 255);
            const alphaBuf = Buffer.alloc(sw * sh * 4, 0);
            for (let i = 3; i < alphaBuf.length; i += 4) alphaBuf[i] = alphaVal;
            stickerBuf = await sharp(stickerBuf)
              .ensureAlpha()
              .composite([{ input: alphaBuf, raw: { width: sw, height: sh, channels: 4 }, blend: 'dest-in' }])
              .toBuffer();
          }

          compositeInputs.push({
            input: stickerBuf,
            top: Math.round((stickerOverlay.position?.y ?? 0) * srcH),
            left: Math.round((stickerOverlay.position?.x ?? 0) * srcW),
            blend: 'over',
          });
        }
      } catch {
        /* Sticker fetch failure is non-fatal — skip overlay */
      }
    }

    if (compositeInputs.length > 0) {
      pipeline = pipeline.composite(compositeInputs);
    }

    /* ── 7. Output resize ── */
    if (output.width || output.height) {
      pipeline = pipeline.resize(output.width ?? null, output.height ?? null, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    /* ── 8. Encode ── */
    const fmt = output.format ?? 'jpeg';
    const quality = output.quality ?? 85;
    if (fmt === 'png') {
      pipeline = pipeline.png({ quality });
    } else if (fmt === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else {
      pipeline = pipeline.jpeg({ quality, mozjpeg: false });
    }

    return await pipeline.toBuffer();
  } catch (err) {
    if (err.name === 'MediaProcessingException') throw err;
    throw new MediaProcessingException(`Image processing failed: ${err.message}`, err.stack);
  }
}

/**
 * Generate a thumbnail from an image buffer.
 * @param {Buffer} inputBuffer
 * @param {number} [maxSize=400]
 * @returns {Promise<Buffer>}
 */
export async function generateImageThumbnail(inputBuffer, maxSize = 400) {
  return await sharp(inputBuffer)
    .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer();
}

/**
 * Extract basic metadata (width, height) from an image buffer.
 * @param {Buffer} buffer
 * @returns {Promise<{width:number, height:number}>}
 */
export async function getImageDimensions(buffer) {
  const { width, height } = await sharp(buffer).metadata();
  return { width, height };
}
