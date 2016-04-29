const [BLUE, ORANGE, RED] = ['#1E9EDF', '#FE9A2E', '#C80505']



export default class Bonus {
  constructor(props){
    this.position = props.position
    this.speed = props.speed
    this.size = props.size
    this.effectCount = props.effectCount
    this.effect = props.effect
    this.action = props.effect.action
    this.heigth = props.size
    this.type = 'bonus'
    this.timer = props.timer
    this.pushEffect = props.pushEffect
  }

  destroy(state, bool){ //true if contact player
    if(bool)
      {
        // let stagEffect = state.stagEffect
        // let boolEffect= false, i = 0
        this.effect.action(this.effect.name, this.timer)
        this.effectCount()
      }
    this.delete = true
  }

  move(state)
  {
      this.position.y +=1+this.speed
  }

  setColor(){
    if(this.effect.name == 'freeze')
      return BLUE
    if(this.effect.name == 'speed')
      return RED
    if(this.effect.name == 'invincible')
      return ORANGE
  }

  render(state){
    //fall
    this.move(state)
    if ( this.position.y > state.screen.y )
        this.destroy();
    //draw
    const context = state.context
    context.save()
    context.translate(this.position.x, this.position.y)

    context.fillStyle = "fff"
    context.beginPath()
    context.arc(0, 0, this.size, 0, 2 * Math.PI, false)
    context.fill()

    context.lineWidth = 13;
    context.strokeStyle = this.setColor()
    context.stroke()

    context.font = "20pt sans-serif"
    context.fillStyle = '#fff'
    context.fillText(this.effect.name, 0, 0)
    context.closePath()

    context.restore()
  }

}
