import { Clone, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { animated, useSpringValue } from "@react-spring/three";
import { Box3, Group, Vector3 } from "three";

const tempVec3 = new Vector3();

export default function GenericItem(props: {
  gltfUrl: string;
  x: number;
  y: number;
  z: number;
  scale: number;
}) {
  const { x, y, z, gltfUrl, scale } = props;
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

  const xAnim = useSpringValue(0, {
    config: {
      mass: 0.25,
      friction: 20,
      tension: 100,
    },
  });

  useEffect(() => {
    xAnim.start(x);
  }, [x]);

  const yAnim = useSpringValue(0, {
    config: {
      mass: 0.25,
      friction: 20,
      tension: 100,
    },
  });

  useEffect(() => {
    yAnim.start(y);
  }, [y]);

  const zAnim = useSpringValue(0, {
    config: {
      mass: 0.25,
      friction: 20,
      tension: 100,
    },
  });

  useEffect(() => {
    zAnim.start(z);
  }, [z]);

  bbox.getCenter(tempVec3).multiply(size);
  const center = new Vector3(0, 0, 0).sub(tempVec3);
  const myGroupOuter = useRef<Group | null>(null);
  const myGroupInner = useRef<Group | null>(null);

  useFrame(({ clock }) => {
    if (!myGroupInner.current) {
      return;
    }
    if (!myGroupOuter.current) {
      return;
    }
    const now = clock.getElapsedTime();
    const ry = Math.sin(now) * 0.2;
    const rx = Math.sin(now * 4) * 0.05;
    myGroupInner.current.rotation.y = ry;
    myGroupInner.current.rotation.x = rx;

    myGroupOuter.current.position.x = xAnim.get();
    myGroupOuter.current.position.y = yAnim.get();
    myGroupOuter.current.position.z = zAnim.get();
  });

  return (
    <animated.group
      position={[0, 0, 0]}
      rotation={[0.75, 0.65, 0]}
      scale={scale}
      ref={myGroupOuter}
    >
      <animated.group ref={myGroupInner} scale={scaleAnim}>
        <Clone scale={size} position={center} object={nodes["Scene"]} />
      </animated.group>
    </animated.group>
  );
}
