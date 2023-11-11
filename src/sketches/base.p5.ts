import type p5Type from 'p5'

let x = 50
let y = 50

const canvasX = 500
const canvasY = 500

const sketch = (p5: p5Type) => {
  p5.setup = () => {
    p5.createCanvas(canvasX, canvasY)
  }

  p5.draw = () => {
    p5.background(0)
    p5.fill(255)
    p5.rect(x, y, 50, 50)
  }
}

export default sketch
