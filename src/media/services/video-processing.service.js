/**
 * VideoProcessingService — fluent-ffmpeg based video editing pipeline.
 *
 * All operations write to a new output file; originals are never mutated.
 * FFmpeg flags: -preset fast / -crf 23 for speed/quality balance.
 */

import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { FilterType } from '../enums/filter-type.enum.js';
import { MediaProcessingException } from '../exceptions/media.exceptions.js';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/* ── Helpers ────────────────────────────────────────────────────────────── */

const promisifyFfmpeg = (cmd) =>
  new Promise((resolve, reject) =>
    cmd.on('end', resolve).on('error', (err) => reject(err)).run()
  );

/* ── Video filter presets (FFmpeg vf strings) ───────────────────────────── */

const VIDEO_FILTER_PRESETS = {
  [FilterType.NONE]: null,
  [FilterType.ENHANCE]: 'eq=saturation=1.1:contrast=1.05',
  [FilterType.VIVID]: 'eq=saturation=1.8:contrast=1.2',
  [FilterType.WARM]: 'colorbalance=rs=0.12:gs=0.04:bs=-0.1',
  [FilterType.COOL]: 'colorbalance=rs=-0.1:gs=0.02:bs=0.12',
  [FilterType.VINTAGE]: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131,eq=saturation=0.6:brightness=-0.04',
  [FilterType.FADE]: 'eq=saturation=0.5:brightness=0.08',
  [FilterType.NOIR]: 'hue=s=0,eq=contrast=1.2',
  [FilterType.DRAMATIC]: 'eq=saturation=0.75:contrast=1.4',
  [FilterType.SILHOUETTE]: 'eq=saturation=0:contrast=2.5',
  [FilterType.DAWN]: 'colorbalance=rs=0.15:gs=0.06:bs=-0.12,eq=saturation=1.2:brightness=0.08',
  [FilterType.DUSK]: 'colorbalance=rs=-0.1:gs=-0.04:bs=0.15,eq=saturation=0.88:brightness=-0.08',
  [FilterType.CREMA]: 'eq=saturation=0.7:brightness=0.04',
  [FilterType.LARK]: 'eq=saturation=1.1:brightness=0.12',
  [FilterType.REYES]: 'eq=saturation=0.75:brightness=0.08',
  [FilterType.JUNO]: 'eq=saturation=1.3:contrast=1.08',
  [FilterType.SLUMBER]: 'eq=saturation=0.6:brightness=-0.04',
  [FilterType.SIERRA]: 'eq=saturation=0.85:contrast=1.18',
  [FilterType.MAYFAIR]: 'eq=saturation=1.1:brightness=0.08',
  [FilterType.NASHVILLE]: 'colorbalance=rs=0.08:bs=-0.08,eq=saturation=1.1',
  [FilterType.CLARENDON]: 'eq=saturation=1.4:contrast=1.28',
  [FilterType.GINGHAM]: 'eq=saturation=0.4:brightness=0.12',
  [FilterType.MOON]: 'hue=s=0',
  [FilterType.INKWELL]: 'hue=s=0,eq=contrast=1.4',
};

/* ── Resolution map ─────────────────────────────────────────────────────── */

const RESOLUTION_MAP = {
  '480p': [854, 480],
  '720p': [1280, 720],
  '1080p': [1920, 1080],
  'original': null,
};

/* ── Filter chain builder ───────────────────────────────────────────────── */

/**
 * Build the complete comma-separated vf filter string for an edit config.
 * @param {object} edit
 * @returns {{ vf: string|null, af: string|null }}
 */
