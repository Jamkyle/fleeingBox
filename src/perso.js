const keys = [37, 38, 39, 40, 81, 68,]
const [LEFT, UP, RIGHT, DOWN, Q, D] = keys
const color = ['#1E9EDF', '#FE9A2E', '#C80505']
const [BLUE, ORANGE, RED] = color


import './perso.png'
export default class Perso{
  constructor(props) // init state
    {
      this.position = props.position
      this.speed = props.speed
      this.die = props.die
      this.size = props.size
      this.playerColor = props.playerColor
      this.cmd = props.cmd

    }

    destroy(state, type){
      if(type == 'block' && !state.invincible)
        {
          this.die() // call gameOver when collision
        }
    }

    checkColor(state){
      if(state.freeze == true)
        return BLUE
      else if(state.speed == true)
        return RED
      else if(state.invincible == true)
        return ORANGE
      else
        return this.playerColor
    }
    colorStroke(state, context){
      if(state.freeze){
        context.lineWidth = 10
        context.strokeStyle = BLUE
        context.stroke()
      }
      if(state.speed)
        {context.lineWidth = 13
        context.strokeStyle = RED
        context.stroke()
        }
      if(state.invincible)
        {context.lineWidth = 15
        context.strokeStyle = ORANGE
        context.stroke()
        }


    }

  render(state)
    {
         state.speed ? this.speed = state.accelerate : this.speed = 3

      if(this.cmd == 1)
        {
        if(state.key === LEFT)
          this.position.x -=this.speed
        if(state.key === RIGHT)
          this.position.x +=this.speed
        }
        if(this.cmd == 2){
          if(state.key === A)
            id.position.x -=this.speed
          if(state.key === D)
            id.position.x +=this.speed
        }

      if(this.position.x >= state.screen.x)
        this.position.x = -this.size
      if(this.position.x < -this.size)
        this.position.x = state.screen.x

      const context = state.context

      let my_gradient=context.createLinearGradient(0,this.position.y/2,0,this.position.y+this.size)
      my_gradient.addColorStop(0,"white")
      my_gradient.addColorStop(1, this.checkColor(state))
      context.save()
      context.translate(this.position.x, 0)
      context.fillStyle = my_gradient
      context.beginPath()
      context.rect(0,this.position.y-this.size,this.size,this.size)
      if(state.effectCount > 1)
        this.colorStroke(state, context)
      // context.arc(this.size, state.screen.y-this.size/2, this.size/2, 0, 2 * Math.PI, false);
      context.closePath()
      context.fill()
      context.restore()
    }
}
