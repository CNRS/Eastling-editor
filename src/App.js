import React from 'react';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';

import Metadata from './Components/Metadata';
import DisplayOptions from './Components/DisplayOptions';
import Player from './Components/Player';
import Annotations from './Components/Annotations';

import './App.css';

const parserUrl = "https://eastling.huma-num.fr/player/parserMySQL.php";

class App extends React.Component {

	constructor(props) {
	    super(props);
	    this.state = {
	    	hasPrimaryId : false,
	    	hasSecondaryId : false,
	    	isMediaLoaded : false,
	    	isAnnotationsLoaded : false,
	    	hasMediaError : false,
	    	mediaError : {},
			hasAnnotationsError : false,
	    	annotationsError : {},
			METADATA: {},
	      	MEDIAFILE : {},
			annotations : {},
			doi : '',
			images : [],
			displayOptions : {},
			langOptions : {
				transcriptions:[],translations:[]
			},
			options : {},
			isWordList : false,
			timeList : []
	    };
	  }



	getUrlParameter (sVar) {
		return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
	}

	componentDidMount(){
	  	//15/07/2020 : changement suggéré par Edouard Sombié. oai_primary pour le média (audio, vidéo), oai_secondary pour le fichier d'annotations
	  	var oai_primary = this.getUrlParameter("oai_primary");
	  	var oai_secondary = this.getUrlParameter("oai_secondary");
	  	//25/08/2020 : récupérer les options d'affichage dans l'URL (Edouard SOMBIE)
	  	var optionTextTranscriptions = this.getUrlParameter("optionTextTranscriptions");
	  	var optionTextTranslations = this.getUrlParameter("optionTextTranslations");
	  	var optionSentenceTranscriptions = this.getUrlParameter("optionSentenceTranscriptions");
	  	var optionSentenceTranslations = this.getUrlParameter("optionSentenceTranslations");
	  	var optionWordTranscriptions = this.getUrlParameter("optionWordTranscriptions");
	  	var optionWordTranslations = this.getUrlParameter("optionWordTranslations");
	  	var optionMorphemeTranscriptions = this.getUrlParameter("optionMorphemeTranscriptions");
	  	var optionMorphemeTranslations = this.getUrlParameter("optionMorphemeTranslations");
	  	var optionWholeTranscriptions = this.getUrlParameter("optionWholeTranscriptions");
	  	var optionWholeTranslations = this.getUrlParameter("optionWholeTranslations");
	  	var optionWords = this.getUrlParameter("optionWords");
	  	var optionNotes = this.getUrlParameter("optionNotes");
	  	var optionGlosses = this.getUrlParameter("optionGlosses");
	  	var optionLang = this.getUrlParameter("lang");

	  	//28/08/2020
	  	//TODO gérer option Lang soit fr soit en, par défaut FR dans URL pour les translations options et libellés
	  	this.setState({
	        displayOptions: {
	        	textTranscriptions : (optionTextTranscriptions.length > 0) ? optionTextTranscriptions.split('+') : [],
	        	textTranslations : (optionTextTranslations.length > 0) ? optionTextTranslations.split('+') : [],
	        	sentenceTranscriptions : (optionSentenceTranscriptions.length > 0) ? optionSentenceTranscriptions.split('+') : [],
	        	sentenceTranslations : (optionSentenceTranslations.length > 0) ? optionSentenceTranslations.split('+') : [],
	        	wordTranscriptions : (optionWordTranscriptions.length > 0) ? optionWordTranscriptions.split('+') : [],
	        	wordTranslations : (optionWordTranslations.length > 0) ? optionWordTranslations.split('+') : [],
	        	morphemeTranscriptions : (optionMorphemeTranscriptions.length > 0) ? optionMorphemeTranscriptions.split('+') : [],
	        	morphemeTranslations : (optionMorphemeTranslations.length > 0) ? optionMorphemeTranslations.split('+') : [],
	        	notes : (optionNotes.length > 0) ? optionNotes.split('+') : [],
	        	words : (optionWords.length > 0) ? (optionWords === 'true') : true,
	        	lang : (optionLang.length > 0) ? optionLang : 'fr',
	        },
	    });

	  	
	  	if(oai_primary.length > 0){

	  		this.setState({
	            hasPrimaryId: true,
	        });

	        fetch(parserUrl+"?oai_primary="+oai_primary)
		      .then(res => res.json())
		      .then(
		        (result) => {

			        	var mediaType = "";
			        	var mediaUrl = "";

			        	if(result.audio !=null){
			        		mediaType = "audio";
			        		mediaUrl = result.audio;
			        	}
			        	if(result.video !=null){
			        		mediaType = "video";
			        		mediaUrl = result.video;
			        	}
			        	

			        	this.setState({
				            isMediaLoaded: true,
				            METADATA :  {"data":result.metadata},
				            MEDIAFILE : {"type":mediaType,"url":mediaUrl},
				            images : result.images
				          });
			        
 
		        },
		        // Remarque : il est important de traiter les erreurs ici
		        // au lieu d'utiliser un bloc catch(), pour ne pas passer à la trappe
		        // des exceptions provenant de réels bugs du composant.
		        (error) => {
		          console.log(error);

		        }
		      )
	  	}

	  	if(oai_secondary.length > 0){

	  		this.setState({
	            hasSecondaryId: true,
	        });

	        fetch(parserUrl+"?oai_secondary="+oai_secondary)
		    //fetch('https://eastling.huma-num.fr/player/parserFake.php?oai_secondary=EEE')
		      .then(res => res.json())
		      .then(
		        (result) => {
		        	console.log(result);
			        if(result.annotations["TEXT"] == undefined || result.annotations["WORDLIST"] == undefined ){
			        	this.setState({
				            isAnnotationsLoaded: true,
				            hasAnnotationsError:true,
				            annotationsError: "No result"
				          });
			        }else{	
			        	//27/08/2020 : options de langues
			        	if(result.annotations.WORDLIST !== undefined && result.annotations.WORDLIST !== null){
			        		var isWordList = (result.annotations.WORDLIST.W !== undefined && result.annotations.WORDLIST.W !== null) ? true : false;
			        	}

			        	this.setState({
			        		langOptions: result.langues,
			        		options: result.typeOf,
			        		timeList: result.timeList,
			        		displayOptions:{
					        	textTranscriptions : (optionTextTranscriptions.length > 0) ? optionTextTranscriptions.split('+') : [result.typeOf.text.transcriptions[0]],
					        	textTranslations : (optionTextTranslations.length > 0) ? optionTextTranslations.split('+') : [result.typeOf.text.translations[0]],
					        	sentenceTranscriptions : (optionSentenceTranscriptions.length > 0) ? optionSentenceTranscriptions.split('+') : [result.typeOf.sentence.transcriptions[0]],
					        	sentenceTranslations : (optionSentenceTranslations.length > 0) ? optionSentenceTranslations.split('+') : [result.typeOf.sentence.translations[0]],
					        	wordTranscriptions : (optionWordTranscriptions.length > 0) ? optionWordTranscriptions.split('+') : [result.typeOf.word.transcriptions[0]],
					        	wordTranslations : (optionWordTranslations.length > 0) ? optionWordTranslations.split('+') : [result.typeOf.word.translations[0]],
					        	morphemeTranscriptions : (optionMorphemeTranscriptions.length > 0) ? optionMorphemeTranscriptions.split('+') : [result.typeOf.morpheme.transcriptions[0]],
					        	morphemeTranslations : (optionMorphemeTranslations.length > 0) ? optionMorphemeTranslations.split('+') : [result.typeOf.morpheme.translations[0]],
					        	notes : (optionNotes.length > 0) ? optionNotes.split('+') : [result.typeOf.note.translations[0]],
					        	words : (optionWords.length > 0) ? (optionWords === 'true') : true,
			        		},
				            isAnnotationsLoaded: true,
				            annotations : result.annotations,
				            doi : result.doi,
				            isWordList : isWordList
				        });
			        }
			        
 
		        },
		        // Remarque : il est important de traiter les erreurs ici
		        // au lieu d'utiliser un bloc catch(), pour ne pas passer à la trappe
		        // des exceptions provenant de réels bugs du composant.
		        (error) => {
		          console.log(error);

		        }
		      )
	  	}

	  }


