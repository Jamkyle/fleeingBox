import React, {Component} from 'react'
import Block from './block'
import Perso from './perso'
import Bonus from './bonus'


const effects = ['freeze', 'speed', 'invincible']
const BonusColor = ['#22F', '#F11', '#FE9A2E']
const [BLUE, RED, ORANGE] = BonusColor
const playerColor= ['#fff', '#aaa']

const gameOver = document.getElementsByClassName('gameover')

const keys = [37, 38, 39, 40, 81, 68,]
const [LEFT, UP, RIGHT, DOWN, Q, D] = keys
const SCRX = window.innerWidth
const SCRY = window.innerHeight

class App extends Component{
  constructor(props){
    super(props)
    this.state = {
      screen : {
        y : SCRY,
        x : SCRX
      },
      key : 0,
      context: null,
      gameOver : false,
      score : 0,
      nBlock : 1,
      niveau : 10,
      effect : {name: 'freeze'},
      freeze : false,
      invincible : false,
      speed:false,
      accelerate : 5,
      speedb : 0,
      bonusColor : '#fff',
      playerColor : ['#000', '#aaa'],
      timeEffect : null,
      effectCount: 0,
      stagEffect : []
    }
    this.effect = this.effect.bind(this)
    this.bonus = []
    this.perso = []
    this.blocks = []
    this.move = this.move.bind(this)
    this.timerInvi = null
    this.timerFreeze = null
    this.timerSpeed = null
  }

  componentDidMount(){
    const context = this.refs.canvas.getContext('2d')
    document.addEventListener('keydown', this.move) // event keyboard
    this.setState({context : context})
    this.startGame() //launch game

    requestAnimationFrame(() => {this.update()})// launch update

  }

  startGame(){
    setInterval(()=>{
      let doBonus = Math.random()*100
      if(doBonus<40){
        this.doBonus(1)
      }
      if(!this.state.freeze)
      this.doBlock(this.state.nBlock)
    },2000)
    console.log('start');
    this.setState({ //init or reinit state game
      gameOver: false,
      score : 0
    })
    this.perso = []
    this.Player(1) //create Player (multi not yet)
    this.blocks = []
    // this.makeBlock(this.state.nBlock)//make start blocks

  }
  effectCount(){
    this.setState({effectCount : this.state.effectCount+1})
  }

  pushEffect(array){
    this.setState({stagEffect : array})
  }
  addPoint(){
    let upNiveau = this.state.niveau
    if(this.state.score== upNiveau){
      this.setState({niveau: this.state.niveau*3, nBlock: this.state.nBlock+1}) //set a new niveau when niv catch
      this.doBlock(this.state.nBlock) //new blocks
    }
    if(!this.die)
      this.setState({
        score : this.state.score+1 // add Point
      })
  }

  gameOver(){
    this.setState({gameOver : true })
  }

  update(){
    if(!this.state.gameOver){const context = this.state.context
    context.save()
    context.clearRect(0, 0, this.state.screen.x, this.state.screen.y);
    this.updateObjects(this.blocks, 'blocks')
    this.updateObjects(this.bonus, 'bonus')
    this.updateObjects(this.perso, 'perso')
    this.checkCollisions(this.perso, this.blocks)
    this.checkCollisions(this.perso, this.bonus)

    context.restore()

    // Next frame
    requestAnimationFrame(() => {this.update()})}

  }
  Player(n){
    let perso = [0]
    for(let i = 0; i<n; i++)
      {
        let perso = new Perso({
          position : {
            x: this.props.posX + i*10,
            y: SCRY,
          },
          speed:3,
          die : this.gameOver.bind(this), //function call when perso die
          size: 50,
          playerColor : this.state.playerColor[i],
          cmd : i+1
        })
        this._toObject(perso, 'perso')
      }
  }

  doBonus(n){
    let bonus = []
    for(let i = 0; i<n; i++)
      {
         let bonus = new Bonus({
          position : { x: 1+ Math.random()*(SCRX-100), y:0},
          speed : 1+Math.random()*2,
          size : 20,
          effect : {action: this.effect.bind(this), name: effects[Math.round(Math.random()*2)]},
          timer : this.state.timeEffect,
          effectCount : this.effectCount.bind(this),
          pushEffect : this.pushEffect.bind(this)
        })
        this._toObject(bonus, 'bonus')
      }
  }

