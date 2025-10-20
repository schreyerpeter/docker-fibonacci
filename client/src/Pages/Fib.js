import React, { Component } from "react";
import axios from "axios";

export default class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: "",
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  async fetchValues() {
    const res = await axios.get("/api/values/current");
    this.setState({ values: res.data });
  }

  async fetchIndexes() {
    const res = await axios.get("/api/values/all");
    this.setState({ seenIndexes: res.data });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/values", {
      index: this.state.index,
    });
    this.setState({ index: "" });
    this.fetchIndexes();
    this.fetchValues();
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index:</label>
          <input
            value={this.state.index}
            onChange={(e) => this.setState({ index: e.target.value })}
          />
          <button>Submit</button>
        </form>
        <h3>Indexes I have seen:</h3>
        <ul>
          {this.state.seenIndexes.map(({ number }) => (
            <li key={number}>{number}</li>
          ))}
        </ul>
        <h3>Calculated Values:</h3>
        <ul>
          {Object.entries(this.state.values).map(([key, value]) => (
            <li key={key}>
              For index {key} I calculated {value}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
