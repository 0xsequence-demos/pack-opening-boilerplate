import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import { animated, useSpringValue } from "@react-spring/three";
import { useEffect } from "react";
import { useRef } from "react";
import { Group } from "three";

export default function TiltyCamera(props: { lookUp: boolean }) {
  const { lookUp } = props;
  const camRotAnim = useSpringValue(0, {
    config: {
      mass: 0.25,
      friction: 7,
      tension: 15,
    },
  });

  useEffect(() => {
    camRotAnim.start(lookUp ? 1 : 0);
  });
  const myGroupInner = useRef<Group | null>(null);

  useFrame(() => {
    if (myGroupInner.current) {
      myGroupInner.current.rotation.x = camRotAnim.get() * 0.5;
      myGroupInner.current.position.y = camRotAnim.get() * 2;
    }
  });

  return (
    <animated.group
      ref={myGroupInner}
      rotation={[0.75, 0, 0]}
      position={[0, 0, 5]}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={75} />
    </animated.group>
  );
}
