export interface Rect {
  w: number;
  h: number;
  name: string;
  count: number;
  pL?: number;
  pW?: number;
}

export interface PlacedRect {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  rotated: boolean;
  pL?: number;
  pW?: number;
}

export interface Bin {
  w: number;
  h: number;
  placed: PlacedRect[];
  freeRects: { x: number; y: number; w: number; h: number }[];
  usedArea: number;
}

const KERF = 0.4; // 4mm blade thickness

export function packRects(rects: Rect[], binW: number, binH: number): Bin[] {
  const items: { w: number; h: number; name: string; pL?: number; pW?: number }[] = [];
  rects.forEach(r => {
    const count = Number(r.count) || 0;
    for (let i = 0; i < count; i++) {
      items.push({ 
        w: Number(r.w) + KERF, 
        h: Number(r.h) + KERF, 
        name: r.name || 'قطعه',
        pL: r.pL,
        pW: r.pW
      });
    }
  });

  // Sort by Longest Edge descending, then Area descending. 
  // This yields significantly better packing density for Guillotine cuts.
  items.sort((a, b) => {
    const maxA = Math.max(a.w, a.h);
    const maxB = Math.max(b.w, b.h);
    if (maxB !== maxA) return maxB - maxA;
    return (b.w * b.h) - (a.w * a.h);
  });

  const bins: Bin[] = [];

  items.forEach(item => {
    let placed = false;
    for (const bin of bins) {
       if (tryPack(bin, item.w, item.h, item.name, item.pL, item.pW)) {
         placed = true;
         break;
       }
    }
    if (!placed) {
      const newBin: Bin = { 
        w: binW, 
        h: binH, 
        placed: [], 
        freeRects: [{ x: 0, y: 0, w: binW, h: binH }],
        usedArea: 0 
      };
      tryPack(newBin, item.w, item.h, item.name, item.pL, item.pW);
      bins.push(newBin);
    }
  });

  // Remove kerf for drawing and calculations
  bins.forEach(bin => {
    bin.placed.forEach(p => {
      p.w = Number((p.w - KERF).toFixed(1));
      p.h = Number((p.h - KERF).toFixed(1));
    });
  });

  return bins;
}

function tryPack(bin: Bin, w: number, h: number, name: string, pL?: number, pW?: number): boolean {
  if (!w || !h || isNaN(w) || isNaN(h)) return false;

  let bestNode: PlacedRect | null = null;
  let bestFreeIndex = -1;
  let bestScore1 = Infinity; // Area fit
  let bestScore2 = Infinity; // Short side fit

  for (let i = 0; i < bin.freeRects.length; i++) {
    const fr = bin.freeRects[i];
    
    // Normal orientation
    if (fr.w >= w && fr.h >= h) {
      const leftoverArea = (fr.w * fr.h) - (w * h);
      const shortSide = Math.min(fr.w - w, fr.h - h);
      
      if (leftoverArea < bestScore1 || (leftoverArea === bestScore1 && shortSide < bestScore2)) {
        bestScore1 = leftoverArea;
        bestScore2 = shortSide;
        bestFreeIndex = i;
        bestNode = { x: fr.x, y: fr.y, w: w, h: h, name, rotated: false, pL, pW };
      }
    }
    
    // Rotated orientation
    if (fr.w >= h && fr.h >= w) {
      const leftoverArea = (fr.w * fr.h) - (w * h);
      const shortSide = Math.min(fr.w - h, fr.h - w);
      
      if (leftoverArea < bestScore1 || (leftoverArea === bestScore1 && shortSide < bestScore2)) {
        bestScore1 = leftoverArea;
        bestScore2 = shortSide;
        bestFreeIndex = i;
        bestNode = { x: fr.x, y: fr.y, w: h, h: w, name, rotated: true, pL, pW };
      }
    }
  }

  if (bestNode) {
    const fr = bin.freeRects[bestFreeIndex];
    bin.placed.push(bestNode);
    bin.usedArea += (w * h);
    bin.freeRects.splice(bestFreeIndex, 1);
    
    // Guillotine split (Maximize Area of LARGER Free Rect to keep off-cuts highly reusable)
    const w1 = fr.w - bestNode.w;
    const h1 = bestNode.h;
    const w2 = fr.w;
    const h2 = fr.h - bestNode.h;

    const w3 = bestNode.w;
    const h3 = fr.h - bestNode.h;
    const w4 = fr.w - bestNode.w;
    const h4 = fr.h;

    const maxArea1 = Math.max(w1 * h1, w2 * h2);
    const maxArea2 = Math.max(w3 * h3, w4 * h4);

    if (maxArea1 > maxArea2) {
      if (w1 > KERF && h1 > KERF) bin.freeRects.push({ x: fr.x + bestNode.w, y: fr.y, w: w1, h: h1 });
      if (w2 > KERF && h2 > KERF) bin.freeRects.push({ x: fr.x, y: fr.y + bestNode.h, w: w2, h: h2 });
    } else {
      if (w3 > KERF && h3 > KERF) bin.freeRects.push({ x: fr.x, y: fr.y + bestNode.h, w: w3, h: h3 });
      if (w4 > KERF && h4 > KERF) bin.freeRects.push({ x: fr.x + bestNode.w, y: fr.y, w: w4, h: h4 });
    }
    return true;
  }
  return false;
}
