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
import BackboneFire from 'bbfire'



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
    		var ToDoCollection = new ListingCollection()
 
    		DOM.render(<ToDoViewController toDoData={new ListingCollection() }/>, document.querySelector('.container'))
    	},

    	initialize: function(){
    		// console.log(BackboneFire)

    		// var UserCollection = BackboneFire.Firebase.Collection.extend({
    		// 	url: "https://todo4u.firebaseio.com/"
    		// })
    		// var myCollection = new UserCollection()

    		// myCollection.on("sync", function(){
    		// 	console.log(myCollection)
    		// })


    		Backbone.history.start();
    	}
    })

    var ListingModel = Backbone.Model.extend({
    	defaults: {
    		status:"To Do",
    		done: false
    	}
    })

    var ListingCollection = BackboneFire.Firebase.Collection.extend({
    	model: ListingModel,
    	url: "https://devynstodo.firebaseio.com/stilltodo/"
    })

    // var newCollection = new ListingCollection()
    // var mod = new ListingModel({id: "devyn"}) 
    // console.log(mod)
    // var mod2 = new ListingModel() 
    // mod2.set({id:'boaz'})
    // console.log(mod2)
    // newCollection.add(mod)
    // newCollection.add(mod2)


    var ToDoViewController = React.createClass({
    		
    		_addItem: function(taskText){
    			this.state.toDoData.add({task:taskText})

    			this.setState({  //how is this passed down to the props on toDoList???
    				toDoData: this.state.toDoData
    			})
    		},

    		comonentWillMount:function(){
    			var self = this
    			this.props.toDoData.on('sync',function(){self.forceUpdate()})
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
				var modelsShowing = this.state.toDoData.models
				if(this.state.viewType === "To Do") modelsShowing= this.state.toDoData.where({done: false}) //you are not done
				if(this.state.viewType === "Done")  modelsShowing= this.state.toDoData.where({done: true}) // you are done


				console.log(modelsShowing)

				return(
					<div className="content-container">
							<Header />
							<ItemAdder adderFunc={this._addItem} updater={this._updater} />
							<div className="view-buttons">{this._genButtons()}</div>
							<ToDoList doData={modelsShowing} updater={this._updater} remover={this._removeItem} />
					</div>
				)
			}
    })
    var Header = React.createClass({
    	render:function(){
    		return(
    			<div className="header-container">
    				<h2>Super Simple To Do List</h2>
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
    			<input className="search-bar" placeholder="Type in a Task" onKeyDown={this._handleKeyDown}></input>
    		)
    	}
    })

    var ToDoList = React.createClass({
    	
    	_makeItem: function(model,index){
    		return <ToDoItem key={index} item={model} updater={this.props.updater} remover={this.props.remover} />
    	},

    	render: function(){
    		// console.log("From Controller:", this.props.doData)
    		
    		return(
    			<div className="item-container-container">
    				{this.props.doData.map(this._makeItem)}
    			</div>
    		)
    	}

    })

    var ToDoItem = React.createClass({


    	_clickHandler: function(){
    		this.props.remover(this.props.item)
    	},

    	_lineThrough: function(){
    		if(this.props.item.get("done")){ //if false - you are not done
    			this.props.item.set({"done":false})
    		}else{
    			this.props.item.set({"done":true}) // you are done
    			}
    		this.props.updater()
    	},

    	render: function(){
    		// console.log("to do item", this)

    		var btnTxt,
    			itemTxtCssClass = "item-text"

    		if(this.props.item.get("done")){ //done -- done is false or you are not done
    			btnTxt="Not Done"
    			itemTxtCssClass += " completed"  // className="item-text completed"

       		}else{
    			btnTxt="Mark as Done"  // you are done
    		}

    		console.log(this)
    		return(
	    			<div className="item-container">
	    				<p className={itemTxtCssClass}>{this.props.item.get("task")}</p>
	    				<div className="item-butt-container">
	    					<button className="done-button"  onClick ={this._lineThrough}>{btnTxt}</button>
	    					<button className="remove-button" onClick={this._clickHandler}>Remove</button>
	    				</div>
	    			</div>
    		)
    	}
    })


    var app = new ToDoRouter()
}


app()

