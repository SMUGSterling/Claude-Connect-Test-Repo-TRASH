// The "optimizer". Allocates the number of bytes it was asked for, touches
// every page so the OS actually commits them, then sits there reporting its
// own RSS to the parent forever.
const CHUNK_BYTES = 32 * 1024 * 1024;
const MIN_BYTES = 128 * 1024 * 1024;
const REPORT_INTERVAL_MS = 500;
const PAGE_BYTES = 4096;

const target = Math.max(Number(process.argv[2]) || 0, MIN_BYTES);
const ballast = [];

for (let allocated = 0; allocated < target; allocated += CHUNK_BYTES) {
  const chunk = Buffer.allocUnsafe(Math.min(CHUNK_BYTES, target - allocated));
  chunk.fill(0x42);
  ballast.push(chunk);
}

let ink = 0;

setInterval(() => {
  // Dirty one byte per page so the kernel can't quietly reclaim the ballast.
  // Untouched anonymous pages get swapped or reclaimed under pressure, and a
  // memory hog whose memory usage goes back down is no memory hog at all.
  for (const chunk of ballast) {
    for (let offset = 0; offset < chunk.length; offset += PAGE_BYTES) {
      chunk[offset] = ink;
    }
  }
  ink = (ink + 1) % 256;

  process.stdout.write(`${process.memoryUsage().rss}\n`);
}, REPORT_INTERVAL_MS);
