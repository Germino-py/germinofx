import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { useRef, useState } from 'react'

function Stars(props: any) {
  const ref = useRef<THREE.Points>(null!)
  const [sphere] = useState(() => {
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
        const r = 4 + Math.random() * 6; // Rayon pour une distribution sphérique
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  });

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 20
    ref.current.rotation.y -= delta / 25
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#67e8f9" size={0.015} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  )
}

function Planet() {
    const meshRef = useRef<THREE.Mesh>(null!);
    useFrame(() => {
        meshRef.current.rotation.y += 0.001;
        meshRef.current.rotation.x += 0.0005;
    });

    return (
        <mesh ref={meshRef} scale={2}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial wireframe color="#4f46e5" />
        </mesh>
    );
}

export function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 10] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <Planet />
      <Stars />
    </Canvas>
  )
}