function buildFilterStrings(edit) {
  const { filter = FilterType.NONE, adjustments = {}, transform = {}, audio = {}, output = {} } = edit;

  const vfParts = [];

  /* Preset */
  const preset = VIDEO_FILTER_PRESETS[filter] ?? null;
  if (preset) vfParts.push(preset);

  /* User color adjustments (eq filter) */
  const { brightness = 0, contrast = 0, saturation = 0 } = adjustments;
  const eqParts = [];
  if (brightness !== 0) eqParts.push(`brightness=${(brightness / 100).toFixed(3)}`);
  if (contrast !== 0) eqParts.push(`contrast=${(1 + contrast / 100).toFixed(3)}`);
  if (saturation !== 0) eqParts.push(`saturation=${(1 + saturation / 100).toFixed(3)}`);
  if (eqParts.length) vfParts.push(`eq=${eqParts.join(':')}`);

  /* Crop */
  if (transform.crop) {
    const c = transform.crop;
    vfParts.push(`crop=${c.width}:${c.height}:${c.x}:${c.y}`);
  }

  /* Aspect ratio */
  if (transform.aspectRatio && transform.aspectRatio !== 'original') {
    const [rw, rh] = transform.aspectRatio.split(':').map(Number);
    vfParts.push(`setdar=${rw}/${rh}`);
  }

  /* Rotate / flip */
  if (transform.rotate === 90) vfParts.push('transpose=1');
  else if (transform.rotate === 180) vfParts.push('hflip,vflip');
  else if (transform.rotate === 270) vfParts.push('transpose=2');
  if (transform.flipHorizontal) vfParts.push('hflip');
  if (transform.flipVertical) vfParts.push('vflip');

  /* Scale (resolution) */
  const res = RESOLUTION_MAP[output.resolution ?? 'original'];
  if (res) {
    const [tw, th] = res;
    vfParts.push(`scale=${tw}:${th}:force_original_aspect_ratio=decrease,pad=${tw}:${th}:(ow-iw)/2:(oh-ih)/2`);
  }

  /* FPS */
  if (output.fps && output.fps !== 'original') {
    vfParts.push(`fps=fps=${output.fps}`);
  }

  /* Text overlays via drawtext */
  for (const ov of edit.textOverlays ?? []) {
    const safe = ov.text.replace(/'/g, "\\'").replace(/:/g, '\\:');
    const x = `(W*${ov.position?.x ?? 0.05})`;
    const y = `(H*${ov.position?.y ?? 0.05})`;
    const fc = (ov.color ?? '#ffffff').replace('#', '0x');
    const boxColor = ov.backgroundColor
      ? `${ov.backgroundColor.replace('#', '0x')}@${ov.backgroundOpacity ?? 0}`
      : '0x00000000@0';
    const bold = ov.bold ? ':style=Bold' : '';
    const fSize = ov.fontSize ?? 24;

    let dt = `drawtext=text='${safe}':x=${x}:y=${y}:fontsize=${fSize}:fontcolor=${fc}${bold}:box=1:boxcolor=${boxColor}`;
    if (ov.startTime != null || ov.endTime != null) {
      const enable = ov.startTime != null && ov.endTime != null
        ? `between(t,${ov.startTime},${ov.endTime})`
        : ov.startTime != null
        ? `gte(t,${ov.startTime})`
        : `lte(t,${ov.endTime})`;
      dt += `:enable='${enable}'`;
    }
    vfParts.push(dt);
  }

  /* Audio filter */
  const afParts = [];
  if (!audio.mute) {
    const vol = audio.volume ?? 100;
    if (vol !== 100) afParts.push(`volume=${vol / 100}`);
    if (audio.fadeInDuration > 0) afParts.push(`afade=t=in:st=0:d=${audio.fadeInDuration}`);
    /* fadeOut requires knowing total duration; caller passes it as edit.trim.endTime or duration */
    if (audio.fadeOutDuration > 0) {
      const endT = edit.trim?.endTime ?? edit._duration ?? 0;
      const st = Math.max(0, endT - audio.fadeOutDuration);
      afParts.push(`afade=t=out:st=${st}:d=${audio.fadeOutDuration}`);
    }
  }

  return {
    vf: vfParts.length ? vfParts.join(',') : null,
    af: afParts.length ? afParts.join(',') : null,
    muteAudio: audio.mute === true,
  };
}

/* ── Speed filter (requires separate setpts + atempo) ───────────────────── */

function applySpeed(cmd, speed) {
  if (!speed || speed === 1) return cmd;
  const pts = `setpts=${(1 / speed).toFixed(3)}*PTS`;
  /* atempo only supports 0.5–2.0; chain multiple for extremes */
  const atempos = [];
  let s = speed;
  while (s > 2.0) { atempos.push('atempo=2.0'); s /= 2.0; }
  while (s < 0.5) { atempos.push('atempo=0.5'); s /= 0.5; }
  atempos.push(`atempo=${s.toFixed(3)}`);

  cmd = cmd.videoFilters(pts);
  cmd = cmd.audioFilters(atempos.join(','));
  return cmd;
}

/* ── Public API ─────────────────────────────────────────────────────────── */

/**
 * Apply all edits to a video file and write the result to outputPath.
 *
 * @param {string} inputPath   Absolute path to the source video
 * @param {string} outputPath  Absolute path for the output file
 * @param {object} edit        EditVideoDto payload (validated)
 * @param {number} [duration]  Known duration in seconds (used for audio fade-out)
 */
export async function processVideo(inputPath, outputPath, edit, duration) {
  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    const { trim = {}, speed = 1, output = {} } = edit;
    const { vf, af, muteAudio } = buildFilterStrings({ ...edit, _duration: duration });

    const fmt = output.format ?? 'mp4';
    const codec = fmt === 'webm' ? 'libvpx-vp9' : 'libx264';
    const audioCodec = fmt === 'webm' ? 'libvorbis' : 'aac';

    let cmd = ffmpeg(inputPath);

    /* Trim: input-side seek is faster (re-encode handles frame accuracy) */
    if (trim.startTime > 0) cmd = cmd.seekInput(trim.startTime);
    if (trim.endTime != null) cmd = cmd.duration(trim.endTime - (trim.startTime ?? 0));

    /* Speed */
    cmd = applySpeed(cmd, speed);

    /* Video filters */
    if (vf) cmd = cmd.videoFilters(vf);

    /* Audio */
    if (muteAudio) {
      cmd = cmd.noAudio();
    } else {
      if (af) cmd = cmd.audioFilters(af);
      cmd = cmd.audioCodec(audioCodec).audioBitrate('128k');
    }

    cmd = cmd
      .videoCodec(codec)
      .addOption('-preset', 'fast')
      .addOption('-crf', '23')
      .format(fmt)
      .output(outputPath);

    await promisifyFfmpeg(cmd);
  } catch (err) {
    if (err.name === 'MediaProcessingException') throw err;
    throw new MediaProcessingException(`Video processing failed: ${err.message}`, err.stack);
  }
}

