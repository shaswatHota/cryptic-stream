"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";
import { motion } from "framer-motion";

interface VortexProps {
  children?: any;
  className?: string;
  containerClassName?: string;
  particleCount?: number;
  rangeY?: number;
  baseHue?: number;
  baseSpeed?: number;
  rangeSpeed?: number;
  baseRadius?: number;
  rangeRadius?: number;
  backgroundColor?: string;
}

export const Vortex = (props: VortexProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef(null);
  const particleCount = props.particleCount || 700;
  const particlePropCount = 9;
  const particlePropsLength = particleCount * particlePropCount;
  const rangeY = props.rangeY || 100;
  const baseTTL = 50;
  const rangeTTL = 150;
  const baseSpeed = props.baseSpeed || 0.1;
  const rangeSpeed = props.rangeSpeed || 2;
  const baseRadius = props.baseRadius || 1;
  const rangeRadius = props.rangeRadius || 2;
  const baseHue = props.baseHue || 220;
  const rangeHue = 100;
  const noiseSteps = 3;
  const xOff = 0.00125;
  const yOff = 0.00125;
  const zOff = 0.0005;
  const backgroundColor = props.backgroundColor || "transparent";

  let tick = 0;
  let noise3D: any;
  let particleProps = new Float32Array(particlePropsLength);
  let center = [0, 0];

  const rand = (n: number) => n * Math.random();
  const randRange = (n: number) => n - rand(2 * n);
  const fadeInOut = (t: number, m: number) => {
    let hm = 0.5 * m;
    return Math.abs(((t + hm) % m) - hm) / hm;
  };
  const lerp = (n1: number, n2: number, speed: number) => (1 - speed) * n1 + speed * n2;

  const initParticle = (i: number) => {
    let x, y, vx, vy, life, ttl, speed, radius, hue;

    x = rand(canvas.element?.width || 800);
    y = center[1] + randRange(rangeY);
    vx = 0;
    vy = 0;
    life = 0;
    ttl = baseTTL + rand(rangeTTL);
    speed = baseSpeed + rand(rangeSpeed);
    radius = baseRadius + rand(rangeRadius);
    hue = baseHue + rand(rangeHue);

    particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
  };

  const updateParticle = (i: number) => {
    let i2 = 1 + i, i3 = 2 + i, i4 = 3 + i, i5 = 4 + i, i6 = 5 + i, i7 = 6 + i, i8 = 7 + i, i9 = 8 + i;
    let n, x, y, vx, vy, life, ttl, speed, x2, y2;

    x = particleProps[i];
    y = particleProps[i2];
    n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * Math.PI * 2;
    vx = lerp(particleProps[i3], Math.cos(n), 0.5);
    vy = lerp(particleProps[i4], Math.sin(n), 0.5);
    life = particleProps[i5];
    ttl = particleProps[i6];
    speed = particleProps[i7];
    x2 = x + vx * speed;
    y2 = y + vy * speed;

    if (x2 < 0 || x2 > (canvas.element?.width || 800) || y2 < 0 || y2 > (canvas.element?.height || 600)) {
      initParticle(i);
      return;
    }

    particleProps[i] = x2;
    particleProps[i2] = y2;
    particleProps[i3] = vx;
    particleProps[i4] = vy;
    particleProps[i5] = life;
    particleProps[i6] = ttl;
  };

  const drawParticle = (i: number) => {
    let i2 = 1 + i, i5 = 4 + i, i6 = 5 + i, i7 = 6 + i, i8 = 7 + i, i9 = 8 + i;
    let x, y, life, ttl, radius, hue, opacity;

    x = particleProps[i];
    y = particleProps[i2];
    life = particleProps[i5];
    ttl = particleProps[i6];
    radius = particleProps[i8];
    hue = particleProps[i9];

    opacity = fadeInOut(life, ttl);

    if (canvas.a) {
      canvas.a.save();
      canvas.a.lineCap = "round";
      canvas.a.lineWidth = radius;
      canvas.a.strokeStyle = `hsla(${hue},100%,60%,${opacity})`;
      canvas.a.beginPath();
      canvas.a.lineTo(x, y);
      canvas.a.stroke();
      canvas.a.closePath();
      canvas.a.restore();
    }
  };

  const drawParticles = () => {
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      updateParticle(i);
    }

    if (canvas.a) {
      canvas.a.fillStyle = backgroundColor;
      canvas.a.fillRect(0, 0, canvas.element?.width || 800, canvas.element?.height || 600);
    }

    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      drawParticle(i);
    }
  };

  const initParticles = () => {
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      initParticle(i);
    }
  };

  const resize = () => {
    if (containerRef.current && canvasRef.current) {
      canvasRef.current.width = containerRef.current.offsetWidth;
      canvasRef.current.height = containerRef.current.offsetHeight;

      center[0] = 0.5 * canvasRef.current.width;
      center[1] = 0.5 * canvasRef.current.height;
    }
  };

  let canvas: {
    a: CanvasRenderingContext2D | null | undefined;
    element?: HTMLCanvasElement | null;
  };

  const setup = () => {
    canvas = {
      a: canvasRef.current?.getContext("2d"),
      element: canvasRef.current
    };
    resize();
    initParticles();
    draw();
  };

  const draw = () => {
    tick++;

    drawParticles();

    requestAnimationFrame(draw);
  };

  useEffect(() => {
    noise3D = createNoise3D();
    setup();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={cn("relative h-full w-full", props.containerClassName)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        ref={containerRef}
        className="absolute h-full w-full inset-0"
      >
        <canvas
          ref={canvasRef}
          className={cn("absolute inset-0 pointer-events-none", props.className)}
        ></canvas>
      </motion.div>

      {props.children && (
        <div className="relative z-10">{props.children}</div>
      )}
    </div>
  );
};