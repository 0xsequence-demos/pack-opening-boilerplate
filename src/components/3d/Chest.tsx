import { Clone, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { animated, useSpringValue } from "@react-spring/three";
import { Box3, Group, Object3D, Vector3 } from "three";
import MyShaderMaterial, { IMyShaderMaterial } from "./MyShaderMaterial";

void MyShaderMaterial;

const tempVec3 = new Vector3();

export default function Chest(props: {
  gltfUrl: string;
  x: number;
  y: number;
  z: number;
  scale: number;
  shaking?: boolean;
  busy?: boolean;
  open?: boolean;
  underlit?: boolean;
  red?: boolean;
  innerLight?: boolean;
}) {
  const {
    shaking,
    busy,
    open,
    underlit,
    red,
    innerLight,
    x,
    y,
    z,
    gltfUrl,
    scale,
  } = props;
  const { nodes } = useGLTF(gltfUrl);
  const bbox = new Box3();
  if (nodes["Scene"]) {
    bbox.setFromObject(nodes["Scene"]);
  }
  bbox.getSize(tempVec3);
  const largestSize = Math.max(tempVec3.x, Math.max(tempVec3.y, tempVec3.z));
  const size = new Vector3(5, 5, 5).divideScalar(largestSize);

  const scaleAnim = useSpringValue(0, {
    config: {
      mass: 0.25,
      friction: 5,
      tension: 100,
    },
  });

  useEffect(() => {
    scaleAnim.start(1);
  });

  const lidOpen = useSpringValue(0, {
    config: {
      mass: 0.25,
      friction: 5,
      tension: 100,
    },
  });
  useEffect(() => {
    lidOpen.start(open ? 2 : 0);
  }, [open]);

  const xAnim = useSpringValue(10, {
    config: {
      mass: 0.25,
      friction: 20,
      tension: 100,
    },
  });

  useEffect(() => {
    xAnim.start(x);
  });

  bbox.getCenter(tempVec3).multiply(size);
  const center = new Vector3(0, 0, 0).sub(tempVec3);
  const myGroupOuter = useRef<Group | null>(null);
  const myGroupInner = useRef<Group | null>(null);

  const ringRef = useRef<Object3D>(null);
  const ringMatRef = useRef<IMyShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (!myGroupInner.current) {
      return;
    }
    const now = clock.getElapsedTime();
    if (ringMatRef.current) {
      ringMatRef.current.uTime = now * 0.75;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = now * 4;
    }
    let ry = Math.sin(now) * 0.2;
    let rx = Math.sin(now * 4) * 0.05;
    let lidJiggle = 0;
    if (shaking) {
      rx += Math.sin(now * 36 + Math.sin(now * 4) * 3) * 0.05;
      ry += Math.cos(now * 21 + Math.sin(now) * 1.5) * 0.025;
      const then = now - 0.05;
      lidJiggle += Math.sin(then * 36 + Math.sin(then * 4) * 3) * 0.01 - 0.0035;
    }
    myGroupInner.current.rotation.y = ry;
    myGroupInner.current.rotation.x = rx;
    let lid: Object3D | undefined;
    try {
      lid = myGroupInner.current.children[0].children[0].children[0];
    } catch (_e) {
      void _e;
      //
    }
    if (lid) {
      lid.rotation.x = lidOpen.get() - lidJiggle;
    }
    if (myGroupOuter.current) {
      myGroupOuter.current.position.x = xAnim.get();
    }
  });

  const s = scale;

  return (
    <animated.group
      ref={myGroupOuter}
      position={[x, y, z]}
      rotation={[0.25, 0.65, 0]}
      scale={s}
    >
      <animated.group ref={myGroupInner} scale={scaleAnim}>
        <Clone scale={size} position={center} object={nodes["Scene"]} />
        {busy && (
          <>
            <mesh ref={ringRef} position={[0, 0.45, 1.7]}>
              <planeGeometry args={[2, 1, 32]} />
              <myShaderMaterial ref={ringMatRef} key={MyShaderMaterial.key} />
            </mesh>
            <pointLight
              position={[0, 0.4, 1.95]}
              intensity={50}
              color={[0.3, 0.8, 1]}
            />
          </>
        )}
        {innerLight && (
          <>
            <mesh position={[0, -1, 0]}>
              <boxGeometry args={[4, 1, 3]} />
              <meshBasicMaterial color={[5, 4, 2]} />
            </mesh>
            <pointLight
              position={[0, 0, 0]}
              intensity={100}
              color={[1, 0.8, 0.3]}
            />
          </>
        )}
        {underlit && (
          <mesh position={[0, 0.3, -0.15]}>
            <boxGeometry args={[4.6, 0.01, 3.365]} />
            <meshBasicMaterial color={[25, 20, 10]} />
          </mesh>
        )}
      </animated.group>
      {underlit && (
        <>
          <mesh
            ref={ringRef}
            position={[0, -2, -0.75]}
            scale={[3.5, 3.5, 3.5]}
            rotation={[Math.PI * -0.5, 0, 0]}
          >
            <planeGeometry args={[2, 1, 32]} />
            <myShaderMaterial ref={ringMatRef} key={MyShaderMaterial.key} />
          </mesh>
          <pointLight
            position={[0, -8, 2]}
            intensity={500}
            color={[0.3, 0.8, 1]}
          />
        </>
      )}
      {red && (
        <pointLight
          position={[-5, -8, 2]}
          intensity={5000}
          color={[2, 0.2, 0.1]}
        />
      )}
    </animated.group>
  );
}