  doBlock(n){
    let blocks = []
    for(let i = 0; i<n; i++)
      {
         let block = new Block({
          position : { x: 1+ Math.random()*(SCRX-100), y:0},
          speed : 1+Math.random()*2,
          size : 40+Math.floor(Math.random()*100),
          addPoint : this.addPoint.bind(this)
        })
        this._toObject(block, 'blocks')
      }
  }

  effect(name){
    let freeze, speed, invin
    // let effect = {name: 'freeze'}
    // this.setState({effect: effect})
    if(name === "freeze"){
    if(!this.state.freeze){
        this.setState({freeze: true, bonusColor : BLUE
        })
      freeze = setTimeout(()=>{
          this.setState({freeze : false, effectCount: this.state.effectCount-1})
          this.state.stagEffect.splice()
        }, 3000)
      this.timerFreeze = freeze
      }
    else {
        clearTimeout(this.timerFreeze)
        this.timerFreeze = setTimeout(()=>{
            this.setState({freeze : false, effectCount: this.state.effectCount-1})
          }, 3000)
        }
      }
    if(name === "speed"){
    if(!this.state.speed){
        this.setState({speed: true, bonusColor : RED
        })
      speed = setTimeout(()=>{
          this.setState({speed : false, effectCount: this.state.effectCount-1})
        }, 5000)
      this.timerSpeed = speed
      }
    else {
        clearTimeout(this.timerSpeed)
        this.timerSpeed = setTimeout(()=>{
            this.setState({speed : false, effectCount: this.state.effectCount-1})
          }, 5000)
        }
      }
    if(name === "invincible")
      {
        if(!this.state.invincible){
            this.setState({invincible: true, bonusColor : ORANGE
            })
          invin = setTimeout(()=>{
              this.setState({invincible : false, effectCount: this.state.effectCount-1})
              console.log('time');
            }, 10000)
          this.timerInvi = invin
          }
        else {
            clearTimeout(this.timerInvi)
            this.timerInvi = setTimeout(()=>{
                this.setState({invincible : false, effectCount: this.state.effectCount-1})
                console.log('time');
              }, 10000)
            console.log('clear');
          }
      }
  }

  move({keyCode}){
    // console.log(keyCode);
    if(keyCode === LEFT)
      this.setState({key : keyCode})
    if(keyCode === RIGHT)
      this.setState({key: keyCode})
    if(keyCode === Q)
      this.setState({key : keyCode})
    if(keyCode === D)
      this.setState({key : keyCode})

  }

  _toObject(item, group){
    this[group].push(item);
  }

  updateObjects(items, group){
    let i = 0;
    for (let item of items) {
      if(!item.delete)
        item.render(this.state)
      else
        this[group].splice(i,1)
      i++
    }
  }


  checkCollisions(items1, items2) {
    // console.log(items1);
    var a = items1.length - 1
    var b
    for(a; a > -1; --a){
      b = items2.length - 1
      for(b; b > -1; --b){
        var item1 = items1[a]
        var item2 = items2[b]
        if(this.isCollide(item1, item2)){
          item1.destroy(this.state, item2.type)
          item2.destroy(this.state, this.isCollide(item1, item2))
        }
      }
    }
  }

  isCollide(obj1, obj2){
    if(
        ((obj1.position.y + obj1.size) <= (obj2.position.y)) ||
        (obj1.position.y-obj1.size >= (obj2.position.y+obj2.heigth )) ||
        ((obj1.position.x + obj1.size) <= obj2.position.x) ||
        (obj1.position.x >= (obj2.position.x + obj2.size))
      ) return false
      else
        return true
  }

  render(){
 let gameOver
    if(this.state.gameOver)
      {
      gameOver=( <div className='gameover'>
          <div className='inner'>
            <span className='fnEnd'>GameOver</span>
            <p>Votre score : {this.state.score}</p>
          </div>
        </div>)
    }

    return(
        <div id='scene'>
      {gameOver}
          <canvas ref='canvas' className='scene' width={SCRX} height={SCRY}/>
          <div id='score' className='score'>Score : {this.state.score}</div>
        </div>)

  }
}

App.defaultProps = {
  posX: Math.round(SCRX/2),
  posY: SCRY-50
}

export default App
