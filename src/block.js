const color = ['#f11', '#15f', '#f1f', '#aaa', '#333']


export default class Block {
  constructor(props){
    this.position = props.position
    this.speed = props.speed
    this.size = props.size
    this.color = color[Math.round(Math.random()*4)]
    this.addPoint = props.addPoint
    this.heigth = 50
    this.type = 'block'
  }

  destroy(state){
    this.delete = true
    this.addPoint()


    // this.position.y = 0
    // this.position.x = Math.round(Math.random()*state.screen.x-100)
    // this.color = color[Math.round(Math.random()*4)]
  }

  move(state)
  {
    if(!state.freeze)
      this.position.y +=1+this.speed
  }

  render(state){
    //fall
    this.move(state)
    if ( this.position.y > state.screen.y )
        this.destroy(state);
    //draw
    const context = state.context
    context.save()
    context.translate(this.position.x, this.position.y)
    context.fillStyle = this.color
    context.fillRect(0, 0, this.size, this.heigth)
    context.restore()
  }

}
