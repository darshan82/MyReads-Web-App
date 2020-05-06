import React from "react";
import * as BooksAPI from "./BooksAPI";
import "./App.css";
import Dashboard from "./components/Dashboard";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Search from "./components/Search";
class BooksApp extends React.Component {
  state = {loading:true};
  getAlltToState = () => {
    BooksAPI.getAll()
      .then((response) => {
        this.setState({loading:false})
        let wantToRead = [],
          read = [],
          currentlyReading = [];
        response.forEach((book) => {
          const { shelf } = book;
          if (shelf === "currentlyReading") {
            currentlyReading.push(book);
          } else if (shelf === "wantToRead") {
            wantToRead.push(book);
          } else if (shelf === "read") {
            read.push(book);
          }
        });

        this.setState({
          currentlyReading,
          wantToRead,
          read,
          searchedResponse: [],
        });
      })
      .catch((err) => {
        this.setState({loading:false})
        console.log("Error fetching data", err);
      });
  };
  //change the shelf of the book and update the book shelf on server
  shelfChanger = (book, event) => {
    let prevShelf = book.shelf;
    const newShelf =
      event.target.value !== "none" ? event.target.value : "null";
    let update =
      prevShelf !== "none"
        ? this.state[prevShelf].filter((rec) => rec.id !== book.id)
        : "null";

    newShelf !== "null"
      ? this.setState((state) => ({
          [prevShelf]: update,
          [newShelf]: [...state[newShelf], book],
        }))
      : this.setState((state) => ({
          [prevShelf]: update,
        }));
    book.shelf = newShelf;
    BooksAPI.update(book, newShelf)
      .then()
      .catch((error) => {
        alert("data updation fail");
      });
  };
  findShelf = (id) => {
    const { wantToRead, read, currentlyReading } = this.state;
    const allBooks = [...wantToRead, ...read, ...currentlyReading];
    let filterArr = allBooks.filter((book) => id === book.id);
    return filterArr.length !== 0 ? filterArr[0].shelf : "none";
  };

  searchBooks = (query) => {
    query &&
      BooksAPI.search(query).then((books) => {
        if (!books.error) {
          let searchBooks = books.map((book) => {
            book.shelf = this.findShelf(book.id);
            return book;
          });
          this.setState({
            searchedResponse: searchBooks,
          });
        } else {
          this.setState({
            searchedResponse: [],
          });
        }
      });
  };
  componentDidMount() {
    this.getAlltToState();
  }

  render() {
    const { searchedResponse, wantToRead, currentlyReading, read } = this.state;
    return (
      <div>
        {wantToRead ? (
          <BrowserRouter>
            <Switch>
              <Route
                exact
                path="/"
                render={() => (
                  <Dashboard
                    wantToRead={wantToRead}
                    currentlyReading={currentlyReading}
                    read={read}
                    shelfChanger={this.shelfChanger}
                  />
                )}
              />
              <Route
                path="/search"
                render={() => (
                  <Search
                    searchedResponse={searchedResponse}
                    searchBooks={this.searchBooks}
                    shelfChanger={this.shelfChanger}
                  />
                )}
              />
            </Switch>
          </BrowserRouter>
        )
      :
      <div class="loading-container">
      <div class="loading"></div>
      <div id="loading-text">loading</div>
  </div>
  
      }
      </div>
    );
  }
}

export default BooksApp;
