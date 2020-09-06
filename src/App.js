import React from 'react';
import './App.css';
import orangeFilm from './orange-film.png';

const Modal = ({ handleClose, show, children }) => {
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        {children}
        <div className="modal-close" onClick={handleClose}><b>X</b></div>
      </section>
    </div>
  );
};

class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: false }; 
  }

  componentDidMount(){
    window.addEventListener('resize', ()=>this.handleResize());
  }

  handleResize() {
    if (window.innerWidth>600) {
      this.hideModal();
    }
  }

  showModal = () => {
    this.setState({ show: window.innerWidth<=600, });
  };

  hideModal = () => {
    this.setState({ show: false });
  };

  checkIfNom(id) { 
    const filtered = this.props.noms.filter((x)=>id == x.imdbID);
    return filtered.length > 0;
  }
  render() {
    const films = this.props.films;
    const selected = this.props.selected;
    const hasResults = films.length == 0;
    const resultsStr = hasResults 
      ?'Start typing to see some results'
      :<span>
        Showing results for <span className="search-term">"{this.props.term}"</span>.  &nbsp; Click on a title to see more info.
      </span>
    const posterStr = selected == null?'':selected.Poster;
    const plotStr = selected == null?'':selected.Plot;
    const directorStr = selected == null?'':selected.Director;
    const actorsStr = selected == null?'':selected.Actors;
    const titleStr = selected == null?'':selected.Title + ` (${selected.Year})`;
    
    const filmList = films.map((film) => {
        const added = this.checkIfNom(film.imdbID) || this.props.noms.length >= 5?'added':'';
        return(
          <div className="result-row" key={film.imdbID}>
            <div className={`add-button ${added}`} onClick={()=>this.props.add(film)} >Nominate</div>
            <div className={`result-name`} onClick={()=>{this.showModal();this.props.deets(film.imdbID)}}>
              {film.Title} ({film.Year})
            </div>
          </div>
        )
      }
    )
    return(
      <div className="flex">
        <div className="result-box box-shadow">
          <div className="results-title">{resultsStr}</div>
          {/* <ul>{filmList}</ul>  */}
          {filmList}
        </div>
        <div className="preview-box box-shadow">
          <div className="preview-title">Details:</div>
          <div className="poster-plot">
            <div className="selected-title"><b>{titleStr}</b></div>
            <div className={`plot ${selected==null?'hidden':''}`}><b>Plot:</b> {plotStr}</div>
            <div className={`plot ${selected==null?'hidden':''}`}><b>Director:</b> {directorStr}</div>
            <div className={`plot ${selected==null?'hidden':''}`}><b>Actors:</b> {actorsStr}</div>
            <img className="poster" src={posterStr} />
          </div>
        </div>
        <Modal show={this.state.show} handleClose={this.hideModal}>
            <div className="modal-poster-plot">
              <div className="selected-title"><b>{titleStr}</b></div>
              <div className={`plot ${selected==null?'hidden':''}`}><b>Plot:</b> {plotStr}</div>
              <div className={`plot ${selected==null?'hidden':''}`}><b>Director:</b> {directorStr}</div>
              <div className={`plot ${selected==null?'hidden':''}`}><b>Actors:</b> {actorsStr}</div>
              <div className="modal-poster"><img className="poster" src={posterStr} /></div>
            </div>
        </Modal>
      </div>
    ) 
  }
}

class Nominations extends React.Component {
  
  render() {
    const films = this.props.films;
    const filmList = films.map((film) =>
      <div className="nom-item" key={film.imdbID}>
        <div className="delete-button flex" onClick={()=>this.props.delete(film.imdbID)}>X</div>
        <div className="nom-name"><b>{film.Title} ({film.Year})</b></div>
      </div>
    )

    return(
      <div className="nom-row">
        {filmList}
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      nominations: [],
      searchResults: [], 
      searchTerm: "", 
      hasMounted: false,
      activeSelect: null,
    }
  }
  
  componentDidMount() {
    document.title = 'Welcome to the Shoppies 2020!';
  }
  
  handleAdd(film){ 
    const nominations = this.state.nominations;
    const filtered = this.state.nominations.filter((x)=>film.imdbID == x.imdbID); 
    if (filtered.length == 0 && this.state.nominations.length < 5) {
      nominations.push(film); 
      this.setState({nominations: nominations,});
    }  
  }

  handleDelete(filmID){
    const filtered = this.state.nominations.filter((film)=>film.imdbID != filmID); 
    console.log("filter", filtered)
    this.setState({nominations: filtered,});
  }

  encodeStr(str){
    return encodeURIComponent(str);
  }

  getResults(queryStr) {
    const encodedStr = this.encodeStr(queryStr);
    fetch("https://www.omdbapi.com/?apikey=fdf02835&s&page=1&type=movie&s=" + encodedStr)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.Response  == "False"){
            console.log("error")
          }
          else{
            console.log("result");
            console.log(result);
            let cleaned = [];
            let ids = new Set();
            for (let item of result.Search) {
              if (!ids.has(item.imdbID)) {
                cleaned.push(item);
                ids.add(item.imdbID);
              }
              else {
                //pass
              }
            }
            this.setState({searchResults: cleaned, activeSelect: null});
          }
        },
        (error) => {

        }
      )
  }

  getDeets(id) {
    fetch("https://www.omdbapi.com/?apikey=fdf02835&s&page=1&type=movie&plot=short&i=" + id)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.Response  == "False"){
            console.log("error")
          }
          else{
            console.log("deets");
            console.log(result);
            this.setState({activeSelect: result});
          }
        },
        (error) => {

        }
      )
  }

  handleChange(event) {
    this.getResults(event.target.value);
    this.setState({searchTerm: event.target.value,});
  }

  render() {
    const have5 = this.state.nominations.length >= 5 ? 'banner-show' : '';
    return (
      <div className="main-container">
        <div className="flex">
          <div className="logo-container">
            <img className="logo-pic" src={orangeFilm} />
          </div>
          <div className="title-container">
            <div className="title-1">The </div>
            <div className="title-2">Shoppies</div>
          </div>
        </div>
        <div className={`banner ${have5}`}>Great! You have enough entries!</div>
        <div className="main-bar">
          <input className="search-bar" placeholder="Choose 5 entries to nominate" onChange={(event)=>this.handleChange(event)} />
          <Nominations delete={(id)=>this.handleDelete(id)} films={this.state.nominations} />
          {/* <button onClick={()=>this.getResults(this.state.searchTerm)}>click me</button> */}
        </div>
        <div className="results">
          <Results 
            add={(film)=>this.handleAdd(film)} 
            films={this.state.searchResults} 
            term={this.state.searchTerm} 
            noms={this.state.nominations} 
            deets={(id)=>this.getDeets(id)}
            selected={this.state.activeSelect}
          />
        </div>
      </div>
    );
  }
}

export default App;