/**
 * Generate thumbnail JPEGs from a video at multiple timestamps.
 *
 * @param {string}   inputPath   Absolute path to the video
 * @param {string}   outputDir   Directory to write thumbnails into
 * @param {number}   duration    Video duration in seconds
 * @param {number}   [manualAt]  If set, generate only this timestamp
 * @returns {Promise<string[]>}  Array of written file paths
 */
export async function generateVideoThumbnails(inputPath, outputDir, duration, manualAt) {
  await fs.mkdir(outputDir, { recursive: true });

  const timestamps = manualAt != null
    ? [manualAt]
    : [
        Math.max(0.1, 0.1),
        Math.max(0.1, duration * 0.25),
        Math.max(0.1, duration * 0.5),
      ];

  const results = [];

  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const outFile = path.join(outputDir, `thumb-${i}-${Date.now()}.jpg`);
    await new Promise((resolve, reject) =>
      ffmpeg(inputPath)
        .seekInput(ts)
        .frames(1)
        .size('400x?')
        .output(outFile)
        .on('end', resolve)
        .on('error', reject)
        .run()
    );
    results.push(outFile);
  }

  return results;
}

/**
 * Probe a video file for duration, width, height.
 * @param {string} filePath
 * @returns {Promise<{duration:number, width:number, height:number}>}
 */
export async function probeVideo(filePath) {
  return new Promise((resolve, reject) =>
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const vs = metadata.streams.find((s) => s.codec_type === 'video');
      resolve({
        duration: metadata.format.duration ?? 0,
        width: vs?.width ?? 0,
        height: vs?.height ?? 0,
      });
    })
  );
}
