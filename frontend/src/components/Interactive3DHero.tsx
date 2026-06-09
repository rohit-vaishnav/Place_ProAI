import React, { useEffect, useRef, useState } from "react";

export default function Interactive3DHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 350, height: 350 });

  // Mouse & rotation tracking refs
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const rotRef = useRef({ x: 0.4, y: 0.6, speedX: 0.005, speedY: 0.007 });
  const impulseRef = useRef(1.0);
  const scrollRef = useRef(0);
  const waveRef = useRef({ radius: 0, opacity: 0, active: false });

  // Math coordinates for a 3D Icosahedron
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
  ];

  // Scale vertices to make the shape larger
  const baseScale = 50;
  const scaledVertices = vertices.map(v => [v[0] * baseScale, v[1] * baseScale, v[2] * baseScale]);

  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];

  // Handle window resizing to make the canvas responsive
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const size = Math.min(rect.width, 350);
        setDimensions({ width: size, height: size });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track scroll position for scaling parallax
  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const render = () => {
      time += 0.02;

      // 1. Clear Canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      // 2. Parallax scale factor based on scroll offset
      const maxScroll = 500;
      const scrollFactor = Math.max(0.4, 1 - Math.min(scrollRef.current / maxScroll, 0.6));
      
      // Float animation
      const floatOffsetY = Math.sin(time) * 10 - (scrollRef.current * 0.15);

      // 3. Smooth cursor tracking interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // 4. Update base rotation velocities + cursor tilt
      const hoverMultiplier = isHovered ? 2.2 : 1.0;
      impulseRef.current += (1.0 - impulseRef.current) * 0.02; // Decay click impulse back to normal
      
      rotRef.current.y += rotRef.current.speedY * hoverMultiplier * impulseRef.current;
      rotRef.current.x += rotRef.current.speedX * hoverMultiplier * impulseRef.current;

      const angleY = rotRef.current.y + (mouseRef.current.x * 0.4);
      const angleX = rotRef.current.x + (mouseRef.current.y * 0.4);

      // Rotation matrix values
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // 5. Rotate and project vertices of central crystal
      const projectedCrystal: { x: number; y: number; z: number; ox: number; oy: number; oz: number }[] = [];
      const camDist = 300;

      scaledVertices.forEach(([vx, vy, vz]) => {
        // Rotate around Y axis
        let x1 = vx * cosY - vz * sinY;
        let z1 = vx * sinY + vz * cosY;

        // Rotate around X axis
        let y2 = vy * cosX - z1 * sinX;
        let z2 = vy * sinX + z1 * cosX;

        // Apply scale factor (for parallax scroll + float)
        const scale = scrollFactor;
        const rx = x1 * scale;
        const ry = y2 * scale;
        const rz = z2 * scale;

        // 3D Perspective Projection
        const distanceProj = camDist / (camDist + rz);
        const px = centerX + rx * distanceProj;
        const py = centerY + ry * distanceProj + floatOffsetY;

        projectedCrystal.push({ x: px, y: py, z: rz, ox: rx, oy: ry, oz: rz });
      });

      // 6. Generate, rotate and project Orbiting Satellites (Representing placements/jobs orbiting)
      const satellitesCount = 5;
      const projectedSatellites: { x: number; y: number; z: number; ox: number; oy: number; oz: number; id: number }[] = [];

      for (let i = 0; i < satellitesCount; i++) {
        // Calculate dynamic orbit angles
        const orbitSpeed = 0.008 + i * 0.003;
        const angle = time * orbitSpeed * hoverMultiplier + (i * Math.PI * 2) / satellitesCount;
        const elevation = Math.sin(time * 0.004 + i) * 0.4 + Math.PI / 2; // Hover tilt angle
        const radius = (95 + i * 12) * scrollFactor;

        // 3D coordinates relative to center
        const sx = radius * Math.cos(angle) * Math.sin(elevation);
        const sy = radius * Math.sin(angle) * Math.sin(elevation);
        const sz = radius * Math.cos(elevation);

        // Rotate satellites using the same rotation matrix so they orbit in 3D sync
        let x1 = sx * cosY - sz * sinY;
        let z1 = sx * sinY + sz * cosY;
        let y2 = sy * cosX - z1 * sinX;
        let z2 = sy * sinX + z1 * cosX;

        // 3D Perspective Projection
        const distanceProj = camDist / (camDist + z2);
        const px = centerX + x1 * distanceProj;
        const py = centerY + y2 * distanceProj + floatOffsetY;

        projectedSatellites.push({ x: px, y: py, z: z2, ox: x1, oy: y2, oz: z2, id: i });
      }

      // 7. Update and Project 3D Click Shockwave Ring
      let projectedWavePoints: { x: number; y: number; z: number }[] = [];
      const wave = waveRef.current;
      if (wave.active) {
        wave.radius += 5 * hoverMultiplier;
        wave.opacity -= 0.018;
        if (wave.opacity <= 0) {
          wave.active = false;
        } else {
          const pointsCount = 32;
          for (let i = 0; i < pointsCount; i++) {
            const angle = (i * Math.PI * 2) / pointsCount;
            // Draw circle in XZ plane
            const wx = wave.radius * Math.cos(angle) * scrollFactor;
            const wy = 0;
            const wz = wave.radius * Math.sin(angle) * scrollFactor;

            // Rotate
            let x1 = wx * cosY - wz * sinY;
            let z1 = wx * sinY + wz * cosY;
            let y2 = wy * cosX - z1 * sinX;
            let z2 = wy * sinX + z1 * cosX;

            const distanceProj = camDist / (camDist + z2);
            const px = centerX + x1 * distanceProj;
            const py = centerY + y2 * distanceProj + floatOffsetY;

            projectedWavePoints.push({ x: px, y: py, z: z2 });
          }
        }
      }

      // 8. Draw Shockwave Ring (Behind or In Front based on depth Z)
      if (wave.active && projectedWavePoints.length > 0) {
        ctx.beginPath();
        projectedWavePoints.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.strokeStyle = `rgba(139, 92, 246, ${wave.opacity * 0.45})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 9. Draw faces with depth sorting (Painters Algorithm)
      const sortedFaces = faces
        .map((face, index) => {
          const zDepth = (projectedCrystal[face[0]].z + projectedCrystal[face[1]].z + projectedCrystal[face[2]].z) / 3;
          return { face, index, zDepth };
        })
        .sort((a, b) => b.zDepth - a.zDepth); // Sort back to front

      // Light vector (shines from top-right front)
      const lightSource = { x: 0.5, y: -0.5, z: -0.7 };
      const mag = Math.sqrt(lightSource.x ** 2 + lightSource.y ** 2 + lightSource.z ** 2);
      lightSource.x /= mag;
      lightSource.y /= mag;
      lightSource.z /= mag;

      sortedFaces.forEach(({ face }) => {
        const p0 = projectedCrystal[face[0]];
        const p1 = projectedCrystal[face[1]];
        const p2 = projectedCrystal[face[2]];

        const ux = p1.x - p0.x;
        const uy = p1.y - p0.y;
        const vx = p2.x - p0.x;
        const vy = p2.y - p0.y;
        
        const normalZ = ux * vy - uy * vx;

        // Back-face culling
        if (normalZ < 0) {
          const ax = scaledVertices[face[1]][0] - scaledVertices[face[0]][0];
          const ay = scaledVertices[face[1]][1] - scaledVertices[face[0]][1];
          const az = scaledVertices[face[1]][2] - scaledVertices[face[0]][2];

          const bx = scaledVertices[face[2]][0] - scaledVertices[face[0]][0];
          const by = scaledVertices[face[2]][1] - scaledVertices[face[0]][1];
          const bz = scaledVertices[face[2]][2] - scaledVertices[face[0]][2];

          let nx = ay * bz - az * by;
          let ny = az * bx - ax * bz;
          let nz = ax * by - ay * bx;

          const nMag = Math.sqrt(nx ** 2 + ny ** 2 + nz ** 2);
          nx /= nMag;
          ny /= nMag;
          nz /= nMag;

          // Rotate normal coordinates
          let rnx = nx * cosY - nz * sinY;
          let rnz = nx * sinY + nz * cosY;
          let rny = ny * cosX - rnz * sinX;
          rnz = ny * sinX + rnz * cosX;

          const dotProduct = rnx * lightSource.x + rny * lightSource.y + rnz * lightSource.z;
          const brightness = Math.max(0.1, (dotProduct + 1) / 2); // Map -1..1 to 0.1..1

          // Render Face
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.closePath();

          const isDark = document.documentElement.getAttribute("data-theme") !== "light";
          let fillStyleStr = "";
          let strokeStyleStr = "";

          if (isDark) {
            const rVal = Math.round(30 + brightness * 50);    // Deep slate indigo
            const gVal = Math.round(58 + brightness * 40);
            const bVal = Math.round(138 + brightness * 90);
            fillStyleStr = `rgba(${rVal}, ${gVal}, ${bVal}, ${isHovered ? 0.22 : 0.12})`;
            strokeStyleStr = `rgba(139, 92, 246, ${isHovered ? 0.45 : 0.22})`; // Purple/Violet
          } else {
            const rVal = Math.round(79 + brightness * 40);    // Light mode indigo
            const gVal = Math.round(70 + brightness * 50);
            const bVal = Math.round(229 + brightness * 20);
            fillStyleStr = `rgba(${rVal}, ${gVal}, ${bVal}, ${isHovered ? 0.16 : 0.08})`;
            strokeStyleStr = `rgba(79, 70, 229, ${isHovered ? 0.35 : 0.16})`; // Indigo
          }

          ctx.fillStyle = fillStyleStr;
          ctx.fill();

          ctx.strokeStyle = strokeStyleStr;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // 10. Draw Lasers & Connections (Dynamic 3D Laser paths between satellites and closest vertices)
      projectedSatellites.forEach(sat => {
        // Find nearest crystal vertex in rotated 3D space
        let minD = Infinity;
        let targetVertex = projectedCrystal[0];

        projectedCrystal.forEach(v => {
          const dx = sat.ox - v.ox;
          const dy = sat.oy - v.oy;
          const dz = sat.oz - v.oz;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < minD) {
            minD = dist;
            targetVertex = v;
          }
        });

        // Pulsing laser lines (Emerald Green matching placement success)
        const alpha = isHovered 
          ? 0.35 + Math.sin(time * 12 + sat.id) * 0.15 
          : 0.15 + Math.sin(time * 6 + sat.id) * 0.05;

        ctx.beginPath();
        ctx.moveTo(sat.x, sat.y);
        ctx.lineTo(targetVertex.x, targetVertex.y);
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`; // Emerald success color laser
        ctx.lineWidth = isHovered ? 1.5 : 1;
        ctx.setLineDash([4, 4]); // Dashed networking path
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Draw laser head pulse traveling along connection line
        const travelRatio = (time * 0.8 + sat.id * 0.2) % 1.0;
        const pulseX = sat.x + (targetVertex.x - sat.x) * travelRatio;
        const pulseY = sat.y + (targetVertex.y - sat.y) * travelRatio;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#10B981"; // Pulsing green laser packet
        ctx.fill();
      });

      // 11. Draw Node Vertices (glowy tech junctions)
      const isDark = document.documentElement.getAttribute("data-theme") !== "light";
      const nodeColor = isDark
        ? (isHovered ? "#C084FC" : "#8B5CF6")
        : (isHovered ? "#8B5CF6" : "#4F46E5");

      projectedCrystal.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, isHovered ? 3.5 : 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = nodeColor;
        ctx.shadowBlur = isHovered ? 12 : 4;
        ctx.shadowColor = nodeColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 12. Draw Orbiting Satellites (Emerald Green Nodes representing active company opportunities)
      projectedSatellites.forEach(sat => {
        // Draw satellite core sphere
        ctx.beginPath();
        ctx.arc(sat.x, sat.y, isHovered ? 4.5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#10B981"; // Emerald green
        ctx.shadowBlur = isHovered ? 14 : 6;
        ctx.shadowColor = "#10B981";
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw outer orbit ring outline
        ctx.beginPath();
        ctx.arc(sat.x, sat.y, isHovered ? 8 : 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [dimensions, isHovered]);

  // Handle Mouse movements inside container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2); // Normalize -1 to 1
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  };

  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Shockwave ring on click
  const handleCanvasClick = () => {
    impulseRef.current = 4.0;
    waveRef.current = { radius: 10, opacity: 1.0, active: true };
  };

  // Touch handlers for mobile
  const touchStartRef = useRef({ x: 0, y: 0 });
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setIsHovered(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.touches[0].clientX - touchStartRef.current.x) / (rect.width / 2);
      const dy = (e.touches[0].clientY - touchStartRef.current.y) / (rect.height / 2);
      mouseRef.current.targetX = Math.max(-1, Math.min(dx, 1));
      mouseRef.current.targetY = Math.max(-1, Math.min(dy, 1));
    }
  };

  const handleTouchEnd = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex justify-center items-center cursor-pointer w-full h-[350px] overflow-hidden group select-none"
      style={{ touchAction: "none" }}
    >
      {/* Glow effect background */}
      <div 
        className={`absolute w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isHovered ? "opacity-100 scale-125" : "opacity-60 scale-100"
        }`} 
      />

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        role="img"
        aria-label="Interactive 3D rotating faceted indigo crystal representing PlacePro placement database with orbiting recruiter opportunity nodes. Tilt cursor or click to trigger shockwaves."
        className="z-10 transition-all duration-300"
        style={{
          filter: isHovered 
            ? "drop-shadow(0 0 20px rgba(139, 92, 246, 0.45))" 
            : "drop-shadow(0 0 8px rgba(79, 70, 229, 0.15))"
        }}
      >
        <div className="sr-only">
          <h4>Interactive 3D Placement Crystal</h4>
          <p>
            An animated geometric faceted crystal rotating in 3D perspective space with green orbiting recruiter nodes.
            Moving the mouse tilts the crystal, scrolling down shrinks it, and clicking increases its rotation speed while generating an expanding wave.
          </p>
        </div>
      </canvas>
    </div>
  );
}
