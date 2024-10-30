import SketchComponent from './SketchComponent';

const GalleryFrame = (props: any) => {
  return (
    <section className="w-[200px] h-[320px] bg-white shadow-lg rounded-md flex items-center justify-center overflow-hidden">
      <div className="w-full h-full">
        <SketchComponent setup={props.setup} draw={props.draw} />
      </div>
    </section>
  );
};

export default GalleryFrame;
