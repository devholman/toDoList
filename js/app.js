// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
// -- browserify-hmr having install issues right now
// if (module.hot) {
//     module.hot.accept()
//     module.hot.dispose(() => {
//         app()
//     })
// }

// Check for ServiceWorker support before trying to install it
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./serviceworker.js').then(() => {
//         // Registration was successful
//         console.info('registration success')
//     }).catch(() => {
//         console.error('registration failed')
//             // Registration failed
//     })
// } else {
//     // No ServiceWorker Support
// }
import Backbone from 'backbone'
import $ from 'jquery'
import _ from 'underscore'

import DOM from 'react-dom'
import React, {Component} from 'react'

function app() {

    // start app
    // new Router()

    var ToDoRouter = Backbone.Router.extend({
    	routes: {
    		"all" 	  : "handleAll",
    		"yes" 	  : "handleYes",
    		"no"  	  : "handleNo",
    		"*Default": "handleAll"
    	},

    	handleAll: function() {
    		DOM.render(<ToDoViewController toDoData={new ListingCollection()}/>, document.querySelector('.container'))
    	},

    	initialize: function(){
    		Backbone.history.start();
    	}
    })

    var ListingModel = Backbone.Model.extend({
    	defaults: {
    		status:"To Do"
    	},

    	initialize: function(newItem){
    		this.set({newItem: newItem})
    	}
    })

    var ListingCollection = Backbone.Collection.extend({
    	model: ListingModel
    })

    var ToDoViewController = React.createClass({
    		
    		_addItem: function(newItem){
    			this.state.toDoData.add(new ListingModel(newItem))

    			this.setState({  //how is this passed down to the props on toDoList???
    				toDoData: this.state.toDoData
    			})
    		},

    		_removeItem: function(model){
    			// console.log("remover func", this)
    			this.state.toDoData.remove(model)
    			this._updater()
    		},

    		_updater: function(){
    			this.setState({
    				toDoData: this.state.toDoData
    			})
    		},

    		_genButtons: function(){
    			var btns =["All","To Do","Done"].map(function(toDoStatus,id){
    				return <button key={id} onClick={this._filterView} value={toDoStatus}>{toDoStatus}</button>
    			}.bind(this))
    			return btns
    		},

    		_filterView: function(event){
    			var buttonView = event.target.value
    				this.setState({
    					viewType:buttonView
    				})
    		},

    		getInitialState: function(){  //puts the data from the collection on state
    			return{    
    				toDoData: this.props.toDoData,
    				viewType: "All" 
    			}
    		},

    		render: function(){
    			console.log("From AppView Render:", this.props.toDoData)
				var toDoData = this.state.toDoData
				if(this.state.viewType === "All")   toDoData=toDoData.where({status:"all"})
				if(this.state.viewType === "To Do") toDoData=toDoData.where({status:"To Do"})
				if(this.state.viewType === "Done")  toDoData=toDoData.where({status:"Done"})




				return(
					<div className="content-container">
							<div className="view-buttons">{this._genButtons()}</div>
							<ItemAdder adderFunc={this._addItem}/>
							<ToDoList doData={this.state.toDoData} updater={this._updater} remover={this._removeItem}/>
					</div>
				)
			}
    })

    var ItemAdder = React.createClass({
    		
    	_handleKeyDown: function(keyEvent){
    		if(keyEvent.keyCode ===13){
    			var toDoItem = keyEvent.target.value
    			this.props.adderFunc(toDoItem)
    			keyEvent.target.value=''
    		}
    	},

    	render: function(){
    		return(
    			<input className="search-bar" onKeyDown={this._handleKeyDown}></input>
    		)
    	}
    })

    var ToDoList = React.createClass({
    	
    	_makeItem: function(model,index){
    		return <ToDoItem key={index} item={model} updater = {this.props.updater} remover={this.props.remover}/>
    	},

    	render: function(){
    		// console.log("From Controller:", this.props.doData)
    		
    		return(
    			<div>
    				{this.props.doData.map(this._makeItem)}
    			</div>
    		)
    	}

    })

    var ToDoItem = React.createClass({

    	getInitialState: function(){
    		return{
    			isDone: false
    		}
    	},

    	_clickHandler: function(){
    		this.props.remover(this.props.item)
    	},

    	_lineThrough: function(){
    		if(this.state.isDone){ //if false
    			this.setState({
    				isDone:false
    			})
    		}else{
    			this.setState({
    				isDone:true
    			})
    		}
    		// this.props.updater()
    	},

    	// _selectStatus: function(event){
    	// 	var newStat = event.target.value
    	// 	this.props.item.set({status:newStat})
    	// 	this.props.updater()
    	// },

    	render: function(){
    		// console.log("to do item", this)
    		var btnTxt, lineThru

    		if(this.state.isDone){
    			btnTxt="Not Done"
    			// lineThru={"text-decoration":"line-through"}
    			lineThru={background:"red"}

    		}else{
    			btnTxt="Done"
    			lineThru={background: "red"}
    		}

    		return(
	    			<div className="item-container">
	    				<p className="item-text">{this.props.item.get("newItem")}</p>
	    				<div className="item-butt-container">
	    					<button className="done-button" onClick={this._lineThrough}>{btnTxt}</button>
	    					<button className="remove-button" onClick={this._clickHandler}>Remove</button>
	    				</div>
	    			</div>
    		)
    	}
    })


    var app = new ToDoRouter()
}


app()

