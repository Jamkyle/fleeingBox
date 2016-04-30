import React, {Component} from 'react'

export default class Status extends Component{
  constructor(props){
    super(props)
  }


  render(){
    let state = this.props.states.map(function(state,i){
         return <li key={i}>{state}</li>
       })
    return (
      <ul className='cadre'>
        {state}
      </ul>

    )
  }
}
