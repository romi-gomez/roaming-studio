import style from '@/styles/Gallery.module.css';
import GalleryFrame from './GalleryFrame';

const frames = [
  {
    title: "The 3D Gallery",
    setup: require("@/sketches/sketch01").setup,
    draw: require("@/sketches/sketch01").draw
  },
  {
    title: "The 3D Gallery",
    setup: require("@/sketches/sketch02").setup,
    draw: require("@/sketches/sketch02").draw
  },
  {
    title: "The 3D Gallery",
    setup: require("@/sketches/sketch03").setup,
    draw: require("@/sketches/sketch03").draw
  },
  {
    title: "The 3D Gallery",
    setup: require("@/sketches/sketch04").setup,
    draw: require("@/sketches/sketch04").draw
  },
  {
    title: "The 3D Gallery",
    setup: require("@/sketches/sketch05").setup,
    draw: require("@/sketches/sketch05").draw
  },
  {
    title: "The 3D Gallery",
    setup: require("@/sketches/sketch06").setup,
    draw: require("@/sketches/sketch06").draw
  }
]

const Gallery = () => {
  return (
    <section className = {style.gallery}>
      <div className = {style.framesContainer}>
      {frames.map((frame, index) => (
        <GalleryFrame key = {index} title = {frame.title} setup = {frame.setup} draw = {frame.draw} />
      ))}
      </div>
    </section>
  );
};

export default Gallery;
