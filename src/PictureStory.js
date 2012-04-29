var PictureStory = PictureStory || {};

PictureStory.Main = function( parameters ) {

    parameters = parameters || {};

    this.index = 0;
    this.frameStep = 1;
    this.cardNum = ( parameters.cardNum !== undefined ) ? parameters.cardNum : 1;
    this.width = ( parameters.width !== undefined ) ? parameters.width : 640;
    this.height = ( parameters.height !== undefined ) ? parameters.height : 480;
    this.pictureCards = [];

    this.init();
    this.initEvents();
    this.initCards();
};
PictureStory.Main.prototype = {
    constructor: PictureStory.Main,

    init: function() {
	this.scene = new THREE.Scene();
	this.root_obj = new THREE.Object3D();
	this.scene.add( this.root_obj );

	this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	this.camera.position.z = 800;
	this.scene.add( this.camera );

	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.renderer.setClearColorHex( 0x000000, 1.0 );
	var context = this.renderer.getContext();
	context.depthFunc( context.LESS );

	document.body.appendChild( this.renderer.domElement );

	this.trackball = new THREE.TrackballControls( this.camera, this.renderer.domElement );
    },

    initEvents: function() {
	$( this.renderer.domElement ).bind( "mouseup", this.onMouseUp );
// 	$( this.renderer.domElement ).keypress( 
// 	    function( event ) {
// 		PictureStory.Main.Event = event;
// 	    }
// 	);
    },

    initCards: function() {
	for( var i = 0; i < this.cardNum; i++ ) {
	    var card = new PictureStory.PictureCard( { width: this.width, height: this.height } );
	    this.pictureCards.push( card );
	    this.root_obj.add( card.mesh );
	}

	this.pictureCards[0].setState( PictureStory.PictureCard.StateDisp );
    },

    getCard: function( index ) {
	//		return this.pictureCards[this.cardNum - index - 1];
	return this.pictureCards[index];
    },

    onMouseUp: function( event ) {
	PictureStory.Main.Event = event;
    },

    eventProc: function() {
	if( PictureStory.Main.Event != null ) {
	    switch( PictureStory.Main.Event.button ) {
	    case 0:
		if( this.index < this.cardNum ) {
		    this.pictureCards[this.index].setState( PictureStory.PictureCard.StateTurnOver );
		    this.index++;
		    if( this.index < this.cardNum ) {
			this.pictureCards[this.index].setState( PictureStory.PictureCard.StateDisp );
		    }
		}
		break;
	    }
	}
	PictureStory.Main.Event = null;
    },

    render: function() {
	this.eventProc();

	for( var i = 0; i < this.cardNum; i++ ) {
	    var card = this.pictureCards[i];
	    card.update( this.frameStep );
	}

	this.trackball.update();
	this.renderer.render( this.scene, this.camera );
    },
};
PictureStory.Main.Event = null;

