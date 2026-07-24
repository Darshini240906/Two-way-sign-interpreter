import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Clips use assets/animation-clip.schema.json: frames[].bones[boneName] = [x,y,z,w].
export default function AvatarPanel({ active, clipUrl = "/avatar-demo.json" }) {
  const host = useRef(null);
  const [message, setMessage] = useState("loading avatar…");

  useEffect(() => {
    const element = host.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x16202c, 2.3));
    const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(2, 4, 3); scene.add(key);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100); camera.position.set(0, 1.35, 3.2);
    const lookAt = new THREE.Vector3(0, 1.05, 0), bones = new Map();
    let avatar, clip, startedAt, raf;
    // The viewport owns the canvas dimensions. Never read the canvas/window here:
    // doing so creates a layout → canvas-size → layout feedback loop.
    const resize = () => {
      const { clientWidth: width, clientHeight: height } = element;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    resize();
    const applyFrame = (frame) => Object.entries(frame.bones).forEach(([name, q]) => bones.get(name)?.quaternion.set(...q));
    const loader = new GLTFLoader();
    loader.load("/avatar.glb", (gltf) => { avatar=gltf.scene; avatar.traverse(o => { if(o.isBone) bones.set(o.name,o); }); scene.add(avatar); setMessage("avatar ready"); }, undefined, () => setMessage("could not load /avatar.glb"));
    fetch(clipUrl).then(r => r.ok ? r.json() : null).then(value => { clip=value; }).catch(() => {});
    const tick = (now) => { raf=requestAnimationFrame(tick); if (avatar) { avatar.rotation.y=Math.sin(now*.0002)*.18; camera.lookAt(lookAt); } if(active && clip?.frames?.length) { startedAt ??= now; const elapsed=((now-startedAt)/1000)%Math.max(clip.duration, .001); let i=clip.frames.findIndex(f=>f.time>=elapsed); applyFrame(clip.frames[i<0?clip.frames.length-1:i]); } else startedAt=undefined; renderer.render(scene,camera); };
    tick();
    return () => { cancelAnimationFrame(raf); resizeObserver.disconnect(); renderer.dispose(); element.removeChild(renderer.domElement); };
  }, [active, clipUrl]);

  return <div className={`relative flex h-full flex-col rounded-2xl border transition-colors duration-300 ${active ? "border-speech/60 bg-speech-dim/20" : "border-line bg-panel"}`}>
    <div className="flex items-center justify-between px-6 pt-6"><div><p className="font-mono text-xs uppercase tracking-widest text-speech">Direction B</p><h2 className="font-display text-xl text-paper">Speech &rarr; Sign</h2></div><span className={`h-2 w-2 rounded-full ${active ? "bg-speech signal-pulse" : "bg-muted/40"}`} /></div>
    <div className="mx-6 my-5 flex min-h-0 flex-1 items-center justify-center">
      <div ref={host} className="relative aspect-[3/4] w-full max-h-[28rem] overflow-hidden rounded-xl border border-line/80 bg-ink/60"><p className="pointer-events-none absolute left-3 top-3 z-10 font-mono text-[11px] text-muted">{message}</p></div>
    </div>
    <div className="border-t border-line px-6 py-4"><p className="font-mono text-[11px] uppercase tracking-widest text-muted">Transcript</p><p className="mt-2 min-h-[1.5rem] font-body text-paper/90">&nbsp;</p></div>
  </div>;
}
