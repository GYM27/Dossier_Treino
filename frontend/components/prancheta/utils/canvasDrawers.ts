/**
 * @file canvasDrawers.ts
 * @description Módulo puro de renderização 2D no HTML5 Canvas para a Prancheta Tática.
 * Responsável pelo desenho do relvado, formas, linhas, jogadores, balizas, cones, bolas e marcadores.
 */

import { TacticalDrawing, TacticalElement } from "../types";
import { CANVAS_WIDTH, CANVAS_HEIGHT, FIELD_BG } from "../constants";
import { DrawingBounds, DrawingHandleType, getDrawingBounds } from "./tacticalGeometry";

/**
 * Renderiza o relvado de jogo consoante o estilo selecionado (completo, meio-campo ou livre).
 */
export function drawPitch(ctx: CanvasRenderingContext2D, pitchStyle: "full" | "half" | "free") {
  ctx.fillStyle = FIELD_BG;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = "#ffffff60";
  ctx.lineWidth = 3.5;
  const padding = 65;
  const w = CANVAS_WIDTH - padding * 2;
  const h = CANVAS_HEIGHT - padding * 2;
  ctx.strokeRect(padding, padding, w, h);

  if (pitchStyle === "full") {
    // Linha de Meio-Campo
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, padding);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - padding);
    ctx.stroke();

    // Círculo Central e Ponto Central
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffffa0";
    ctx.fill();

    // Grandes Áreas
    const penW = 132;
    const penH = 322;
    ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - penH / 2, penW, penH);
    ctx.strokeRect(CANVAS_WIDTH - padding - penW, CANVAS_HEIGHT / 2 - penH / 2, penW, penH);

    // Pequenas Áreas
    const goalW = 44;
    const goalH = 146;
    ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - goalH / 2, goalW, goalH);
    ctx.strokeRect(CANVAS_WIDTH - padding - goalW, CANVAS_HEIGHT / 2 - goalH / 2, goalW, goalH);

    // Balizas exteriores
    const gW = 16;
    const gH = 58;
    ctx.strokeRect(padding - gW, CANVAS_HEIGHT / 2 - gH / 2, gW, gH);
    ctx.strokeRect(CANVAS_WIDTH - padding, CANVAS_HEIGHT / 2 - gH / 2, gW, gH);

    // Pontos de Penálti
    ctx.beginPath();
    ctx.arc(padding + 88, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - padding - 88, CANVAS_HEIGHT / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Meias-Luas da Grande Área
    const arcAngle = Math.acos(44 / 73);
    ctx.beginPath();
    ctx.arc(padding + 88, CANVAS_HEIGHT / 2, 73, -arcAngle, arcAngle);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - padding - 88, CANVAS_HEIGHT / 2, 73, Math.PI - arcAngle, Math.PI + arcAngle);
    ctx.stroke();

    // Cantos
    ctx.beginPath();
    ctx.arc(padding, padding, 15, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - padding, padding, 15, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - padding, CANVAS_HEIGHT - padding, 15, Math.PI, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(padding, CANVAS_HEIGHT - padding, 15, Math.PI * 1.5, Math.PI * 2);
    ctx.stroke();
  } else if (pitchStyle === "half") {
    // Meio Campo: Grande Área, Pequena Área, Penálti e Meia-Lua (Esquerda)
    const penW = 220;
    const penH = 400;
    ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - penH / 2, penW, penH);

    const goalW = 75;
    const goalH = 190;
    ctx.strokeRect(padding, CANVAS_HEIGHT / 2 - goalH / 2, goalW, goalH);

    const gW = 20;
    const gH = 75;
    ctx.strokeRect(padding - gW, CANVAS_HEIGHT / 2 - gH / 2, gW, gH);

    // Marca de penálti
    const penSpotX = padding + 140;
    ctx.beginPath();
    ctx.arc(penSpotX, CANVAS_HEIGHT / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffffa0";
    ctx.fill();

    // Meia-lua
    const arcRadius = 110;
    const arcAngle = Math.acos((penW - 140) / arcRadius);
    ctx.beginPath();
    ctx.arc(penSpotX, CANVAS_HEIGHT / 2, arcRadius, -arcAngle, arcAngle);
    ctx.stroke();

    // Linha divisória de meio-campo com arco central
    const halfwayX = CANVAS_WIDTH - padding;
    ctx.beginPath();
    ctx.arc(halfwayX, CANVAS_HEIGHT / 2, 120, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(halfwayX, CANVAS_HEIGHT / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffffa0";
    ctx.fill();
  }
}

/**
 * Renderiza um desenho ou forma tática individual (linhas, passes, retângulos, círculos, etc.).
 */
export function drawSingleDrawing(ctx: CanvasRenderingContext2D, drawing: TacticalDrawing) {
  const { type, points, config, rotation } = drawing;
  if (!points || points.length < 2) return;

  const strokeColor = config?.color || "#00e5ff";
  const strokeWidth = config?.size || 2;
  const fillColor = config?.fillColor || "#ef4444";
  const fillOpacity = (config?.opacity !== undefined ? config.opacity : 100) / 100;

  const p0 = points[0];
  const pLast = points[points.length - 1];

  ctx.save();

  if (
    rotation &&
    (type === "rect" || type === "circle" || type === "triangle" || type === "pentagon" || type === "hexagon")
  ) {
    const bounds = getDrawingBounds(drawing);
    if (bounds && bounds.cx !== undefined && bounds.cy !== undefined) {
      ctx.translate(bounds.cx, bounds.cy);
      ctx.rotate(rotation);
      ctx.translate(-bounds.cx, -bounds.cy);
    }
  }

  if (type === "rect") {
    const x = Math.min(p0.x, pLast.x);
    const y = Math.min(p0.y, pLast.y);
    const w = Math.abs(pLast.x - p0.x);
    const h = Math.abs(pLast.y - p0.y);

    if (fillOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = fillOpacity;
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    if (config?.lineStyle === "dashed") {
      ctx.setLineDash([8, 6]);
    }
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  } else if (type === "circle") {
    const radius = Math.hypot(pLast.x - p0.x, pLast.y - p0.y);

    if (fillOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = fillOpacity;
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(p0.x, p0.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    if (config?.lineStyle === "dashed") {
      ctx.setLineDash([8, 6]);
    }
    ctx.beginPath();
    ctx.arc(p0.x, p0.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (type === "triangle") {
    const topX = (p0.x + pLast.x) / 2;
    const topY = Math.min(p0.y, pLast.y);
    const bottomY = Math.max(p0.y, pLast.y);

    if (fillOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = fillOpacity;
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(pLast.x, bottomY);
      ctx.lineTo(p0.x, bottomY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    if (config?.lineStyle === "dashed") {
      ctx.setLineDash([8, 6]);
    }
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(pLast.x, bottomY);
    ctx.lineTo(p0.x, bottomY);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  } else if (type === "pentagon" || type === "hexagon") {
    const sides = type === "pentagon" ? 5 : 6;
    const minX = Math.min(p0.x, pLast.x);
    const maxX = Math.max(p0.x, pLast.x);
    const minY = Math.min(p0.y, pLast.y);
    const maxY = Math.max(p0.y, pLast.y);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = (maxX - minX) / 2;
    const ry = (maxY - minY) / 2;

    const makePolygonPath = () => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
        const px = cx + rx * Math.cos(angle);
        const py = cy + ry * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    if (fillOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = fillOpacity;
      ctx.fillStyle = fillColor;
      makePolygonPath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    if (config?.lineStyle === "dashed") {
      ctx.setLineDash([8, 6]);
    }
    makePolygonPath();
    ctx.stroke();
    ctx.restore();
  } else if (type === "pen") {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  } else if (type === "run" || type === "pass" || type === "line") {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    if (type === "pass") {
      ctx.setLineDash([8, 6]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(pLast.x, pLast.y);
    ctx.stroke();

    if (type !== "line") {
      ctx.setLineDash([]);
      const angle = Math.atan2(pLast.y - p0.y, pLast.x - p0.x);
      const arrowLength = Math.max(10, strokeWidth * 4);
      ctx.beginPath();
      ctx.moveTo(pLast.x, pLast.y);
      ctx.lineTo(
        pLast.x - arrowLength * Math.cos(angle - Math.PI / 6),
        pLast.y - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        pLast.x - arrowLength * Math.cos(angle + Math.PI / 6),
        pLast.y - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = strokeColor;
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Renderiza o contorno visual e manipuladores (handles) de um desenho selecionado.
 */
export function drawDrawingSelection(
  ctx: CanvasRenderingContext2D,
  selDrawing: TacticalDrawing,
  bounds: DrawingBounds
) {
  const isLine =
    selDrawing.type === "run" ||
    selDrawing.type === "pass" ||
    selDrawing.type === "pen" ||
    selDrawing.type === "line";

  ctx.save();
  if (bounds.cx !== undefined && bounds.cy !== undefined && bounds.rotation) {
    ctx.translate(bounds.cx, bounds.cy);
    ctx.rotate(bounds.rotation);
    ctx.translate(-bounds.cx, -bounds.cy);
  }

  if (isLine) {
    ctx.save();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = Math.max(12, (selDrawing.config?.size || 2) + 14);
    ctx.globalAlpha = 0.55;
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 20;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(selDrawing.points[0].x, selDrawing.points[0].y);
    for (let i = 1; i < selDrawing.points.length; i++) {
      ctx.lineTo(selDrawing.points[i].x, selDrawing.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.save();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 18;
    ctx.setLineDash([7, 5]);
    ctx.strokeRect(
      bounds.minX - 6,
      bounds.minY - 6,
      bounds.maxX - bounds.minX + 12,
      bounds.maxY - bounds.minY + 12
    );
    ctx.restore();

    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56, 189, 248, 0.6)";
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
  }

  bounds.handles.forEach((h: { type: DrawingHandleType; x: number; y: number }) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(h.x, h.y, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = "#0284c7";
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

/**
 * Renderiza um elemento tático (jogador, bola, cone, mini-baliza) e respetivos destaques de seleção.
 */
export function drawElement(
  ctx: CanvasRenderingContext2D,
  el: TacticalElement,
  isSelected: boolean
) {
  if (el.type === "cone") {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(el.x, el.y - 14);
    ctx.lineTo(el.x + 12, el.y + 12);
    ctx.lineTo(el.x - 12, el.y + 12);
    ctx.closePath();
    ctx.fillStyle = el.color || "#f97316";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();
  } else if (el.type === "mini_goal") {
    const gw = el.goalSize === "fut11" ? 82 : el.goalSize === "fut7" ? 56 : 36;
    const gd = el.goalSize === "fut11" ? 32 : el.goalSize === "fut7" ? 24 : 18;
    const postRadius = el.goalSize === "fut11" ? 3.5 : el.goalSize === "fut7" ? 3 : 2.5;
    const crossbarWidth = el.goalSize === "fut11" ? 4.5 : el.goalSize === "fut7" ? 4 : 3.5;

    ctx.save();
    ctx.translate(el.x, el.y);
    if (el.rotation) {
      ctx.rotate(el.rotation);
    }

    // Sombra de contacto
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, gd / 2 + 2, gw / 2 + 4, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fill();
    ctx.restore();

    // Rede
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(-gw / 2, -gd / 2, gw, gd);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    for (let nx = -gw / 2 + 6; nx < gw / 2; nx += 6) {
      ctx.beginPath();
      ctx.moveTo(nx, -gd / 2);
      ctx.lineTo(nx, gd / 2);
      ctx.stroke();
    }
    for (let ny = -gd / 2 + 6; ny < gd / 2; ny += 6) {
      ctx.beginPath();
      ctx.moveTo(-gw / 2, ny);
      ctx.lineTo(gw / 2, ny);
      ctx.stroke();
    }

    // Estrutura traseira
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.strokeRect(-gw / 2, -gd / 2, gw, gd);

    // Linha frontal e postes
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = crossbarWidth;
    ctx.beginPath();
    ctx.moveTo(-gw / 2, gd / 2);
    ctx.lineTo(gw / 2, gd / 2);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-gw / 2, gd / 2, postRadius, 0, Math.PI * 2);
    ctx.arc(gw / 2, gd / 2, postRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (el.type === "ball") {
    const r = 7.5;
    ctx.save();

    // Sombra
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(el.x, el.y + r - 1.5, r * 0.85, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();

    // Esfera 3D
    const sphereGrad = ctx.createRadialGradient(
      el.x - r * 0.35,
      el.y - r * 0.35,
      r * 0.1,
      el.x,
      el.y,
      r
    );
    sphereGrad.addColorStop(0, "#ffffff");
    sphereGrad.addColorStop(0.55, "#f1f5f9");
    sphereGrad.addColorStop(0.85, "#cbd5e1");
    sphereGrad.addColorStop(1, "#64748b");

    ctx.beginPath();
    ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    // Clip da esfera
    ctx.save();
    ctx.beginPath();
    ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
    ctx.clip();

    // Pentágono central
    const centerPentagonRadius = r * 0.42;
    const pentagonAngles: number[] = [];
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      pentagonAngles.push(angle);
      const px = el.x + centerPentagonRadius * Math.cos(angle);
      const py = el.y + centerPentagonRadius * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Costuras e patches externos
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const angle = pentagonAngles[i];
      const p1x = el.x + centerPentagonRadius * Math.cos(angle);
      const p1y = el.y + centerPentagonRadius * Math.sin(angle);
      const p2x = el.x + r * 1.05 * Math.cos(angle);
      const p2y = el.y + r * 1.05 * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.stroke();

      const nextAngle = pentagonAngles[(i + 1) % 5];
      const midAngle = (angle + nextAngle) / 2 + (nextAngle < angle ? Math.PI : 0);
      const patchX = el.x + r * 1.08 * Math.cos(midAngle);
      const patchY = el.y + r * 1.08 * Math.sin(midAngle);
      ctx.beginPath();
      ctx.arc(patchX, patchY, r * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.stroke();
    }

    // Brilho especular
    const shineGrad = ctx.createRadialGradient(
      el.x - r * 0.35,
      el.y - r * 0.35,
      0,
      el.x - r * 0.35,
      el.y - r * 0.35,
      r * 0.6
    );
    shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.75)");
    shineGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.2)");
    shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.beginPath();
    ctx.arc(el.x - r * 0.35, el.y - r * 0.35, r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = shineGrad;
    ctx.fill();

    ctx.restore(); // restore clip

    ctx.beginPath();
    ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  } else {
    // Jogador (home, away, neutral)
    const pColor = el.color || (el.type === "home" ? "#facc15" : "#3b82f6");
    const pRadius = el.size === "lg" ? 19 : el.size === "md" ? 15 : 11;
    const pBorder = el.size === "lg" ? 2.5 : el.size === "md" ? 2.2 : 1.8;

    ctx.beginPath();
    ctx.arc(el.x, el.y, pRadius, 0, Math.PI * 2);
    ctx.fillStyle = pColor;
    ctx.fill();
    ctx.lineWidth = pBorder;

    const isLight =
      pColor.toLowerCase() === "#ffffff" ||
      pColor.toLowerCase() === "#facc15" ||
      pColor.toLowerCase() === "#fde047";
    ctx.strokeStyle = isLight ? "#0f172a" : "#ffffff";
    ctx.stroke();

    const textToRender =
      el.label !== undefined ? el.label : el.number !== undefined ? el.number.toString() : "";
    if (textToRender) {
      const isLong = textToRender.length > 2;
      let fontSize = 9;
      if (el.size === "lg") {
        fontSize = isLong ? 11 : 15;
      } else if (el.size === "md") {
        fontSize = isLong ? 9 : 12;
      } else {
        fontSize = isLong ? 7 : 9;
      }
      ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = isLight ? "#0f172a" : "#ffffff";
      ctx.fillText(textToRender, el.x, el.y);
    }
  }

  // Destaque de seleção
  if (isSelected) {
    ctx.save();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 10;
    const selectRadius =
      el.type === "ball"
        ? 17
        : el.type === "cone"
        ? 21
        : el.type === "mini_goal"
        ? el.goalSize === "fut11"
          ? 48
          : el.goalSize === "fut7"
          ? 36
          : 26
        : el.size === "lg"
        ? 27
        : el.size === "md"
        ? 21
        : 16;
    ctx.beginPath();
    ctx.arc(el.x, el.y, selectRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (el.type === "mini_goal") {
      ctx.save();
      if (el.rotation) {
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation);
        ctx.translate(-el.x, -el.y);
      }
      ctx.beginPath();
      ctx.arc(el.x, el.y - selectRadius - 16, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = "#0284c7";
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.restore();
    }
  }
}