	  render(){
	  	console.log("render App");
	  	return (
		    <div className="App">	

		    	{ 
		    	 	this.state.hasPrimaryId
		    	 	?
		    	 	[
		    	 	this.state.isMediaLoaded 
		    	 	? 
		    	 	[
		    	 	this.state.hasMediaError 
		    	 	?
		    	 	<Container>
					    <p>Error executing request to OAI-PMH:</p>
					    <p>Code :{this.state.mediaError.code}</p>
					    <p>Details :{this.state.mediaError.text}</p>
			    	</Container>
		    	 	:
		    	 	<Container>
					    {/* <Metadata file={this.state.METADATA} /> */}
					    <Player file={this.state.MEDIAFILE} />
			    	</Container>
			    	]
			    	:
			    	<CircularProgress />
			    	]
			    	:
			    	<div>No Media</div>
			    }

			    { 
		    	 	this.state.hasSecondaryId
		    	 	?
		    	 	[
		    	 	this.state.isAnnotationsLoaded 
		    	 	? 
		    	 	[
		    	 	this.state.hasAnnotationsError 
		    	 	?
		    	 	<Container>
					    <p>Error getting annotations :</p>
					    <p>Code :{this.state.annotationsError.code}</p>
					    <p>Details :{this.state.annotationsError.text}</p>
			    	</Container>
		    	 	:
		    	 	<div key={this.state.doi}>
		    	 	<Container>
					    <DisplayOptions displayOptions={this.state.displayOptions} options={this.state.options} langOptions={this.state.langOptions} isWordList={this.state.isWordList} />
			    	</Container>
			    	<Container>
 						<Annotations timeList={this.state.timeList} doi={this.state.doi} options={this.state.options} displayOptions={this.state.displayOptions} annotations={this.state.annotations} images={this.state.images} video={this.state.MEDIAFILE.type==="video"} />
 			    	</Container>
 			    	</div>
			    	]
			    	:
			    	<CircularProgress />
			    	]
			    	:
			    	<div>No Annotations</div>
			    }
		    </div>
		  );
	  }
  
}

export default App;
