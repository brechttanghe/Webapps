var app=angular.module("flapperNews",["ui.router","ngMaterial"]);
app.config(["$stateProvider",
	"$urlRouterProvider",
	function(t,e){
		t.state("home",{
			url:"/home",
			templateUrl:"/templates/home.html",
			controller:"MainCtrl",
			resolve:{postPromise:["posts",function(t){
				return t.getAll()
			}]}
		})
		.state("posts",{
			url:"/posts/{id}",templateUrl:"/templates/posts.html",
			controller:"PostsCtrl",
			resolve:{post:["$stateParams","posts",function(t,e){return e.get(t.id)}]}
		})
		.state("login",{
			url:"/login",templateUrl:"/templates/login.html",
			controller:"AuthCtrl",
			onEnter:["$state","auth",function(t,e){e.isLoggedIn()&&t.go("home")}]
		})
		.state("register",{
			url:"/register",templateUrl:"/templates/register.html",
			controller:"AuthCtrl",
			onEnter:["$state","auth",function(t,e){e.isLoggedIn()&&t.go("home")}]
		})
		.state("images",{
			url:"/images",
			templateUrl:"/templates/slider.html",controller:"SliderCtrl"
		}),
		e.otherwise("home")
	}]),
app.controller("AppCtrl",[
	"$scope",
	"$mdSidenav",
	function(t,e){
		t.toggleSidenav=function(t){e(t).toggle()}
	}
]),
app.controller("AuthCtrl",[
	"$scope",
	"$state",
	"auth",
	function(t,e,n){
		t.user={},
		t.register=function(){
			n.register(t.user).error(function(e){t.error=e}).then(function(){e.go("home")})
		},
		t.logIn=function(){
			n.logIn(t.user).error(function(e){t.error=e}).then(function(){e.go("home")})
		}
	}
]),
app.controller("MainCtrl",[
	"$scope",
	"posts",
	"auth",
	function(t,e,n){
		t.posts=e.posts,t.isLoggedIn=n.isLoggedIn,
		t.addPost=function(){t.title&&""!==t.title&&(e.create({title:t.title,link:t.link,author:"user"}),t.title="",t.link="")},
		t.incrementUpvotes=function(t){e.upvote(t)},
		t.decrementUpvotes=function(t){e.downvote(t)}
	}
]),
app.controller("NavCtrl",[
	"$scope",
	"auth",
	function(t,e){
		t.isLoggedIn=e.isLoggedIn,
		t.currentUser=e.currentUser,
		t.logOut=e.logOut
	}
]),
app.controller("PostsCtrl",[
	"$scope",
	"posts",
	"post",
	"auth",
	function(t,e,n,o){
		t.post=n,t.isLoggedIn=o.isLoggedIn,
		t.addComment=function(){""!==t.body&&(e.addComment(n._id,{body:t.body,author:"user"})
			.success(function(e){t.post.comments.push(e)}),t.body="")},
		t.incrementUpvotes=function(t){e.upvoteComment(n,t)},
		t.decrementUpvotes=function(t){e.downvoteComment(n,t)}
	}
]),
app.controller("SliderCtrl",[
	"$scope",
	function(t){
		t.images=[{src:"img1.png",title:"Pic 1"},{src:"img2.png",title:"Pic 2"},
			{src:"img3.png",title:"Pic 3"},{src:"img4.png",title:"Pic 4"},{src:"img5.png",title:"Pic 5"}
		]
	}
]),
app.directive("slider",[
	"$timeout",
	function(t){
		return{
			restrict:"AE",
			replace:!0,
			scope:{images:"="},
			link:function(e,n,o){
				e.currentIndex=0,
				e.next=function(){
					e.currentIndex=e.currentIndex<e.images.length-1?e.currentIndex+1:0
				},
				e.prev=function(){
					e.currentIndex=e.currentIndex>0?e.currentIndex-1:e.images.length-1
				},
				e.$watch("currentIndex",
					function(){
						e.images.forEach(function(t){t.visible=!1}),e.images[e.currentIndex].visible=!0
					}
				);
				var r,
				s=function(){r=t(function(){e.next(),r=t(s,5e3)},5e3)};
				s(),
				e.$on("$destroy",
					function(){t.cancel(r)}
				)
			},
			templateUrl:"/templates/templateurl.html"
		}
	}
]),
app.factory("auth",[
	"$http",
	"$window",
	function(t,e){
		var n={};
		return n.saveToken=function(t){e.localStorage["flapper-news-token"]=t},
		n.getToken=function(){return e.localStorage["flapper-news-token"]},
		n.isLoggedIn=function(){
			var t=n.getToken();
			if(t){
				var o=JSON.parse(e.atob(t.split(".")[1]));
				return o.exp>Date.now()/1e3
			}
			return!1
		},
		n.currentUser=function(){
			if(n.isLoggedIn()){
				var t=n.getToken(),
				o=JSON.parse(e.atob(t.split(".")[1]));
				return o.username
			}
		},
		n.register=function(e){
			return t.post("/register",e).success(
				function(t){n.saveToken(t.token)}
			)
		},
		n.logIn=function(e){
			return t.post("/login",e).success(
				function(t){n.saveToken(t.token)}
			)
		},
		n.logOut=function(){
			e.localStorage.removeItem("flapper-news-token")
		},n
	}
]),
app.factory("posts",[
	"$http",
	"auth",
	function(t,e){
		var n={posts:[]};
		return n.getAll=function(){
			return t.get("/posts").success(function(t){angular.copy(t,n.posts)})
		},
		n.create=function(o){
			return t.post("/posts",o,{headers:{Authorization:"Bearer "+e.getToken()}})
				.success(function(t){n.posts.push(t)})
		},
		n.upvote=function(n){
			return t.put("/posts/"+n._id+"/upvote",null,{headers:{Authorization:"Bearer "+e.getToken()}})
			.success(function(t){n.upvotes+=1})
		},
		n.downvote=function(n){
			return n.upvotes>0?t.put("/posts/"+n._id+"/downvote",null,{headers:{Authorization:"Bearer "+e.getToken()}})
			.success(function(t){n.upvotes-=1}):void 0
		},
		n.get=function(e){
			return t.get("/posts/"+e).then(function(t){return t.data})
		},
		n.addComment=function(n,o){
			return t.post("/posts/"+n+"/comments",o,{headers:{Authorization:"Bearer "+e.getToken()}})
		},
		n.upvoteComment=function(n,o){
			return t.put("/posts/"+n._id+"/comments/"+o._id+"/upvote",null,{headers:{Authorization:"Bearer "+e.getToken()}})
			.success(function(t){o.upvotes+=1})
		},
		n.downvoteComment=function(n,o){
			return o.upvotes>0?t.put("/posts/"+n._id+"/comments/"+o._id+"/downvote",null,{headers:{Authorization:"Bearer "+e.getToken()}})
			.success(function(t){o.upvotes-=1}):void 0
		},n
	}
]);
