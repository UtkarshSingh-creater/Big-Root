import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

export default function ThreeScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas>

        <ambientLight intensity={1} />

        <Float speed={2} rotationIntensity={2}>
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#7c3aed" />
          </mesh>
        </Float>

        <Float speed={3} rotationIntensity={3}>
          <mesh position={[3, 1, -2]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
        </Float>

        <OrbitControls enableZoom={false} />

      </Canvas>
    </div>
  );
}