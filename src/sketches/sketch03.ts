import type p5Type from 'p5'
let r: number
let g: number
let b: number

export const setup = (p5: p5Type, canvasParentRef: Element): void => {
  r= p5.random(255)
  g= p5.random(255)
  b= p5.random(255)
  const frameWidth = document.getElementsByClassName('react-p5')[0].offsetWidth
  const frameHeight = document.getElementsByClassName('react-p5')[0].offsetHeight

  p5.createCanvas(frameWidth, frameHeight).parent(canvasParentRef)
}

export const draw = (p5: p5Type): void => {
  p5.fill(r,g,b)
  p5.noStroke()
  p5.rect(0,0, p5.width, p5.height)
}
