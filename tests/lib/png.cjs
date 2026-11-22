/* Décodeur PNG minimal (8 bits, RVB ou RVBA, sans entrelacement) pour comparer des captures d'écran de Playwright
   sans dépendance. Renvoie { width, height, channels, data } (octets bruts, ligne par ligne). */
const zlib = require("zlib");

function decodePng(buf) {
  let p = 8, width = 0, height = 0, type = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), kind = buf.toString("ascii", p + 4, p + 8), body = buf.subarray(p + 8, p + 8 + len);
    if (kind === "IHDR") {
      width = body.readUInt32BE(0); height = body.readUInt32BE(4); type = body[9];
      if (body[8] !== 8 || body[12] !== 0 || (type !== 2 && type !== 6)) throw new Error("PNG non pris en charge");
    } else if (kind === "IDAT") idat.push(body);
    else if (kind === "IEND") break;
    p += 12 + len;
  }
  const ch = type === 6 ? 4 : 3, stride = width * ch, raw = zlib.inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? out[dst + x - ch] : 0, b = y ? out[dst - stride + x] : 0, c = x >= ch && y ? out[dst - stride + x - ch] : 0;
      let v = raw[src + x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[dst + x] = v & 255;
    }
  }
  return { width, height, channels: ch, data: out };
}

/* Écart entre deux captures de même taille : moyenne de l'écart maximal par pixel (niveaux 0 à 255) et part des pixels
   qui changent de plus de `seuil` niveaux. */
function pngDiff(bufA, bufB, seuil = 3) {
  const A = decodePng(bufA), B = decodePng(bufB);
  if (A.width !== B.width || A.height !== B.height) throw new Error("captures de tailles différentes");
  let sum = 0, over = 0;
  const n = A.width * A.height;
  for (let i = 0; i < n; i++) {
    let m = 0;
    for (let k = 0; k < 3; k++) m = Math.max(m, Math.abs(A.data[i * A.channels + k] - B.data[i * B.channels + k]));
    sum += m; if (m > seuil) over++;
  }
  return { moyenne: sum / n, part: over / n };
}

module.exports = { decodePng, pngDiff };
