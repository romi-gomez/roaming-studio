import style from '@/styles/GalleryFrame.module.css';
import SketchComponent from './SketchComponent';

const GalleryFrame = (props:any) => {
  return (
    <section className = {style.galleryFrame}>
      <SketchComponent setup={props.setup} draw={props.draw}/>
    </section>
  );
};

export default GalleryFrame;
