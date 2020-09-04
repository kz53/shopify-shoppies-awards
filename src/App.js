import React from 'react';
import './App.css';

class Results extends React.Component {
  checkIfNom(id) { 
    const filtered = this.props.noms.filter((x)=>id == x.imdbID);
    return filtered.length > 0;
  }
  render() {
    const films = this.props.films;
    const selected = this.props.selected;
    const posterStr = selected == null?'':selected.Poster;
    const plotStr = selected == null?'':selected.Plot;
    
    const filmList = films.map((film) => {
        const added = this.checkIfNom(film.imdbID) || this.props.noms.length >= 5?'added':'';
        return(
          <div className="result-row" key={film.imdbID}>
            <div className={`add-button ${added}`} onClick={()=>this.props.add(film)} >Nominate</div>
            <div className={`result-name`} onClick={()=>this.props.deets(film.imdbID)}>
              {film.Title} ({film.Year})
            </div>
          </div>
        )
      }
    )
    return(
      <div className="flex">
        <div className="result-box">
          <div>Showing results for "{this.props.term}".</div>
          {/* <ul>{filmList}</ul>  */}
          {filmList}
        </div>
        <div className="preview-box">
          <div>Details:</div>
          <div className="poster-plot">
            <div className="plot">{plotStr}</div>
            <img className="poster" src={posterStr} />
          </div>
        </div>
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
        <div className="nom-name">{film.Title} ({film.Year})</div>
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
    return str;
  }

  getResults(queryStr) {
    const encodedStr = this.encodeStr(queryStr);
    fetch("http://www.omdbapi.com/?apikey=fdf02835&s&page=1&type=movie&s=" + encodedStr)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.Response  == "False"){
            console.log("error")
          }
          else{
            console.log("result");
            console.log(result);
            this.setState({searchResults: result.Search, activeSelect: null});
          }

          // this.setState({
          //   isLoaded: true,
          //   items: result.items
          // });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          
          // this.setState({
          //   isLoaded: true,
          //   error
          // });
        }
      )
  }

  getDeets(id) {
    fetch("http://www.omdbapi.com/?apikey=fdf02835&s&page=1&type=movie&plot=short&i=" + id)
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

          // this.setState({
          //   isLoaded: true,
          //   items: result.items
          // });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          
          // this.setState({
          //   isLoaded: true,
          //   error
          // });
        }
      )
  }

  handleChange(event) {
    this.getResults(event.target.value);
    this.setState({searchTerm: event.target.value,});
  }

  render() {
    const have5 = this.state.nominations.length >= 5 ? 'banner-show' : 'banner-hide';
    return (
      <div className="main-container">
        <h2>The Shoppies</h2>
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