PictureStory.PictureCard = function( parameters ) {
    parameters = parameters || {};

    this.frame = 0;
    this.state = PictureStory.PictureCard.StateWait;
    this.width = ( parameters.width !== undefined ) ? parameters.width : 640;
    this.height = ( parameters.height !== undefined ) ? parameters.height : 480;

    this.init();
};
PictureStory.PictureCard.prototype = {
    constructor: PictureStory.PictureCard,

    init: function() {
	if( PictureStory.PictureCard.Geometry == null ) {
	    PictureStory.PictureCard.Geometry = new THREE.PlaneGeometry( this.width, this.height );
	    var matrix = new THREE.Matrix4();
	    matrix.setTranslation( 0, this.height / 2, 0 );
	    PictureStory.PictureCard.Geometry.applyMatrix( matrix );
	}
	if( PictureStory.PictureCard.Material == null ) {
	    PictureStory.PictureCard.Material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
	}

	this.mesh = new THREE.Mesh( PictureStory.PictureCard.Geometry, PictureStory.PictureCard.Material );
	this.mesh.position.y = -this.height / 2;
    },

    addPicture: function( parameters ) {
	parameters = parameters || {};

	var pictures = ( parameters.pictures !== undefined ) ? parameters.pictures : [];
	for( index in pictures ) {

	    // 			var picture = pictures[index];

	    // 			var texture = THREE.ImageUtils.loadTexture( picture.image );
	    // 			var geometry = new THREE.PlaneGeometry( picture.width, picture.height );
	    // 			var matrix = new THREE.Matrix4();
	    // 			matrix.setTranslation( picture.width / 2 - this.width / 2, picture.height / 2 + this.height - picture.height, 0 );
	    // 			geometry.applyMatrix( matrix );
	    // 			var material = new THREE.MeshBasicMaterial( { color: 0xffffff, map: texture } );
	    // 			sprite = new THREE.Mesh( geometry, material );

	    // 			sprite.position.x = ( picture.x !== undefined ) ? picture.x : 0;
	    // 			sprite.position.y = ( picture.y !== undefined ) ? -picture.y : 0;
	    // 			sprite.position.z = ( picture.z !== undefined ) ? picture.z : 0;

	    // 			this.mesh.add( sprite );

	    var param = pictures[index];
	    param.root_width = this.width;
	    param.root_height = this.height;
	    var picture = new PictureStory.Picture( param );
	    this.mesh.add( picture.mesh );
	}
    },

    setState: function( state ) {
	this.state = state;
	this.frame = 0;
    },

    setVisible: function( isVisible ) {
	this.mesh.visible = isVisible;

	for( index in this.mesh.children ) {
	    this.mesh.children[index].visible = isVisible;
	}
    },

    update: function( step ) {
	switch( this.state ) {
	case PictureStory.PictureCard.StateWait:
	    this.setVisible( false );
	    break;
	case PictureStory.PictureCard.StateDisp:
	    this.setVisible( true );
	    break;
	case PictureStory.PictureCard.StateTurnOver:
	    this.setVisible( true );
	    this.animeTurnOver();
	    if( this.frame >= 60 ) {
		this.setState( PictureStory.PictureCard.StateEnd );
	    }
	    break;
	case PictureStory.PictureCard.StateEnd:
	    this.setVisible( false );
	    break;
	}

	this.frame += step;
    },

    animeTurnOver: function() {
	var factor = this.frame / 60;
	factor = factor * factor;

	this.mesh.rotation.x = factor * 90 * 2 * Math.PI / 360;
    },
};
PictureStory.PictureCard.Geometry = null;
PictureStory.PictureCard.Material = null;

PictureStory.PictureCard.StateWait = 0
PictureStory.PictureCard.StateDisp = 1;
PictureStory.PictureCard.StateTurnOver = 2;
PictureStory.PictureCard.StateEnd = 3;

PictureStory.Picture = function( parameters ) {
    parameters = parameters || {};

    this.init( parameters );
};
PictureStory.Picture.prototype = {
    constructor: PictureStory.Picture,

    init: function( parameters ) {
	var texture = THREE.ImageUtils.loadTexture( parameters.image );
	var geometry = new THREE.PlaneGeometry( parameters.width, parameters.height );
	var matrix = new THREE.Matrix4();
	matrix.setTranslation( parameters.width / 2 - parameters.root_width / 2, parameters.height / 2 + parameters.root_height - parameters.height, 0 );
	geometry.applyMatrix( matrix );
	var material = new THREE.MeshBasicMaterial( { color: 0xffffff, map: texture, alphaTest: 0.9 } );
	this.mesh = new THREE.Mesh( geometry, material );

	this.mesh.position.x = ( parameters.x !== undefined ) ? parameters.x : 0;
	this.mesh.position.y = ( parameters.y !== undefined ) ? -parameters.y : 0;
	this.mesh.position.z = ( parameters.z !== undefined ) ? parameters.z : 0;

	this.mesh.visible = false;
    },

};
