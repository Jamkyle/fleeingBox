import React, {Component} from 'react'

export default class Button extends Component{

  render(){
      return <p className='btn' onClick={this.props.startGame}>PLAY AGAIN</p>


  }

}
